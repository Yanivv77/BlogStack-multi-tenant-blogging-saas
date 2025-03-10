"use server";

import prisma from "../../utils/db/prisma";
import { SiteCreationSchema } from "../../utils/validation/siteSchema";
import { getAuthenticatedUser, toNullable } from "../utils/helpers";
import { parseWithZod } from "@conform-to/zod";

export async function CreateSiteAction(_prevState: any, formData: FormData) {
  console.log("🚀 CreateSiteAction started");
  
  // Log form data for debugging
  console.log("📝 Form data received:", {
    name: formData.get("name"),
    description: formData.get("description")?.toString().substring(0, 20) + "...",
    subdirectory: formData.get("subdirectory"),
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
    console.error("❌ Authentication error: User not logged in");
    return { error: { _form: ["You must be logged in to create a site"] } };
  }
  
  console.log("👤 User authenticated:", { id: user.id, email: user.email });

  try {
    console.log("🔍 Validating form data with Zod schema");
    
    // Validate form data using zod schema
    const submission = await parseWithZod(formData, {
      schema: SiteCreationSchema({
        async isSubdirectoryUnique() {
          const subdirectory = formData.get("subdirectory") as string;
          if (!subdirectory) {
            console.log("❌ Subdirectory validation failed: No subdirectory provided");
            return false;
          }
          
          console.log(`🔍 Checking if subdirectory '${subdirectory}' is unique`);
          const existingSite = await prisma.site.findFirst({
            where: { subdirectory },
          });
          
          const isUnique = !existingSite;
          console.log(`🔍 Subdirectory '${subdirectory}' is ${isUnique ? 'unique' : 'already taken'}`);
          return isUnique;
        },
      }),
      async: true,
    });

    if (submission.status !== "success") {
      console.error("❌ Validation failed:", submission.error);
      return submission.reply();
    }

    console.log("✅ Validation successful");
    
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

    console.log("💾 Creating site in database:", {
      name,
      subdirectory,
      userId: user.id,
    });
    
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
    
    console.log("✅ Site created successfully:", {
      id: newSite.id,
      name: newSite.name,
      subdirectory: newSite.subdirectory,
      createdAt: newSite.createdAt,
    });

    // Return success with redirect URL
    console.log("🔀 Redirecting to dashboard");
    return { success: true, redirectUrl: "/dashboard/sites" };
  } catch (error: unknown) {
    console.error("❌ Error creating site:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    // Check for Prisma-specific errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      console.error("Database error code:", (error as { code: string }).code);
      
      // Handle common Prisma error codes
      if ((error as { code: string }).code === 'P2002') {
        console.error("Unique constraint violation:", 
          (error as { meta?: { target?: string[] } }).meta?.target);
        return { error: { _form: ["This subdirectory is already taken. Please choose another one."] } };
      }
    }
    
    // Convert to the format expected by the form
    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to create site: ${error instanceof Error ? error.message : 'Unknown error'}`];
    
    return { error: errorObj };
  }
} 