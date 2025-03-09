"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { siteSchema } from "../../utils/validation/siteSchema";
import { getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Updates an existing site
 */
export async function UpdateSiteAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: { _form: ["You must be logged in to update a site"] } };
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
      schema: siteSchema,
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

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

    // Update the site
    await prisma.site.update({
      where: { id: siteId },
      data: {
        name,
        description,
        language,
        email: await toNullable(email),
        githubUrl: await toNullable(githubUrl),
        linkedinUrl: await toNullable(linkedinUrl),
        portfolioUrl: await toNullable(portfolioUrl),
        siteImageCover: await toNullable(siteImageCover),
        logoImage: await toNullable(logoImage),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating site:", error);
    
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to update site: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 