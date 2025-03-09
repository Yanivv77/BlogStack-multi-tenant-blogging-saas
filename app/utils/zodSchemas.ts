import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

// Define the Language enum for Zod to match Prisma schema
export const LanguageEnum = z.enum(["English", "Hebrew"]);

// Common validation messages
const ValidationMessages = {
  REQUIRED: "This field is required",
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be at most ${max} characters`,
  INVALID_URL: "Please enter a valid URL",
  ALREADY_TAKEN: (field: string) => `This ${field} is already taken`,
  VALIDATION_UNDEFINED: "Validation function is not defined",
  INVALID_EMAIL: "Please enter a valid email",
};

// Common field definitions
const CommonFields = {
  name: () => z.string().min(1, ValidationMessages.TOO_SHORT(1)).max(35, ValidationMessages.TOO_LONG(35)),
  description: () => z.string().min(1, ValidationMessages.TOO_SHORT(1)).max(150, ValidationMessages.TOO_LONG(150)),
  url: () => z.string().url(ValidationMessages.INVALID_URL).optional().or(z.literal('')),
  email: () => z.string().email(ValidationMessages.INVALID_EMAIL).optional().or(z.literal('')),
};

export const siteSchema = z.object({
  name: z.string().min(1).max(35),
  description: z.string().min(1).max(150),
  subdirectory: z.string().min(1).max(40),
  siteImageCover: z.string().optional(),
  logoImage: z.string().optional(),
  email: CommonFields.email(),
  // Social media links
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  // Language selection
  language: LanguageEnum.optional().default("English"),
  theme: z.string().optional(),
});

export const PostSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(190),
  postCoverImage: z.string().optional(),
  contentImages: z.string().optional(),
  smallDescription: z.string().min(1).max(200),
  articleContent: z.string().min(1),
});

export function PostCreationSchema(options?: {
  isSlugUnique: () => Promise<boolean>;
}) {
  return z.object({
    title: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(190)
      .regex(/^[a-z0-9-]+$/, "Slug must only use lowercase letters, numbers, and hyphens.")
      .transform((value) => value.toLocaleLowerCase())
      .pipe(
        z.string().superRefine((slug, ctx) => {
          if (typeof options?.isSlugUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: ValidationMessages.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          return options.isSlugUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Slug is already taken. Please choose a different slug.",
              });
            }
          });
        })
      ),
    postCoverImage: z.string().optional(),
    contentImages: z.string().optional(),
    smallDescription: z.string().min(1).max(200),
    articleContent: z.string().min(1),
  });
}

export function PostEditSchema(options?: {
  isSlugUnique: () => Promise<boolean>;
  currentPostId: string;
}) {
  return z.object({
    title: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(190)
      .regex(/^[a-z0-9-]+$/, "Slug must only use lowercase letters, numbers, and hyphens.")
      .transform((value) => value.toLocaleLowerCase())
      .pipe(
        z.string().superRefine((slug, ctx) => {
          if (typeof options?.isSlugUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: ValidationMessages.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          return options.isSlugUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Slug is already taken. Please choose a different slug.",
              });
            }
          });
        })
      ),
    postCoverImage: z.string().optional(),
    contentImages: z.string().optional(),
    smallDescription: z.string().min(1).max(200),
    articleContent: z.string().min(1),
  });
}

export function SiteCreationSchema(options?: {
  isSubdirectoryUnique: () => Promise<boolean>;
}) {
  return z.object({
    subdirectory: z
      .string()
      .min(1)
      .max(30)
      .refine(
        (subdirectory) => {
          return /^[a-zA-Z0-9-]+$/.test(subdirectory);
        },
        {
          message: "Subdirectory can only contain letters, numbers, and hyphens",
        }
      )
      .superRefine((subdirectory, ctx) => {
        if (!options?.isSubdirectoryUnique) {
          ctx.addIssue({
            code: "custom",
            message: ValidationMessages.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isSubdirectoryUnique().then((isUnique) => {
          if (!isUnique) {
            ctx.addIssue({
              code: "custom",
              message: ValidationMessages.ALREADY_TAKEN("subdirectory"),
            });
          }
        });
      }),
    name: CommonFields.name(),
    description: CommonFields.description(),
    siteImageCover: z.string().optional(),
    logoImage: z.string().optional(),
    // Contact information
    email: CommonFields.email(),
    // Social media links
    githubUrl: CommonFields.url(),
    linkedinUrl: CommonFields.url(),
    portfolioUrl: CommonFields.url(),
    // Language selection
    language: LanguageEnum.optional().default("English"),
  });
}