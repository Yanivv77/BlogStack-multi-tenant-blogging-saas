"use server";

import prisma from "../../utils/db";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Soft deletes a post by setting the deletedAt timestamp
 */
export async function DeletePost(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "You must be logged in to delete a post" };
  }

  try {
    // Get postId and siteId from formData
    const postId = formData.get("postId") as string;
    const siteId = formData.get("siteId") as string;
    
    if (!postId) {
      return { error: "Post ID is required" };
    }
    
    if (!siteId) {
      return { error: "Site ID is required" };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return { error: "Site not found or you don't have permission" };
    }

    // Verify the post exists and belongs to the site
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!existingPost) {
      return { error: "Post not found or doesn't belong to this site" };
    }

    // Soft delete the post by setting deletedAt
    await prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error: `Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 