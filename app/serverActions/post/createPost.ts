"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { PostCreationSchema } from "../../utils/validation/postSchema";
import { createErrorResponse, getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";
import { serverLogger } from "../../utils/logger";

/**
 * Creates a new post (article)
 */
export async function CreatePostAction(_prevState: any, formData: FormData) {
  const logger = serverLogger("CreatePostAction");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required");
    return await createErrorResponse("Authentication required");
  }

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      logger.error("Site ID is missing");
      return { error: { _form: ["Site ID is required"] } };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return { error: { _form: ["Site not found or you don't have permission"] } };
    }

    logger.debug("Site ownership verified", { siteId });

    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: PostCreationSchema({
        async isSlugUnique() {
          const slug = formData.get("slug") as string;
          if (!slug) return false;
          
          const existingPost = await prisma.post.findFirst({
            where: { slug, siteId },
          });
          
          return !existingPost;
        },
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
    let contentImages;
    if (rawContentImages) {
      try {
        // If it's already a string, parse it; otherwise keep it as is
        contentImages = typeof rawContentImages === 'string' 
          ? JSON.parse(rawContentImages) 
          : rawContentImages;
      } catch (e) {
        logger.error("Error parsing content images", e);
        contentImages = [];
      }
    } else {
      contentImages = [];
    }

    // Convert articleContent to proper JSON if it's a string
    let processedArticleContent;
    try {
      processedArticleContent = typeof articleContent === 'string' 
        ? JSON.parse(articleContent) 
        : articleContent;
    } catch (e) {
      logger.error("Error parsing article content", e);
      return { error: { _form: ["Invalid article content format"] } };
    }

    // Create the post with proper JSON fields
    try {
      const post = await prisma.post.create({
        data: {
          title,
          smallDescription,
          articleContent: processedArticleContent,
          slug,
          postCoverImage: await toNullable(postCoverImage),
          contentImages: contentImages,
          siteId,
          userId: user.id, // Add the userId from authenticated user
          views: 0,
          likes: 0,
        },
      });

      logger.success("Post created successfully", { postId: post.id });
      return { success: true, postId: post.id };
    } catch (dbError) {
      logger.error("Database error creating post", dbError);
      return { 
        error: { 
          _form: [`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`] 
        } 
      };
    }
  } catch (error) {
    logger.error("Error creating post", error);
    
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 