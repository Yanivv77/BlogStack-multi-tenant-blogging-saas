import { z } from "zod";
import { conformZodMessage } from "@conform-to/zod";
import { CommonFields, LanguageEnum } from "./common";
import { ValidationMessages } from "./messages";

/**
 * Basic site schema for validation
 */
export const siteSchema = z.object({
  name: CommonFields.name(),
  description: CommonFields.description(),
  subdirectory: z.string().min(1).max(40),
  siteImageCover: z.string().optional(),
  logoImage: z.string().optional(),
  language: LanguageEnum,
  email: CommonFields.email(),
  githubUrl: CommonFields.url(),
  linkedinUrl: CommonFields.url(),
  portfolioUrl: CommonFields.url(),
});

/**
 * Schema for site creation with unique subdirectory validation
 */
export function SiteCreationSchema(options?: {
  isSubdirectoryUnique?: () => Promise<boolean>;
}) {
  return z.object({
    name: CommonFields.name(),
    description: CommonFields.description(),
    subdirectory: z
      .string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .max(40, ValidationMessages.TOO_LONG(40))
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed")
      .superRefine(async (subdirectory, ctx) => {
        // Skip validation if the subdirectory is empty
        if (!subdirectory) return;

        // Skip validation if the validation function is not provided
        if (!options?.isSubdirectoryUnique) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: ValidationMessages.VALIDATION_UNDEFINED,
          });
          return;
        }

        // Check if the subdirectory is unique
        const isUnique = await options.isSubdirectoryUnique();
        if (!isUnique) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: ValidationMessages.ALREADY_TAKEN("subdirectory"),
          });
        }
      }),
    language: LanguageEnum.default("English"),
    email: CommonFields.email(),
    githubUrl: CommonFields.url(),
    linkedinUrl: CommonFields.url(),
    portfolioUrl: CommonFields.url(),
    siteImageCover: z.string().optional(),
    logoImage: z.string().optional(),
  });
} 