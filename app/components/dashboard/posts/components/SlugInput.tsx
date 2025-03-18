import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSlugValidation } from "../hooks/useSlugValidation";

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
const SlugInputComponent = forwardRef<{ checkSlug: (slug: string) => Promise<void> }, SlugInputProps>(
  ({ siteId, value, onChange, onBlur, error, onAvailabilityChange }, ref) => {
    const { slugStatus, isCheckingSlug, slugError, handleSlugChange, checkSlug } = useSlugValidation(siteId);

    const [, setIsFocused] = useState(false);

    // Expose the checkSlug method to parent components
    useImperativeHandle(ref, () => ({
      checkSlug: async (slug: string) => {
        await checkSlug(slug);
      },
    }));

    // Update the parent component when slug status changes
    useEffect(() => {
      if (onAvailabilityChange) {
        onAvailabilityChange(slugStatus === "available");
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
              className={`pr-8 ${slugStatus === "available" && "border-green-500 focus-visible:ring-green-500"} ${
                (slugStatus === "unavailable" || slugStatus === "invalid" || error) && "border-destructive"
              }`}
              aria-describedby="slug-hint slug-error slug-success"
              aria-invalid={slugStatus === "unavailable" || slugStatus === "invalid" || !!error}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingSlug && (
                <SimpleIcon name="loader" className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              {!isCheckingSlug && slugStatus === "available" && (
                <SimpleIcon name="check" className="h-4 w-4 text-green-500" aria-hidden="true" />
              )}
              {!isCheckingSlug && (slugStatus === "unavailable" || slugStatus === "invalid") && (
                <SimpleIcon name="alertcircle" className="h-4 w-4 text-destructive" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
        <div id="slug-hint" className="text-[0.8rem] text-muted-foreground">
          This will be your post's URL (only lowercase letters, numbers, and hyphens)
        </div>
        {(slugError || error) && (
          <div id="slug-error" className="text-sm text-destructive">
            {slugError || error}
          </div>
        )}
        {slugStatus === "available" && (
          <div id="slug-success" className="text-sm text-green-500">
            This slug is available
          </div>
        )}
      </div>
    );
  }
);

// Add display name for better debugging
SlugInputComponent.displayName = "SlugInput";

// Export the component
export const SlugInput = SlugInputComponent;
