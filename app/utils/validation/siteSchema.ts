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
 * Helper to perform subdirectory uniqueness validation
 */
const validateSubdirectoryUniqueness = (options?: {
  isSubdirectoryUnique?: () => Promise<boolean>;
}) => {
  return async (subdirectory: string, ctx: z.RefinementCtx) => {
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
  };
};

/**
 * Schema for site creation with unique subdirectory validation
 */
export function SiteCreationSchema(options?: {
  isSubdirectoryUnique?: () => Promise<boolean>;
}) {
  return z.object({
    name: CommonFields.name(),
    description: CommonFields.description(),
    subdirectory: z.string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .max(40, ValidationMessages.TOO_LONG(40))
      .regex(/^[a-z0-9-]+$/, ValidationMessages.ALPHANUMERIC_HYPHEN)
      .superRefine(validateSubdirectoryUniqueness(options)),
    language: LanguageEnum,
    email: CommonFields.email(),
    githubUrl: CommonFields.url(),
    linkedinUrl: CommonFields.url(),
    portfolioUrl: CommonFields.url(),
    siteImageCover: z.string().optional(),
    logoImage: z.string().optional(),
  });
}

/**
 * Schema for site editing (without subdirectory uniqueness validation)
 * This schema is used for updating an existing site's information
 * The subdirectory field is not included since it shouldn't be changed after creation
 */
export function SiteEditSchema() {
  return z.object({
    name: CommonFields.name(),
    description: CommonFields.description(),
    language: LanguageEnum,
    email: CommonFields.email(),
    githubUrl: CommonFields.url(),
    linkedinUrl: CommonFields.url(),
    portfolioUrl: CommonFields.url(),
    siteImageCover: z.string().optional().nullable(),
    logoImage: z.string().optional().nullable(),
    siteId: z.string().min(1, ValidationMessages.REQUIRED), // Required for identifying which site to update
  });
} 