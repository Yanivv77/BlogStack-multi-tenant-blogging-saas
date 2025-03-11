"use server";

import { redirect } from "next/navigation";
import prisma from "../../utils/db/prisma";
import { getAuthenticatedUser, verifyUserOwnsSite } from "../utils/helpers";
import { serverLogger } from "../../utils/logger";

/**
 * Deletes a site and all its associated posts
 */
export async function DeleteSite(formData: FormData) {
  const logger = serverLogger("DeleteSite");
  logger.start();
  
  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required", null, { userId: null });
    return { error: "You must be logged in to delete a site" };
  }

  // Check if the user exists in the database
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    if (!dbUser) {
      logger.info("User not found in database, creating user record", { userId: user.id });
      
      // Create the user in the database
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          profileImage: user.picture || null,
        },
      });
      
      logger.info("User created in database", { userId: user.id });
    } else {
      logger.debug("User exists in database", { userId: user.id });
    }
  } catch (userError) {
    logger.error("Error checking/creating user", userError, { userId: user.id });
    return { error: "Error with user account. Please try again." };
  }

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
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

    logger.info("Deleting posts associated with site", { siteId });
    // Delete all posts associated with the site
    await prisma.post.deleteMany({
      where: { siteId },
    });

    logger.info("Deleting site", { siteId, siteName: site.name });
    // Delete the site
    await prisma.site.delete({
      where: { id: siteId },
    });

    logger.success("Site deleted successfully", { siteId });
    return { success: true };
  } catch (error) {
    logger.error("Error deleting site", error);
    
    // Add detailed error logging
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    return { error: `Failed to delete site: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 