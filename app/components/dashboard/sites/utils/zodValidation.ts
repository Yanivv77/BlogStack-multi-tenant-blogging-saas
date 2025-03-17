/**
 * Client-side validation utilities using Zod schemas
 */
import { z } from "zod";

import { siteSchema } from "@/app/utils/validation/siteSchema";

import type { SiteFormValues } from "./types";

/**
 * Type for validation errors
 */
export type ValidationErrors = Partial<Record<keyof SiteFormValues, string>>;

/**
 * Basic site schema without async validation
 */
const clientSiteSchema = siteSchema;

/**
 * Step-specific schemas
 */
const basicsSchema = z.object({
  name: clientSiteSchema.shape.name,
  subdirectory: clientSiteSchema.shape.subdirectory,
  description: clientSiteSchema.shape.description,
  language: clientSiteSchema.shape.language,
});

const socialSchema = z.object({
  email: clientSiteSchema.shape.email,
  githubUrl: clientSiteSchema.shape.githubUrl,
  linkedinUrl: clientSiteSchema.shape.linkedinUrl,
  portfolioUrl: clientSiteSchema.shape.portfolioUrl,
});

/**
 * Validate a form value with a Zod schema
 * @param schema Zod schema to validate against
 * @param value Value to validate
 * @returns Error message or undefined if valid
 */
function validateWithZod<T>(schema: z.ZodType<T>, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  if (!result.success) {
    // Get the first error message
    const firstError = result.error.errors[0];
    return firstError.message;
  }
  return undefined;
}

/**
 * Validate a complete form with a Zod schema
 * @param schema Zod schema to validate against
 * @param values Form values to validate
 * @returns Object with validation errors
 */
function validateFormWithZod<T>(schema: z.ZodType<T>, values: unknown): ValidationErrors {
  const result = schema.safeParse(values);
  if (!result.success) {
    const errors: ValidationErrors = {};

    // Extract error messages for each field
    for (const issue of result.error.errors) {
      const path = issue.path[0];
      if (typeof path === "string" && !errors[path as keyof SiteFormValues]) {
        errors[path as keyof SiteFormValues] = issue.message;
      }
    }

    return errors;
  }
  return {};
}

/**
 * Check if a subdirectory is available
 * @param subdirectory Subdirectory to check
 * @returns Promise resolving to true if available, false if not
 */
export async function checkSubdirectoryAvailability(subdirectory: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/check-subdirectory?subdirectory=${encodeURIComponent(subdirectory)}`);
    const data = await response.json();
    return data.isUnique;
  } catch (error) {
    console.error("Error checking subdirectory:", error);
    return false;
  }
}

/**
 * Validate a single field
 * @param fieldName Name of the field to validate
 * @param value Value to validate
 * @returns Error message or undefined if valid
 */
export function validateField(fieldName: keyof SiteFormValues, value: unknown): string | undefined {
  switch (fieldName) {
    case "name":
      return validateWithZod(clientSiteSchema.shape.name, value);
    case "subdirectory":
      return validateWithZod(clientSiteSchema.shape.subdirectory, value);
    case "description":
      return validateWithZod(clientSiteSchema.shape.description, value);
    case "language":
      return validateWithZod(clientSiteSchema.shape.language, value);
    case "email":
      return validateWithZod(clientSiteSchema.shape.email, value);
    case "githubUrl":
      return validateWithZod(clientSiteSchema.shape.githubUrl, value);
    case "linkedinUrl":
      return validateWithZod(clientSiteSchema.shape.linkedinUrl, value);
    case "portfolioUrl":
      return validateWithZod(clientSiteSchema.shape.portfolioUrl, value);
    default:
      return undefined;
  }
}

/**
 * Validate all form fields
 * @param formValues Form values to validate
 * @returns Object with validation errors
 */
export function validateForm(formValues: SiteFormValues): ValidationErrors {
  return validateFormWithZod(clientSiteSchema, formValues);
}

/**
 * Validate fields for a specific step
 * @param formValues Form values to validate
 * @param stepName Name of the step to validate
 * @returns Object with validation errors for the specified step
 */
export function validateStepFields(formValues: SiteFormValues, stepName: string): ValidationErrors {
  switch (stepName) {
    case "basics":
      return validateFormWithZod(basicsSchema, formValues);
    case "social":
      return validateFormWithZod(socialSchema, formValues);
    case "branding":
    case "summary":
      return {}; // No validation needed for these steps
    default:
      return {};
  }
}
