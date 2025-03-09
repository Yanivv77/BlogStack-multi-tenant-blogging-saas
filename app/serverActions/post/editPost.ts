"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { PostEditSchema } from "../../utils/validation/postSchema";
import { getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";

// Define the correct return types
type ErrorResult = { status: "error"; error: Record<string, string[]> };
type SuccessResult = { status: "success"; error: Record<string, never> };
type ActionResult = ErrorResult | SuccessResult;

/**
 * Edits an existing post
 */
export async function EditPostActions(_prevState: any, formData: FormData): Promise<ActionResult | any> {
  const user = await getAuthenticatedUser();
  if (!user) {
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
      return { 
        status: "error" as const, 
        error: { _form: ["Post ID is required"] } 
      };
    }
    
    if (!siteId) {
      return { 
        status: "error" as const, 
        error: { _form: ["Site ID is required"] } 
      };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return { 
        status: "error" as const, 
        error: { _form: ["Site not found or you don't have permission"] } 
      };
    }

    // Verify the post exists and belongs to the site
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!existingPost) {
      return { 
        status: "error" as const, 
        error: { _form: ["Post not found or doesn't belong to this site"] } 
      };
    }

    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: PostEditSchema({
        isSlugUnique: async () => {
          const slug = formData.get("slug") as string;
          if (!slug) return false;
          
          const existingPostWithSlug = await prisma.post.findFirst({
            where: {
              slug,
              siteId,
              id: { not: postId }, // Exclude the current post
            },
          });
          
          return !existingPostWithSlug;
        },
        currentPostId: postId
      }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

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
      } catch {
        contentImages = [];
      }
    }

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

    // Return a proper submission result
    return { 
      status: "success" as const, 
      error: {} 
    };
  } catch (error) {
    console.error("Error editing post:", error);
    
    return { 
      status: "error" as const, 
      error: { 
        _form: [`Failed to edit post: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      } 
    };
  }
} 