"use server";

import { redirect } from "next/navigation";
import prisma from "../../utils/db/prisma";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Deletes a site and all its associated posts
 */
export async function DeleteSite(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "You must be logged in to delete a site" };
  }

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      return { error: "Site ID is required" };
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return { error: "Site not found or you don't have permission" };
    }

    // Delete all posts associated with the site
    await prisma.post.deleteMany({
      where: { siteId },
    });

    // Delete the site
    await prisma.site.delete({
      where: { id: siteId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting site:", error);
    return { error: `Failed to delete site: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 