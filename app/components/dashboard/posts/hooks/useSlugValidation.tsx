import { useState, useRef, useEffect } from 'react';
import { checkSlugAvailability, validateSlugFormat, formatAsSlug } from '@/app/utils/validation/postUtils';

/**
 * Status of the slug validation process
 */
export type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';

/**
 * Hook for slug validation with real-time feedback
 * @param siteId The site ID to check slug availability against
 * @returns Object with slug validation state and functions
 */
export function useSlugValidation(siteId: string) {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Debounced function to check slug availability
   * @param slug The slug to check
   */
  const debouncedCheckSlug = (slug: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      checkSlug(slug);
    }, 500); // 500ms debounce time
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Check slug format and availability
   * @param slug The slug to check
   */
  const checkSlug = async (slug: string) => {
    // Reset status
    setSlugError(undefined);
    
    // Skip check for empty slugs
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    
    // Validate slug format
    const formatError = validateSlugFormat(slug);
    if (formatError) {
      setSlugStatus('invalid');
      setSlugError(formatError);
      return;
    }
    
    // Check availability
    setIsCheckingSlug(true);
    setSlugStatus('checking');
    
    try {
      const isAvailable = await checkSlugAvailability(slug, siteId);
      setSlugStatus(isAvailable ? 'available' : 'unavailable');
      
      if (!isAvailable) {
        setSlugError('This slug is already taken');
      }
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setSlugStatus('unavailable');
      setSlugError('Error checking availability');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  /**
   * Format a string as a valid slug
   * @param input The string to format
   * @returns The formatted slug
   */
  const formatSlug = (input: string): string => {
    return formatAsSlug(input);
  };

  /**
   * Handle slug input change
   * @param value The new slug value
   * @returns The formatted slug
   */
  const handleSlugChange = (value: string): string => {
    const formattedSlug = formatSlug(value);
    
    // Reset validation status
    if (slugStatus !== 'idle') {
      setSlugStatus('idle');
      setSlugError(undefined);
    }
    
    // Trigger validation check
    debouncedCheckSlug(formattedSlug);
    
    return formattedSlug;
  };

  return {
    slugStatus,
    isCheckingSlug,
    slugError,
    handleSlugChange,
    formatSlug,
    checkSlug
  };
} 