import { z } from "zod";
import { ValidationMessages } from "./messages";

/**
 * Common field definitions reused across schemas
 */
export const CommonFields = {
  name: () => z.string().min(1, ValidationMessages.TOO_SHORT(1)).max(35, ValidationMessages.TOO_LONG(35)),
  description: () => z.string().min(1, ValidationMessages.TOO_SHORT(1)).max(150, ValidationMessages.TOO_LONG(150)),
  url: () => z.string().url(ValidationMessages.INVALID_URL).optional().or(z.literal('')),
  email: () => z.string().email(ValidationMessages.INVALID_EMAIL).optional().or(z.literal('')),
};

/**
 * Language enum for Zod to match Prisma schema
 */
export const LanguageEnum = z.enum(["English", "Hebrew"]); 