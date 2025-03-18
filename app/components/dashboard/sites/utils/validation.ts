/**
 * Validation utilities for the new site form
 */
import type { SiteFormValues } from "./types";

/**
 * Validation error type
 */
export type ValidationErrors = Partial<Record<keyof SiteFormValues, string>>;

/**
 * Validate site name
 * @param name Site name to validate
 * @returns Error message or undefined if valid
 */
export function validateSiteName(name: string): string | undefined {
  if (!name?.trim()) {
    return "Site name is required";
  }

  if (name.length < 3) {
    return "Site name must be at least 3 characters";
  }

  if (name.length > 50) {
    return "Site name must be less than 50 characters";
  }

  return undefined;
}

/**
 * Validate subdirectory
 * @param subdirectory Subdirectory to validate
 * @returns Error message or undefined if valid
 */
export function validateSubdirectory(subdirectory: string): string | undefined {
  if (!subdirectory?.trim()) {
    return "Subdirectory is required";
  }

  if (subdirectory.length < 3) {
    return "Subdirectory must be at least 3 characters";
  }

  if (subdirectory.length > 40) {
    return "Subdirectory must be less than 40 characters";
  }

  if (!/^[a-z0-9-]+$/.test(subdirectory)) {
    return "Only lowercase letters, numbers, and hyphens are allowed";
  }

  return undefined;
}

/**
 * Validate description
 * @param description Description to validate
 * @returns Error message or undefined if valid
 */
export function validateDescription(description: string): string | undefined {
  if (!description?.trim()) {
    return "Description is required";
  }

  if (description.length < 10) {
    return "Description must be at least 10 characters";
  }

  if (description.length > 500) {
    return "Description must be less than 500 characters";
  }

  return undefined;
}

/**
 * Validates a language selection
 * @param language Language to validate
 * @returns Error message or undefined if valid
 */
export function validateLanguage(language: string): string | undefined {
  const validLanguages = ["LTR", "RTL"];

  if (!language) {
    return "Text direction is required";
  }

  if (!validLanguages.includes(language)) {
    return "Invalid text direction selection";
  }

  return undefined;
}

/**
 * Validate email
 * @param email Email to validate
 * @returns Error message or undefined if valid
 */
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return undefined; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return undefined;
}

/**
 * Validate URL
 * @param url URL to validate
 * @param fieldName Name of the field for error message
 * @returns Error message or undefined if valid
 */
export function validateUrl(url: string, fieldName: string): string | undefined {
  if (!url) {
    return undefined; // URLs are optional
  }

  try {
    new URL(url);
    return undefined;
  } catch {
    return `Please enter a valid URL for ${fieldName}`;
  }
}

/**
 * Validate all form fields
 * @param formValues Form values to validate
 * @returns Object with validation errors
 */
export function validateForm(formValues: SiteFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate required fields
  const nameError = validateSiteName(formValues.name);
  if (nameError) errors.name = nameError;

  const subdirectoryError = validateSubdirectory(formValues.subdirectory);
  if (subdirectoryError) errors.subdirectory = subdirectoryError;

  const descriptionError = validateDescription(formValues.description);
  if (descriptionError) errors.description = descriptionError;

  const languageError = validateLanguage(formValues.language);
  if (languageError) errors.language = languageError;

  // Validate optional fields
  const emailError = validateEmail(formValues.email);
  if (emailError) errors.email = emailError;

  const githubUrlError = validateUrl(formValues.githubUrl, "GitHub");
  if (githubUrlError) errors.githubUrl = githubUrlError;

  const linkedinUrlError = validateUrl(formValues.linkedinUrl, "LinkedIn");
  if (linkedinUrlError) errors.linkedinUrl = linkedinUrlError;

  const portfolioUrlError = validateUrl(formValues.portfolioUrl, "Portfolio");
  if (portfolioUrlError) errors.portfolioUrl = portfolioUrlError;

  return errors;
}

/**
 * Validate a specific tab's fields
 * @param formValues Form values to validate
 * @param tabName Name of the tab to validate
 * @returns Object with validation errors for the specified tab
 */
export function validateTabFields(formValues: SiteFormValues, tabName: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (tabName === "basics") {
    const nameError = validateSiteName(formValues.name);
    if (nameError) errors.name = nameError;

    const subdirectoryError = validateSubdirectory(formValues.subdirectory);
    if (subdirectoryError) errors.subdirectory = subdirectoryError;

    const descriptionError = validateDescription(formValues.description);
    if (descriptionError) errors.description = descriptionError;

    const languageError = validateLanguage(formValues.language);
    if (languageError) errors.language = languageError;
  } else if (tabName === "social") {
    const emailError = validateEmail(formValues.email);
    if (emailError) errors.email = emailError;

    const githubUrlError = validateUrl(formValues.githubUrl, "GitHub");
    if (githubUrlError) errors.githubUrl = githubUrlError;

    const linkedinUrlError = validateUrl(formValues.linkedinUrl, "LinkedIn");
    if (linkedinUrlError) errors.linkedinUrl = linkedinUrlError;

    const portfolioUrlError = validateUrl(formValues.portfolioUrl, "Portfolio");
    if (portfolioUrlError) errors.portfolioUrl = portfolioUrlError;
  }

  return errors;
}
