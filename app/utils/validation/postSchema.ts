import { z } from "zod";
import { conformZodMessage } from "@conform-to/zod";
import { ValidationMessages } from "./messages";
import { CommonFields } from "./common";

/**
 * Basic post schema for validation
 */
export const PostSchema = z.object({
  title: z.string()
    .min(3, ValidationMessages.TOO_SHORT(3))
    .max(60, ValidationMessages.TOO_LONG(60)),
  smallDescription: z.string()
    .min(10, ValidationMessages.TOO_SHORT(10))
    .max(160, ValidationMessages.TOO_LONG(160)),
  articleContent: z.union([
    z.string().min(1, ValidationMessages.EMPTY_CONTENT),
    z.object({}).passthrough()
  ]),
  slug: CommonFields.slug(),
  postCoverImage: z.string().nullable().optional(),
  contentImages: z.union([
    z.string(),
    z.array(z.any()),
    z.object({}).passthrough()
  ]).optional(),
});

/**
 * Helper to perform slug uniqueness validation
 */
const validateSlugUniqueness = (options?: {
  isSlugUnique?: () => Promise<boolean>;
  currentPostId?: string;
}) => {
  return async (slug: string, ctx: z.RefinementCtx) => {
    // Skip validation if the slug is empty
    if (!slug) return;

    // Skip validation if the validation function is not provided
    if (!options?.isSlugUnique) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ValidationMessages.VALIDATION_UNDEFINED,
      });
      return;
    }

    // Check if the slug is unique
    const isUnique = await options.isSlugUnique();
    if (!isUnique) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ValidationMessages.ALREADY_TAKEN("slug"),
      });
    }
  };
};

/**
 * Schema for post creation with unique slug validation
 */
export function PostCreationSchema(options?: {
  isSlugUnique?: () => Promise<boolean>;
}) {
  return z.object({
    title: z.string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .max(60, ValidationMessages.TOO_LONG(60)),
    smallDescription: z.string()
      .min(10, ValidationMessages.TOO_SHORT(10))
      .max(160, ValidationMessages.TOO_LONG(160)),
    articleContent: z.union([
      z.string().min(1, ValidationMessages.EMPTY_CONTENT),
      z.object({}).passthrough()
    ]),
    slug: CommonFields.slug()
      .superRefine(validateSlugUniqueness(options)),
    postCoverImage: z.string().nullable().optional(),
    contentImages: z.union([
      z.string(),
      z.array(z.any()),
      z.object({}).passthrough()
    ]).optional(),
  });
}

/**
 * Schema for post editing with unique slug validation
 */
export function PostEditSchema(options?: {
  isSlugUnique?: () => Promise<boolean>;
  currentPostId?: string;
}) {
  return z.object({
    title: z.string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .max(60, ValidationMessages.TOO_LONG(60)),
    smallDescription: z.string()
      .min(10, ValidationMessages.TOO_SHORT(10))
      .max(160, ValidationMessages.TOO_LONG(160)),
    articleContent: z.union([
      z.string().min(1, ValidationMessages.EMPTY_CONTENT),
      z.object({}).passthrough()
    ]),
    slug: CommonFields.slug()
      .superRefine(validateSlugUniqueness(options)),
    postCoverImage: z.string().nullable().optional(),
    contentImages: z.union([
      z.string(),
      z.array(z.any()),
      z.object({}).passthrough()
    ]).optional(),
  });
} 