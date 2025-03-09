"use server";

import prisma from "../../utils/db/prisma";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Updates an image for a site or post
 */
export async function UpdateImage(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "You must be logged in to update an image" };
  }

  try {
    // Get parameters from formData
    const imageUrl = formData.get("imageUrl") as string;
    const type = formData.get("type") as string;
    const siteId = formData.get("siteId") as string;
    const postId = formData.get("postId") as string;
    
    if (!imageUrl) {
      return { error: "Image URL is required" };
    }
    
    if (!type) {
      return { error: "Image type is required" };
    }
    
    if (!siteId) {
      return { error: "Site ID is required" };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return { error: "Site not found or you don't have permission" };
    }

    // Update site image
    if (type === "site") {
      await prisma.site.update({
        where: { id: siteId },
        data: {
          siteImageCover: imageUrl,
        },
      });
      return { success: true };
    }
    
    // Update site logo
    if (type === "logo") {
      await prisma.site.update({
        where: { id: siteId },
        data: {
          logoImage: imageUrl,
        },
      });
      return { success: true };
    }
    
    // Update post cover image
    if (type === "post" && postId) {
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

      await prisma.post.update({
        where: { id: postId },
        data: {
          postCoverImage: imageUrl,
        },
      });
      return { success: true };
    }

    return { error: "Invalid image type or missing post ID" };
  } catch (error) {
    console.error("Error updating image:", error);
    return { error: `Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 