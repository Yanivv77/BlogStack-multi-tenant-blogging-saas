"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { PostEditSchema } from "../../utils/validation/postSchema";
import { getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";
import { serverLogger } from "../../utils/logger";

// Define the correct return types
type ErrorResult = { status: "error"; error: Record<string, string[]> };
type SuccessResult = { status: "success"; error: Record<string, never> };
type ActionResult = ErrorResult | SuccessResult;

/**
 * Edits an existing post
 */
export async function EditPostActions(_prevState: any, formData: FormData): Promise<ActionResult | any> {
  const logger = serverLogger("EditPostActions");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required", null, { userId: null });
    return { 
      status: "error" as const, 
      error: { _form: ["You must be logged in to edit a post"] } 
    };
  }

  try {
    // Get postId and siteId from formData
    const postId = formData.get("postId") as string;
    const siteId = formData.get("siteId") as string;
    
    if (!postId) {
      logger.error("Post ID is missing", null, { userId: user.id });
      return { 
        status: "error" as const, 
        error: { _form: ["Post ID is required"] } 
      };
    }
    
    if (!siteId) {
      logger.error("Site ID is missing", null, { userId: user.id, postId });
      return { 
        status: "error" as const, 
        error: { _form: ["Site ID is required"] } 
      };
    }

    logger.debug("Verifying site ownership", { siteId, userId: user.id });
    
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return { 
        status: "error" as const, 
        error: { _form: ["Site not found or you don't have permission"] } 
      };
    }

    // Verify the post exists and belongs to the site
    logger.debug("Verifying post exists and belongs to site", { postId, siteId });
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!existingPost) {
      logger.error("Post not found or doesn't belong to site", null, { postId, siteId });
      return { 
        status: "error" as const, 
        error: { _form: ["Post not found or doesn't belong to this site"] } 
      };
    }

    logger.debug("Validating form data", { postId });
    
    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: PostEditSchema({
        isSlugUnique: async () => {
          const slug = formData.get("slug") as string;
          if (!slug) return false;
          
          logger.debug("Checking if slug is unique", { slug, postId, siteId });
          
          const existingPostWithSlug = await prisma.post.findFirst({
            where: {
              slug,
              siteId,
              id: { not: postId }, // Exclude the current post
            },
          });
          
          const isUnique = !existingPostWithSlug;
          logger.debug(`Slug '${slug}' is ${isUnique ? 'unique' : 'already taken'}`);
          return isUnique;
        },
        currentPostId: postId
      }),
      async: true,
    });

    if (submission.status !== "success") {
      logger.warn("Form validation failed", { errors: submission.error });
      return submission.reply();
    }

    logger.debug("Form validation successful");

    const {
      title,
      smallDescription,
      articleContent,
      slug,
      postCoverImage,
      contentImages: rawContentImages,
    } = submission.value;

    // Process content images
    let contentImages: string[] = [];
    if (rawContentImages) {
      try {
        contentImages = JSON.parse(rawContentImages as string);
        logger.debug("Processed content images", { count: contentImages.length });
      } catch (e) {
        logger.error("Error parsing content images", e);
        contentImages = [];
      }
    }

    logger.info("Updating post", { postId, title, slug });
    
    // Update the post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        smallDescription,
        articleContent,
        slug,
        postCoverImage: await toNullable(postCoverImage),
        contentImages: contentImages,
        updatedAt: new Date(),
      },
    });

    logger.success("Post updated successfully", { postId });
    
    // Return a proper submission result
    return { 
      status: "success" as const, 
      error: {} 
    };
  } catch (error) {
    logger.error("Error editing post", error);
    
    // Add detailed error logging
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    return { 
      status: "error" as const, 
      error: { 
        _form: [`Failed to edit post: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      } 
    };
  }
} 