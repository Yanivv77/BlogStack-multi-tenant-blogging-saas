"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import prisma from "@/app/utils/db/prisma";
import { serverLogger } from "@/app/utils/logger";
import { CommonFields } from "@/app/utils/validation/common";
import { parseFormWithZod } from "@/app/utils/validation/conform";

import { getAuthenticatedUser } from "../utils/helpers";

/**
 * Schema for domain update validation
 */
const domainUpdateSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  customDomain: CommonFields.domain(),
});

/**
 * Server action to update a site's domain settings
 */
export async function UpdateDomain(formData: FormData) {
  const logger = serverLogger("UpdateDomain");
  logger.start();

  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      logger.error("Authentication required", null, { userId: null });
      return { error: "You must be logged in to update domain settings" };
    }

    // Validate form data
    const validationResult = parseFormWithZod(formData, domainUpdateSchema);

    if (validationResult.status !== "success") {
      const errors = validationResult.error || {};
      logger.warn("Validation failed", { errors });

      // Return the first error message
      if (errors.customDomain && errors.customDomain[0]) {
        return { error: errors.customDomain[0] };
      }
      if (errors.siteId && errors.siteId[0]) {
        return { error: errors.siteId[0] };
      }

      return { error: "Invalid form data" };
    }

    const { siteId, customDomain } = validationResult.value;

    // Get the site to check ownership
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      logger.warn("Site not found", { siteId });
      return { error: "Site not found" };
    }

    if (site.userId !== user.id) {
      logger.warn("Permission denied", { siteId, userId: user.id, siteUserId: site.userId });
      return { error: "You don't have permission to update this site" };
    }

    // Check if domain is already in use by another site
    if (customDomain) {
      const existingDomain = await prisma.site.findFirst({
        where: {
          customDomain: customDomain,
          id: { not: siteId },
        },
      });

      if (existingDomain) {
        logger.warn("Domain already in use", { customDomain, existingSiteId: existingDomain.id });
        return { error: "This domain is already in use by another site" };
      }
    }

    // For this example, we'll simulate domain verification
    // In a real app, you would implement actual domain verification logic
    const domainVerified = false; // Always start as unverified

    // Update the site with the new domain
    await prisma.site.update({
      where: { id: siteId },
      data: {
        customDomain: customDomain,
        domainVerified,
      },
    });

    logger.info("Domain updated successfully", { siteId, customDomain, verified: domainVerified });

    // Revalidate the site settings page
    revalidatePath(`/dashboard/sites/${siteId}/settings`);

    return {
      success: true,
      verified: domainVerified,
    };
  } catch (error) {
    logger.error("Error updating domain", error);
    return { error: "Failed to update domain settings" };
  }
}
