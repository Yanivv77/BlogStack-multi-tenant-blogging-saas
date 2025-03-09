"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db";
import { PostCreationSchema } from "../../utils/zodSchemas";
import { createErrorResponse, getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Creates a new post (article)
 */
export async function CreatePostAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: { _form: ["You must be logged in to create a post"] } };
  }

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      return { error: { _form: ["Site ID is required"] } };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return { error: { _form: ["Site not found or you don't have permission"] } };
    }

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

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        smallDescription,
        articleContent,
        slug,
        postCoverImage: toNullable(postCoverImage),
        contentImages: contentImages,
        siteId,
        views: 0,
        likes: 0,
      },
    });

    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Error creating post:", error);
    
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 