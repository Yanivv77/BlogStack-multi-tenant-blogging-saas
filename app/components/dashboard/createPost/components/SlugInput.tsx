import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlugStatus, useSlugValidation } from '../hooks/useSlugValidation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SlugInputProps {
  siteId: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoGenerateFromTitle?: boolean;
  title?: string;
  error?: string;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

/**
 * SlugInput component with real-time validation and formatting
 * Shows status indicators for availability and validation
 */
const SlugInputComponent = forwardRef<
  { checkSlug: (slug: string) => Promise<void> },
  SlugInputProps
>(({
  siteId,
  value,
  onChange,
  onBlur,
  autoGenerateFromTitle = true,
  title = '',
  error,
  onAvailabilityChange
}, ref) => {
  const {
    slugStatus,
    isCheckingSlug,
    slugError,
    handleSlugChange,
    formatSlug,
    checkSlug
  } = useSlugValidation(siteId);
  
  const [isFocused, setIsFocused] = useState(false);
  
  // Expose the checkSlug method to parent components
  useImperativeHandle(ref, () => ({
    checkSlug: async (slug: string) => {
      await checkSlug(slug);
    }
  }));
  
  // Update the parent component when slug status changes
  useEffect(() => {
    if (onAvailabilityChange) {
      onAvailabilityChange(slugStatus === 'available');
    }
  }, [slugStatus, onAvailabilityChange]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedSlug = handleSlugChange(e.target.value);
    onChange(formattedSlug);
  };
  
  return (
    <div className="space-y-1">
      <Label htmlFor="slug" className="text-sm font-medium">
        Slug
      </Label>
      <div className="relative">
        <div className="flex items-center">
          <Input
            id="slug"
            name="slug"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (onBlur) onBlur();
            }}
            placeholder="your-post-slug"
            className={`pr-8 ${
              slugStatus === "available" 
                ? 'border-green-500 focus-visible:ring-green-500' 
                : (slugStatus === 'unavailable' || slugStatus === 'invalid' || error)
                  ? 'border-destructive' 
                  : ''
            }`}
            aria-describedby="slug-hint slug-error slug-success"
            aria-invalid={slugStatus === 'unavailable' || slugStatus === 'invalid' || !!error}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCheckingSlug && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
            {!isCheckingSlug && slugStatus === "available" && (
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            {!isCheckingSlug && (slugStatus === "unavailable" || slugStatus === "invalid") && (
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
      <div id="slug-hint" className="text-[0.8rem] text-muted-foreground">
        This will be your post's URL (only lowercase letters, numbers, and hyphens)
      </div>
      {(slugError || error) && (
        <div id="slug-error" className="text-destructive text-sm">
          {slugError || error}
        </div>
      )}
      {slugStatus === "available" && (
        <div id="slug-success" className="text-green-500 text-sm">
          This slug is available
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
SlugInputComponent.displayName = 'SlugInput';

// Export the component
export const SlugInput = SlugInputComponent; 