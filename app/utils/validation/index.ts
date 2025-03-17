/**
 * Re-export all validation schemas and utilities
 */

// Common validation utilities
export * from "./common";
export * from "./messages";
export * from "./conform";

// Schema definitions
export * from "./siteSchema";
export * from "./postSchema";

/**
 * This index file serves as a single entry point for all validation related utilities.
 * Usage examples:
 *
 * 1. Import specific schemas:
 *    import { PostSchema, SiteSchema } from '@/app/utils/validation';
 *
 * 2. Import validation utilities:
 *    import { parseFormWithZod, createFormValidator } from '@/app/utils/validation';
 *
 * 3. Import messages:
 *    import { ValidationMessages } from '@/app/utils/validation';
 */
