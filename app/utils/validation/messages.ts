/**
 * Common validation messages used across schemas
 */
export const ValidationMessages = {
  REQUIRED: "This field is required",
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be at most ${max} characters`,
  INVALID_URL: "Please enter a valid URL",
  ALREADY_TAKEN: (field: string) => `This ${field} is already taken`,
  VALIDATION_UNDEFINED: "Validation function is not defined",
  INVALID_EMAIL: "Please enter a valid email",
}; 