"use server";

import { parseWithZod } from "@conform-to/zod";

import prisma from "../../utils/db/prisma";
import { serverLogger } from "../../utils/logger";
import { PostCreationSchema } from "../../utils/validation/postSchema";
import { createErrorResponse, getAuthenticatedUser, toNullable, verifyUserOwnsSite } from "../utils/helpers";

/**
 * Creates a new post (article)
 */
export async function CreatePostAction(_prevState: unknown, formData: FormData) {
  const logger = serverLogger("CreatePostAction");
  logger.start();

  const user = await getAuthenticatedUser();
  if (!user) {
    logger.error("Authentication required");
    return await createErrorResponse("Authentication required");
  }

  try {
    // Get siteId from formData
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      logger.error("Site ID is missing");
      return { error: { _form: ["Site ID is required"] } };
    }

    // Log form data for debugging
    const postCoverImageValue = formData.get("postCoverImage");
    const contentImagesValue = formData.get("contentImages");

    logger.debug("Form data received", {
      title: formData.get("title"),
      smallDescription: `${formData.get("smallDescription")?.toString().substring(0, 20)}...`,
      slug: formData.get("slug"),
      postCoverImage: postCoverImageValue
        ? typeof postCoverImageValue === "string"
          ? `Present (${postCoverImageValue.substring(0, 30)}...)`
          : "Present (non-string)"
        : "Not provided",
      keywords: formData.get("keywords") ? "Present" : "Not provided",
      articleContent: formData.get("articleContent") ? "Present" : "Not provided",
      contentImages: contentImagesValue
        ? typeof contentImagesValue === "string"
          ? `Present (${contentImagesValue.substring(0, 30)}...)`
          : "Present (non-string)"
        : "Not provided",
    });

    // Verify the user owns the site
    const site = await verifyUserOwnsSite(siteId, user.id);
    if (!site) {
      logger.error("Site ownership verification failed", null, { siteId, userId: user.id });
      return { error: { _form: ["Site not found or you don't have permission"] } };
    }

    logger.debug("Site ownership verified", { siteId });

    // Validate form data
    const submission = await parseWithZod(formData, {
      schema: PostCreationSchema({
        async isSlugUnique() {
          const slug = formData.get("slug") as string;
          if (!slug) return false;

          logger.debug(`Checking if slug '${slug}' is unique for site ${siteId}`);

          const existingPost = await prisma.post.findFirst({
            where: { slug, siteId },
          });

          const isUnique = !existingPost;
          logger.debug(`Slug '${slug}' is ${isUnique ? "unique" : "already taken"}`);
          return isUnique;
        },
      }),
      async: true,
    });

    // If validation fails, return the error
    if (submission.status !== "success") {
      logger.error("Validation failed", null, { errors: submission.error });
      return submission.reply();
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
        // If it's already a string, parse it; otherwise keep it as is
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

    // Create the post with proper JSON fields
    try {
      logger.info("Creating post in database", { title, slug, siteId });

      const post = await prisma.post.create({
        data: {
          title,
          smallDescription,
          articleContent: processedArticleContent,
          slug,
          postCoverImage: processedCoverImage,
          contentImages: contentImages.length > 0 ? contentImages : null,
          keywords: keywords || null,
          siteId,
          userId: user.id,
          views: 0,
          likes: 0,
        },
      });

      logger.success("Post created successfully", {
        postId: post.id,
        hasCoverImage: post.postCoverImage ? "Yes" : "No",
        hasContentImages: post.contentImages ? "Yes" : "No",
      });
      return { success: true, postId: post.id };
    } catch (dbError) {
      logger.error("Database error creating post", dbError);

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
    logger.error("Error creating post", error);

    // Log detailed error information
    if (error instanceof Error) {
      logger.error("Error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    const errorObj: Record<string, string[]> = {};
    errorObj._form = [`Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`];

    return { error: errorObj };
  }
}
