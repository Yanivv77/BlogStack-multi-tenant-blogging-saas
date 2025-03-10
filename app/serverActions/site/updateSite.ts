"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { siteSchema } from "../../utils/validation/siteSchema";
import { getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";
import { serverLogger } from "../../utils/logger";

/**
 * Updates an existing site
 */
export async function UpdateSiteAction(_prevState: any, formData: FormData) {
  const logger = serverLogger("UpdateSiteAction");
  logger.start();
  
  // Log form data for debugging
  logger.debug("Form data received", {
    name: formData.get("name"),
    description: formData.get("description")?.toString().substring(0, 20) + "...",
    language: formData.get("language"),
    email: formData.get("email") ? "Present" : "Not provided",
    githubUrl: formData.get("githubUrl") ? "Present" : "Not provided",
    linkedinUrl: formData.get("linkedinUrl") ? "Present" : "Not provided",
    portfolioUrl: formData.get("portfolioUrl") ? "Present" : "Not provided",
    siteImageCover: formData.get("siteImageCover") ? "Present" : "Not provided",
    logoImage: formData.get("logoImage") ? "Present" : "Not provided",
  });
  
  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication error: User not logged in");
    return { error: { _form: ["You must be logged in to update a site"] } };
  }
  
  logger.info("User authenticated", { id: user.id, email: user.email });

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      logger.error("Validation error: Site ID is required");
      return { error: { _form: ["Site ID is required"] } };
    }

    // Verify the user owns the site
    logger.debug(`Verifying user owns site with ID: ${siteId}`);
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Authorization error: Site not found or user doesn't have permission", null, { siteId, userId: user.id });
      return { error: { _form: ["Site not found or you don't have permission"] } };
    }
    
    logger.debug("User verified as site owner");
    logger.debug("Validating form data with Zod schema");

    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: siteSchema,
      async: true,
    });

    if (submission.status !== "success") {
      logger.warn("Validation failed", { errors: submission.error });
      return submission.reply();
    }

    logger.info("Validation successful");
    
    const {
      name,
      description,
      language,
      email,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      siteImageCover,
      logoImage,
    } = submission.value;

    logger.info("Updating site in database", {
      id: siteId,
      name,
      userId: user.id,
    });

    // Update the site
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        name,
        description,
        language: language || "English",
        email: await toNullable(email),
        githubUrl: await toNullable(githubUrl),
        linkedinUrl: await toNullable(linkedinUrl),
        portfolioUrl: await toNullable(portfolioUrl),
        siteImageCover: await toNullable(siteImageCover),
        logoImage: await toNullable(logoImage),
      },
    });
    
    logger.success("Site updated successfully", {
      id: updatedSite.id,
      name: updatedSite.name,
      updatedAt: updatedSite.updatedAt,
    });

    // Return success with redirect URL
    logger.info("Redirecting to site dashboard");
    return { success: true, redirectUrl: `/dashboard/sites/${siteId}` };
  } catch (error: unknown) {
    logger.error("Error updating site", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    // Check for Prisma-specific errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      logger.error("Database error code", { code: (error as { code: string }).code });
      
      // Handle common Prisma error codes
      if ((error as { code: string }).code === 'P2002') {
        logger.error("Unique constraint violation", { 
          target: (error as { meta?: { target?: string[] } }).meta?.target 
        });
        return { error: { _form: ["A unique constraint was violated. Please check your inputs."] } };
      }
    }
    
    // Convert to the format expected by the form
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to update site: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 