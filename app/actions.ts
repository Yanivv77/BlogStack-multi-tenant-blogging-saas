"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { LanguageEnum, PostCreationSchema, PostEditSchema, PostSchema, SiteCreationSchema, siteSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { requireUser } from "./utils/requireUser";

// Types for action responses
type ActionError = { status: "error"; errors: string[] };
type ActionSuccess = { status: "success"; errors: never[] };
type ActionResponse = ActionError | ActionSuccess;
type SubmissionResult = ReturnType<typeof parseWithZod>;

/**
 * Helper functions for creating consistent response objects
 */
const createErrorResponse = (message: string): ActionError => ({
  status: "error",
  errors: [message],
});

const createSuccessResponse = (): ActionSuccess => ({
  status: "success",
  errors: [],
});

/**
 * Converts a value to a string or null
 * Useful for optional fields in database operations
 */
const toNullable = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
};

/**
 * Ensures the user is authenticated and returns the user object
 * If not authenticated, returns null
 */
async function getAuthenticatedUser() {
  try {
    const user = await requireUser();
    if (!user || !user.id) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Verifies that the user owns the specified site
 * Returns the site if owned, null otherwise
 */
async function verifyUserOwnsSite(siteId: string, userId: string) {
  if (!siteId || !userId) return null;
  
  return await prisma.site.findFirst({
    where: {
      id: siteId,
      userId,
    },
  });
}

/**
 * Creates a new site for the authenticated user
 */
export async function CreateSiteAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return redirect("/api/auth/login");
  }

  const submission = await parseWithZod(formData, {
    schema: SiteCreationSchema({
      async isSubdirectoryUnique() {
        const subdirectory = formData.get("subdirectory") as string;
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
    siteImageCover,
    logoImage,
    email,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    language,
  } = submission.value;

  // Create the site
  await prisma.site.create({
    data: {
      // Required fields
      name,
      description,
      subdirectory,
      userId: user.id,

      // Optional fields: always include them, null if empty
      siteImageCover: toNullable(siteImageCover),
      logoImage: toNullable(logoImage),
      email: toNullable(email),
      githubUrl: toNullable(githubUrl),
      linkedinUrl: toNullable(linkedinUrl),
      portfolioUrl: toNullable(portfolioUrl),

      // Language is an enum; use a default if none is provided
      language: language || "English",
    } as any,
  });

  // Redirect to the user's sites
  return redirect("/dashboard/sites");
}

/**
 * Creates a new post (article)
 */
export async function CreatePostAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const submission = await parseWithZod(formData, {
    schema: PostCreationSchema({
      async isSlugUnique() {
        const slug = formData.get("slug") as string;
        const siteId = formData.get("siteId") as string;
        
        const existingPost = await prisma.post.findFirst({
          where: { slug, siteId },
        });
        
        return !existingPost;
      },
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const {
    title,
    smallDescription,
    articleContent,
    slug,
    postCoverImage,
    contentImages: rawContentImages,
  } = submission.value;

  // Get siteId from formData since it's not part of the schema
  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return createErrorResponse("Site ID is required");
  }

  try {
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return createErrorResponse("Site not found or you don't have permission");
    }

    // Process content images
    let contentImages: string[] = [];
    if (rawContentImages) {
      try {
        contentImages = JSON.parse(rawContentImages as string);
      } catch {
        contentImages = [];
      }
    }

    // Create the post
    await prisma.post.create({
      data: {
        title,
        smallDescription,
        slug,
        articleContent: JSON.parse(articleContent),
        postCoverImage: toNullable(postCoverImage),
        contentImages,
        siteId,
        userId: user.id,
      },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error creating post:", error);
    return createErrorResponse("Failed to create post. Please try again.");
  }
}

/**
 * Edits an existing post
 */
export async function EditPostActions(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const postId = formData.get("postId") as string;
  if (!postId) {
    return createErrorResponse("Missing post ID");
  }

  const submission = await parseWithZod(formData, {
    schema: PostEditSchema({
      async isSlugUnique() {
        const slug = formData.get("slug") as string;
        const siteId = formData.get("siteId") as string;
        
        const existingPost = await prisma.post.findFirst({
          where: { 
            slug, 
            siteId,
            id: { not: postId } // Exclude current post
          },
        });
        
        return !existingPost;
      },
      currentPostId: postId,
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const {
      title,
      smallDescription,
      articleContent,
      slug,
      postCoverImage,
      contentImages: rawContentImages,
    } = submission.value;

    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      return createErrorResponse("Site ID is required");
    }

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return createErrorResponse("Site not found or you don't have permission");
    }

    // Process content images
    let contentImages: string[] = [];
    if (rawContentImages) {
      try {
        contentImages = JSON.parse(rawContentImages as string);
      } catch {
        contentImages = [];
      }
    }

    // Update the post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        smallDescription,
        slug,
        articleContent: JSON.parse(articleContent),
        postCoverImage: toNullable(postCoverImage),
        contentImages,
      },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error updating post:", error);
    return createErrorResponse("Failed to update post. Please try again.");
  }
}

/**
 * Deletes a post
 */
export async function DeletePost(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const postId = formData.get("postId") as string;
  const siteId = formData.get("siteId") as string;

  if (!postId || !siteId) {
    return createErrorResponse("Missing post or site information");
  }

  try {
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return createErrorResponse("Site not found or you don't have permission");
    }

    // Verify the post exists and belongs to the site
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!post) {
      return createErrorResponse("Post not found or doesn't belong to this site");
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error deleting post:", error);
    return createErrorResponse("Failed to delete post. Please try again.");
  }
}

/**
 * Updates site images
 */
export async function UpdateImage(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return createErrorResponse("Missing site information");
  }

  try {
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return createErrorResponse("Site not found or you don't have permission");
    }

    // Get image values from form
    const siteImageCover = formData.get("siteImageCover") as string;
    const logoImage = formData.get("logoImage") as string;

    // Update the site with new images
    await prisma.site.update({
      where: { id: siteId },
      data: {
        siteImageCover: siteImageCover || null,
        logoImage: logoImage || null,
      } as any,
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error updating site image:", error);
    return createErrorResponse("Failed to update site image. Please try again.");
  }
  
}

/**
 * Deletes a site
 */
export async function DeleteSite(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return createErrorResponse("Missing site information");
  }

  try {
    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      return createErrorResponse("Site not found or you don't have permission");
    }

    // Delete all posts associated with the site
    await prisma.post.deleteMany({
      where: { siteId },
    });

    // Delete the site
    await prisma.site.delete({
      where: { id: siteId },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error deleting site:", error);
    return createErrorResponse("Failed to delete site. Please try again.");
  }
}

/**
 * Updates site information
 */
export async function UpdateSiteAction(_prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return createErrorResponse("Authentication required");
  }

  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return createErrorResponse("Missing site information");
  }

  // Verify the user owns the site
  const site = await verifyUserOwnsSite(siteId, user.id);
  if (!site) {
    return createErrorResponse("Site not found or you don't have permission");
  }

  const submission = await parseWithZod(formData, {
    schema: siteSchema,
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const {
      name,
      description,
      siteImageCover,
      logoImage,
      email,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      language,
    } = submission.value;

    // Update the site with all fields
    await prisma.site.update({
      where: {
        id: siteId,
        userId: user.id,
      },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        siteImageCover: toNullable(siteImageCover),
        logoImage: toNullable(logoImage),
        email: toNullable(email),
        githubUrl: toNullable(githubUrl),
        linkedinUrl: toNullable(linkedinUrl),
        portfolioUrl: toNullable(portfolioUrl),
        language: language || "English",
      } as any,
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Error updating site:", error);
    return createErrorResponse("Failed to update site. Please try again.");
  }
}