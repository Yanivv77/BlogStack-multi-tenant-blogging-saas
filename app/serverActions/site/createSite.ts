"use server";

import prisma from "../../utils/db/prisma";
import { SiteCreationSchema } from "../../utils/validation/siteSchema";
import { getAuthenticatedUser, toNullable } from "../utils/helpers";
import { parseWithZod } from "@conform-to/zod";

export async function CreateSiteAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: { _form: ["You must be logged in to create a site"] } };
  }

  try {
    // Validate form data using zod schema
    const submission = await parseWithZod(formData, {
      schema: SiteCreationSchema({
        async isSubdirectoryUnique() {
          const subdirectory = formData.get("subdirectory") as string;
          if (!subdirectory) return false;
          
          const existingSite = await prisma.site.findFirst({
            where: { subdirectory },
          });
          
          return !existingSite;
        },
      }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const {
      name,
      description,
      subdirectory,
      language,
      email,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      siteImageCover,
      logoImage,
    } = submission.value;

    // Create the site
    const newSite = await prisma.site.create({
      data: {
        name,
        description,
        subdirectory,
        userId: user.id,
        siteImageCover: await toNullable(siteImageCover),
        logoImage: await toNullable(logoImage),
        email: await toNullable(email),
        githubUrl: await toNullable(githubUrl),
        linkedinUrl: await toNullable(linkedinUrl),
        portfolioUrl: await toNullable(portfolioUrl),
        language: language || "English",
      },
    });

    // Return success with redirect URL
    return { success: true, redirectUrl: "/dashboard/sites" };
  } catch (error) {
    console.error("Error creating site:", error);
    
    // Convert to the format expected by the form
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to create site: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 