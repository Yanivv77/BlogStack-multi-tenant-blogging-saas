"use server";

import { parseWithZod } from "@conform-to/zod";

import prisma from "../../utils/db/prisma";
import { serverLogger } from "../../utils/logger";
import { PostEditSchema } from "../../utils/validation/postSchema";
import { getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Edits an existing post
 */
export async function EditPostActions(_prevState: unknown, formData: FormData) {
  const logger = serverLogger("EditPostActions");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required", null, { userId: null });
    return {
      error: { _form: ["You must be logged in to edit a post"] },
    };
  }

  try {
    // Get postId and siteId from formData
    const postId = formData.get("postId") as string;
    const siteId = formData.get("siteId") as string;

    if (!postId) {
      logger.error("Post ID is missing", null, { userId: user.id });
      return {
        error: { _form: ["Post ID is required"] },
      };
    }

    if (!siteId) {
      logger.error("Site ID is missing", null, { userId: user.id, postId });
      return {
        error: { _form: ["Site ID is required"] },
      };
    }

    // Log form data for debugging
    const postCoverImageValue = formData.get("postCoverImage");
    const contentImagesValue = formData.get("contentImages");

    // Format the cover image value for logging
    let postCoverImageLog = "Not provided";
    if (postCoverImageValue) {
      postCoverImageLog =
        typeof postCoverImageValue === "string"
          ? `Present (${postCoverImageValue.substring(0, 30)}...)`
          : "Present (non-string)";
    }

    // Format the content images value for logging
    let contentImagesLog = "Not provided";
    if (contentImagesValue) {
      contentImagesLog =
        typeof contentImagesValue === "string"
          ? `Present (${contentImagesValue.substring(0, 30)}...)`
          : "Present (non-string)";
    }

    logger.debug("Form data received", {
      postId,
      siteId,
      title: formData.get("title"),
      smallDescription: `${formData.get("smallDescription")?.toString().substring(0, 20)}...`,
      slug: formData.get("slug"),
      postCoverImage: postCoverImageLog,
      articleContent: formData.get("articleContent") ? "Present" : "Not provided",
      contentImages: contentImagesLog,
    });

    logger.debug("Verifying site ownership", { siteId, userId: user.id });

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return {
        error: { _form: ["Site not found or you don't have permission"] },
      };
    }

    // Verify the post exists and belongs to the site
    logger.debug("Verifying post exists and belongs to site", { postId, siteId });
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        siteId,
      },
    });

    if (!existingPost) {
      logger.error("Post not found or doesn't belong to site", null, { postId, siteId });
      return {
        error: { _form: ["Post not found or doesn't belong to this site"] },
      };
    }

    logger.debug("Validating form data", { postId });

    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: PostEditSchema({
        isSlugUnique: async () => {
          const slug = formData.get("slug") as string;
          if (!slug) return false;

          logger.debug("Checking if slug is unique", { slug, postId, siteId });

          const existingPostWithSlug = await prisma.post.findFirst({
            where: {
              slug,
              siteId,
              id: { not: postId }, // Exclude the current post
            },
          });

          const isUnique = !existingPostWithSlug;
          logger.debug(`Slug '${slug}' is ${isUnique ? "unique" : "already taken"}`);
          return isUnique;
        },
        currentPostId: postId,
      }),
      async: true,
    });

    if (submission.status !== "success") {
      logger.warn("Form validation failed", { errors: submission.error });
      return { error: submission.error };
    }

    logger.debug("Form validation successful");

    const {
      title,
      smallDescription,
      articleContent,
      slug,
      postCoverImage,
      contentImages: rawContentImages,
      keywords,
    } = submission.value;

    // Log the extracted values
    logger.debug("Extracted values from submission", {
      postCoverImage: postCoverImage ? `Present (${typeof postCoverImage})` : "Not provided",
      contentImages: rawContentImages ? `Present (${typeof rawContentImages})` : "Not provided",
    });

    // Process content images
    let contentImages = [];
    if (rawContentImages) {
      try {
        contentImages = typeof rawContentImages === "string" ? JSON.parse(rawContentImages) : rawContentImages;
        logger.debug("Processed content images", {
          count: Array.isArray(contentImages) ? contentImages.length : 0,
          type: typeof contentImages,
          isArray: Array.isArray(contentImages),
          sample:
            Array.isArray(contentImages) && contentImages.length > 0
              ? `${contentImages[0].substring(0, 30)}...`
              : "No images",
        });
      } catch (e) {
        logger.error("Error parsing content images", e);
        contentImages = [];
      }
    }

    // Convert articleContent to proper JSON if it's a string
    let processedArticleContent;
    try {
      processedArticleContent = typeof articleContent === "string" ? JSON.parse(articleContent) : articleContent;
    } catch (e) {
      logger.error("Error parsing article content", e);
      return { error: { _form: ["Invalid article content format"] } };
    }

    // Process postCoverImage
    let processedCoverImage = null;
    try {
      processedCoverImage = await toNullable(postCoverImage);
      logger.debug("Processed cover image", {
        hasImage: processedCoverImage ? "Yes" : "No",
        type: typeof processedCoverImage,
        sample: processedCoverImage ? `${processedCoverImage.substring(0, 30)}...` : "None",
      });
    } catch (e) {
      logger.error("Error processing cover image", e);
      processedCoverImage = null;
    }

    logger.info("Updating post", { postId, title, slug });

    // Update the post
    try {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          title,
          smallDescription,
          articleContent: processedArticleContent,
          slug,
          postCoverImage: processedCoverImage,
          contentImages: contentImages.length > 0 ? contentImages : null,
          keywords,
          updatedAt: new Date(),
        },
      });

      logger.success("Post updated successfully", {
        postId,
        hasCoverImage: updatedPost.postCoverImage ? "Yes" : "No",
        hasContentImages: updatedPost.contentImages ? "Yes" : "No",
      });

      // Return success
      return { success: true, postId };
    } catch (dbError) {
      logger.error("Database error updating post", dbError);

      // Check for Prisma-specific errors
      if (typeof dbError === "object" && dbError !== null && "code" in dbError) {
        logger.error("Database error code:", (dbError as { code: string }).code);

        // Handle common Prisma error codes
        if ((dbError as { code: string }).code === "P2002") {
          logger.error("Unique constraint violation:", (dbError as { meta?: { target?: string[] } }).meta?.target);
          return { error: { _form: ["This slug is already taken. Please choose another one."] } };
        }
      }

      return {
        error: {
          _form: [`Database error: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`],
        },
      };
    }
  } catch (error) {
    logger.error("Error editing post", error);

    // Add detailed error logging
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return {
      error: {
        _form: [`Failed to edit post: ${error instanceof Error ? error.message : "Unknown error"}`],
      },
    };
  }
}
