import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

export const siteSchema = z.object({
  name: z.string().min(1).max(35),
  description: z.string().min(1).max(150),
  subdirectory: z.string().min(1).max(40),
  siteImageCover: z.string().optional(),
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
              message: conformZodMessage.VALIDATION_UNDEFINED,
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
              message: conformZodMessage.VALIDATION_UNDEFINED,
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
      .max(40)
      .regex(/^[a-z]+$/, "Subdirectory must only use lowercase letters.")
      .transform((value) => value.toLocaleLowerCase())
      .pipe(
        z.string().superRefine((email, ctx) => {
          if (typeof options?.isSubdirectoryUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: conformZodMessage.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          return options.isSubdirectoryUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Subdirectory is already taken...",
              });
            }
          });
        })
      ),
    name: z.string().min(1).max(35),
    description: z.string().min(1).max(150),
    siteImageCover: z.string().optional(), 
     
  });
}