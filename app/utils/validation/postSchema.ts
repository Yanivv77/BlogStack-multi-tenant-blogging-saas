import { z } from "zod";
import { conformZodMessage } from "@conform-to/zod";
import { ValidationMessages } from "./messages";

/**
 * Basic post schema for validation
 */
export const PostSchema = z.object({
  title: z.string().min(3, ValidationMessages.TOO_SHORT(3)),
  smallDescription: z.string().min(10, ValidationMessages.TOO_SHORT(10)),
  articleContent: z.any(),
  slug: z.string().min(3, ValidationMessages.TOO_SHORT(3)),
  postCoverImage: z.string().optional(),
  contentImages: z.any().optional(),
});

/**
 * Schema for post creation with unique slug validation
 */
export function PostCreationSchema(options?: {
  isSlugUnique?: () => Promise<boolean>;
}) {
  return z.object({
    title: z.string().min(3, ValidationMessages.TOO_SHORT(3)),
    smallDescription: z.string().min(10, ValidationMessages.TOO_SHORT(10)),
    articleContent: z.any(),
    slug: z
      .string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed")
      .superRefine(async (slug, ctx) => {
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
      }),
    postCoverImage: z.string().optional(),
    contentImages: z.any().optional(),
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
    title: z.string().min(3, ValidationMessages.TOO_SHORT(3)),
    smallDescription: z.string().min(10, ValidationMessages.TOO_SHORT(10)),
    articleContent: z.any(),
    slug: z
      .string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed")
      .superRefine(async (slug, ctx) => {
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
      }),
    postCoverImage: z.string().optional(),
    contentImages: z.any().optional(),
  });
} 