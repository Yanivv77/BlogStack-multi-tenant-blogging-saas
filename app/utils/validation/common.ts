import { z } from "zod";

import { ValidationMessages } from "./messages";

/**
 * Common field definitions reused across schemas
 */
export const CommonFields = {
  name: () =>
    z
      .string()
      .min(1, ValidationMessages.REQUIRED)
      .min(3, ValidationMessages.TOO_SHORT(3))
      .max(35, ValidationMessages.TOO_LONG(35)),

  description: () =>
    z
      .string()
      .min(1, ValidationMessages.REQUIRED)
      .min(10, ValidationMessages.TOO_SHORT(10))
      .max(500, ValidationMessages.TOO_LONG(500)),

  url: () => z.string().url(ValidationMessages.INVALID_URL).optional().or(z.literal("")),

  email: () => z.string().email(ValidationMessages.INVALID_EMAIL).optional().or(z.literal("")),

  slug: () =>
    z
      .string()
      .min(3, ValidationMessages.TOO_SHORT(3))
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed"),

  domain: () =>
    z
      .string()
      .regex(
        /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
        "Invalid domain format. Enter a valid domain without http:// or https://"
      )
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? null : val)),
};

/**
 * Helper function to apply conformZodMessage to zod schema
 * for consistent error messaging with Conform
 */
export function withConform<T extends z.ZodType>(schema: T): T {
  return schema as T; // Type assertion as we can't directly modify the schema
  // In reality, conformZodMessage should be applied at the form level
}

/**
 * Language enum for Zod to match Prisma schema
 * LTR: Left-to-Right (e.g., English, Spanish, French)
 * RTL: Right-to-Left (e.g., Hebrew, Arabic, Persian)
 */
export const LanguageEnum = z.enum(["LTR", "RTL"]).default("LTR");

/**
 * Strongly typed language values to use in code
 * This provides a type-safe way to access enum values
 */
export const Language = {
  LTR: "LTR" as const,
  RTL: "RTL" as const,
};
