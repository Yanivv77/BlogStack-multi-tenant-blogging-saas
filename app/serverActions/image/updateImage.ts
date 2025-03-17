"use server";

import prisma from "../../utils/db/prisma";
import { serverLogger } from "../../utils/logger";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Updates an image for a site or post
 */
export async function UpdateImage(formData: FormData) {
  const logger = serverLogger("UpdateImage");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required", null, { userId: null });
    return { error: "You must be logged in to update an image" };
  }

  try {
    // Get parameters from formData
    const imageUrl = formData.get("imageUrl") as string;
    const type = formData.get("type") as string;
    const siteId = formData.get("siteId") as string;
    const postId = formData.get("postId") as string;

    logger.debug("Image update request", { type, siteId, postId: postId || "N/A" });

    if (!imageUrl) {
      logger.error("Image URL is missing");
      return { error: "Image URL is required" };
    }

    if (!type) {
      logger.error("Image type is missing");
      return { error: "Image type is required" };
    }

    if (!siteId) {
      logger.error("Site ID is missing", null, { userId: user.id });
      return { error: "Site ID is required" };
    }

    logger.debug("Verifying site ownership", { siteId, userId: user.id });

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return { error: "Site not found or you don't have permission" };
    }

    // Update site image
    if (type === "site") {
      logger.info("Updating site cover image", { siteId });
      await prisma.site.update({
        where: { id: siteId },
        data: {
          siteImageCover: imageUrl,
        },
      });
      logger.success("Site cover image updated successfully", { siteId });
      return { success: true };
    }

    // Update site logo
    if (type === "logo") {
      logger.info("Updating site logo", { siteId });
      await prisma.site.update({
        where: { id: siteId },
        data: {
          logoImage: imageUrl,
        },
      });
      logger.success("Site logo updated successfully", { siteId });
      return { success: true };
    }

    // Update post cover image
    if (type === "post" && postId) {
      logger.debug("Verifying post exists and belongs to site", { postId, siteId });

      // Verify the post exists and belongs to the site
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postId,
          siteId,
        },
      });

      if (!existingPost) {
        logger.error("Post not found or doesn't belong to site", null, { postId, siteId });
        return { error: "Post not found or doesn't belong to this site" };
      }

      logger.info("Updating post cover image", { postId, title: existingPost.title });
      await prisma.post.update({
        where: { id: postId },
        data: {
          postCoverImage: imageUrl,
        },
      });
      logger.success("Post cover image updated successfully", { postId });
      return { success: true };
    }

    logger.error("Invalid image type or missing post ID", null, { type, postId: postId || "N/A" });
    return { error: "Invalid image type or missing post ID" };
  } catch (error) {
    logger.error("Error updating image", error);

    // Add detailed error logging
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return { error: `Failed to update image: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
