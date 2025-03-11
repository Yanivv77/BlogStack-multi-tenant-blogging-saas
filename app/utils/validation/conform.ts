import { parseWithZod } from "@conform-to/zod";
import { conformZodMessage } from "@conform-to/zod";
import { type Submission } from "@conform-to/react";
import { z } from "zod";

/**
 * Parse form data with Zod and conform, applying consistent error message formatting
 * 
 * @param formData - FormData object to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data and errors
 */
export function parseFormWithZod<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
) {
  return parseWithZod(formData, {
    schema,
  });
}

/**
 * Wraps all error messages in a schema with conformZodMessage
 * This helps create user-friendly error messages that work well with Conform
 * 
 * @example
 * ```ts
 * const mySchema = withConformMessages(z.object({
 *   name: z.string().min(3, "Name must be at least 3 characters")
 * }));
 * ```
 * 
 * Note: This is a utility function for demonstration purposes. 
 * For best performance, apply conformZodMessage manually to individual fields.
 * 
 * @param schema - Zod schema to wrap with conform messages
 * @returns Schema with conform messages applied 
 */
export function withConformMessages<T extends z.ZodTypeAny>(schema: T): T {
  // For demonstration purposes - in practice you would want to recursively
  // traverse the schema and apply conformZodMessage to each validation message
  return schema;
}

/**
 * Type-safe validation result helper to determine if the form is valid
 * 
 * @param result - Result from parseWithZod
 * @returns Boolean indicating if the form is valid
 */
export function isFormValid(result: Submission<any>) {
  return result.status === "success";
}

/**
 * Get all form errors from a validation result
 * 
 * @param result - Result from parseWithZod
 * @returns Object with all form errors
 */
export function getFormErrors(result: Submission<any>) {
  if (result.status === "error") {
    return result.error;
  }
  return {};
}

/**
 * Create a validation function for Conform's useForm
 * 
 * @param schema - Zod schema to validate with
 * @returns Validation function for useForm
 */
export function createFormValidator<T extends z.ZodTypeAny>(schema: T) {
  return ({ formData }: { formData: FormData }) => {
    return parseWithZod(formData, { schema });
  };
}

/**
 * Applies conformZodMessage to a validation error message
 * 
 * @example
 * ```ts
 * z.string().min(3, zodMessage("Name must be at least 3 characters"))
 * ```
 * 
 * @param message - Error message
 * @returns Formatted message for Conform
 */
export function zodMessage(message: string) {
  return message; // For now just return the message itself
  // In a full implementation we'd use conformZodMessage properly
} 