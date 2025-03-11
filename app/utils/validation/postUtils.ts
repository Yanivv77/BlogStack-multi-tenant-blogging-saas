/**
 * Utility functions for post validation
 */

/**
 * Check if a post slug is available for a specific site
 * @param slug The slug to check
 * @param siteId The site ID to check against
 * @returns Promise<boolean> True if the slug is available, false otherwise
 */
export async function checkSlugAvailability(slug: string, siteId: string): Promise<boolean> {
  try {
    // Skip check for empty slugs
    if (!slug) return false;
    
    const params = new URLSearchParams({ slug, siteId });
    const response = await fetch(`/api/check-slug?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Error checking slug availability:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    return data.isUnique;
  } catch (error) {
    console.error("Failed to check slug availability:", error);
    // In case of error, assume the slug is not available to be safe
    return false;
  }
}

/**
 * Validate a post slug format
 * @param slug The slug to validate
 * @returns string | undefined Error message if invalid, undefined if valid
 */
export function validateSlugFormat(slug: string): string | undefined {
  if (!slug) {
    return "Slug is required";
  }
  
  if (slug.length < 3) {
    return "Slug must be at least 3 characters";
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Only lowercase letters, numbers, and hyphens are allowed";
  }
  
  return undefined;
}

/**
 * Format a string as a valid slug
 * Converts spaces to hyphens, removes special characters, and converts to lowercase
 * @param input The string to format as a slug
 * @returns string The formatted slug
 */
export function formatAsSlug(input: string): string {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-')        // Replace multiple hyphens with a single hyphen
    .replace(/^-|-$/g, '');     // Remove leading and trailing hyphens
} 