// Export validation utilities
// Note: We're importing and re-exporting to avoid naming conflicts
import * as baseValidation from "./validation";
import * as zodValidation from "./zodValidation";

/**
 * Utility exports for site management
 */

// Export all types
export * from "./types";

// Export all hooks
export * from "./hooks";

// Re-export with namespaces to avoid conflicts
export { baseValidation, zodValidation };
