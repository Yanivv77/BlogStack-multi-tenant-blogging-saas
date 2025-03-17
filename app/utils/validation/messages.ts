/**
 * Common validation messages used across schemas
 * These messages are designed to be user-friendly and informative
 */
export const ValidationMessages = {
  // Basic validation messages
  REQUIRED: "This field is required",
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be at most ${max} characters`,

  // URL and email validation
  INVALID_URL: "Please enter a valid URL starting with http:// or https://",
  INVALID_EMAIL: "Please enter a valid email address",

  // Unique field validation
  ALREADY_TAKEN: (field: string) => `This ${field} is already taken`,

  // Validation function errors
  VALIDATION_UNDEFINED: "Validation function is not defined",
  VALIDATION_SKIPPED: "Validation was skipped",

  // Format validation
  INVALID_FORMAT: (format: string) => `Invalid format. ${format}`,
  ALPHANUMERIC_HYPHEN: "Only lowercase letters, numbers, and hyphens are allowed",

  // Content validation
  EMPTY_CONTENT: "Content cannot be empty",
  INVALID_IMAGE: "Please provide a valid image URL or upload an image",

  // Specific form validation
  FORM_ERROR: "There was an error processing your form",
  MISSING_FIELD: (field: string) => `${field} is missing`,

  // Success messages
  SUCCESS: (action: string) => `Successfully ${action}`,
};

/**
 * Helper to format validation messages for specific contexts
 */
export const formatMessage = {
  required: (field: string) => `${field} is required`,
  tooShort: (field: string, min: number) => `${field} must be at least ${min} characters`,
  tooLong: (field: string, max: number) => `${field} must be at most ${max} characters`,
  alreadyTaken: (field: string) => `This ${field} is already taken`,
};
