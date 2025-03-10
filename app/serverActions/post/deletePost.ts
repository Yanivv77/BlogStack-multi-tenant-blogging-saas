"use server";

import prisma from "../../utils/db/prisma";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";
import { serverLogger } from "../../utils/logger";

/**
 * Soft deletes a post by setting the deletedAt timestamp
 */
export async function DeletePost(formData: FormData) {
  const logger = serverLogger("DeletePost");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required", null, { userId: null });
    return { error: "You must be logged in to delete a post" };
  }

  try {
    // Get postId and siteId from formData
    const postId = formData.get("postId") as string;
    const siteId = formData.get("siteId") as string;
    
    if (!postId) {
      logger.error("Post ID is missing", null, { userId: user.id });
      return { error: "Post ID is required" };
    }
    
    if (!siteId) {
      logger.error("Site ID is missing", null, { userId: user.id, postId });
      return { error: "Site ID is required" };
    }

    logger.debug("Verifying site ownership", { siteId, userId: user.id });
    
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return { error: "Site not found or you don't have permission" };
    }

    // Verify the post exists and belongs to the site
    logger.debug("Verifying post exists and belongs to site", { postId, siteId });
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!post) {
      logger.error("Post not found or doesn't belong to site", null, { postId, siteId });
      return { error: "Post not found or doesn't belong to this site" };
    }

    logger.info("Soft deleting post", { postId, title: post.title });
    
    // Soft delete the post by setting deletedAt
    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    logger.success("Post deleted successfully", { postId });
    return { success: true };
  } catch (error) {
    logger.error("Error deleting post", error);
    
    // Add detailed error logging
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    return { error: `Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 