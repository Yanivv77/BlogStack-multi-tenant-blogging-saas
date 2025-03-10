"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { BasicsTabProps, SiteFormValues, SubdirectoryStatus } from "../utils/types";
import { useDebounce } from "../utils/hooks";

/**
 * BasicsTab component for collecting basic site information
 * First step in the site creation process
 */
export function BasicsTab({ fields, goToNextTab, formValues, handleInputChange }: BasicsTabProps) {
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof SiteFormValues, string>>>({});
  const [isCheckingSubdirectory, setIsCheckingSubdirectory] = useState(false);
  const [subdirectoryStatus, setSubdirectoryStatus] = useState<SubdirectoryStatus>(null);
  
  // Track if we've already validated the subdirectory to prevent unnecessary API calls
  const validatedSubdirectories = useRef<Set<string>>(new Set());

  /**
   * Check if a subdirectory is available
   */
  const checkSubdirectoryUniqueness = async (subdirectory: string) => {
    if (!subdirectory || !/^[a-zA-Z0-9-]+$/.test(subdirectory)) {
      setSubdirectoryStatus("invalid");
      return;
    }
    
    // If we've already validated this subdirectory as available, don't check again
    if (validatedSubdirectories.current.has(subdirectory)) {
      setSubdirectoryStatus("available");
      return;
    }
    
    setIsCheckingSubdirectory(true);
    setSubdirectoryStatus("checking");
    
    try {
      const response = await fetch(`/api/check-subdirectory?subdirectory=${encodeURIComponent(subdirectory)}`);
      const data = await response.json();
      
      if (data.isUnique) {
        setSubdirectoryStatus("available");
        validatedSubdirectories.current.add(subdirectory); // Remember this subdirectory is valid
        setLocalErrors(prev => ({ ...prev, subdirectory: undefined }));
      } else {
        setSubdirectoryStatus("unavailable");
        setLocalErrors(prev => ({ ...prev, subdirectory: "This subdirectory is already taken" }));
      }
    } catch (error) {
      console.error("Error checking subdirectory:", error);
      setSubdirectoryStatus(null);
    } finally {
      setIsCheckingSubdirectory(false);
    }
  };

  const debouncedCheckSubdirectory = useDebounce(checkSubdirectoryUniqueness, 500);

  // Check subdirectory availability when it changes
  useEffect(() => {
    if (!formValues.subdirectory) {
      setSubdirectoryStatus(null);
      return;
    }
    
    if (!/^[a-zA-Z0-9-]+$/.test(formValues.subdirectory)) {
      setSubdirectoryStatus("invalid");
      setLocalErrors(prev => ({ 
        ...prev, 
        subdirectory: "Only letters, numbers, and hyphens are allowed" 
      }));
      return;
    }
    
    debouncedCheckSubdirectory(formValues.subdirectory);
  }, [formValues.subdirectory]);

  /**
   * Handle input change with validation
   */
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For subdirectory, handle special validation
    if (name === 'subdirectory') {
      // Remove spaces automatically
      if (value.includes(" ")) {
        const newValue = value.replace(/\s+/g, "");
        
        // Create a simpler synthetic event without trying to clone the original event
        const syntheticEvent = {
          target: { name, value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(syntheticEvent);
        return;
      }
      
      // Reset validation status when typing
      if (value !== formValues.subdirectory) {
        setSubdirectoryStatus("checking");
      }
    } else {
      // Clear error for other fields
      setLocalErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Pass to parent handler
    handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  /**
   * Validate form fields and proceed if valid
   */
  const validateAndProceed = () => {
    const errors: Partial<Record<keyof SiteFormValues, string>> = {};

    if (!formValues.name?.trim()) {
      errors.name = "Site name is required";
    }
    
    if (!formValues.subdirectory?.trim()) {
      errors.subdirectory = "Subdirectory is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formValues.subdirectory)) {
      errors.subdirectory = "Only letters, numbers, and hyphens are allowed";
    } else if (subdirectoryStatus !== "available") {
      errors.subdirectory = "Please ensure subdirectory is available";
    }
    
    if (!formValues.description?.trim()) {
      errors.description = "Description is required";
    }
    
    if (!["English", "Hebrew"].includes(formValues.language)) {
      errors.language = "Please select a valid language";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle continue button click
   */
  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Only proceed if validation passes
    if (validateAndProceed()) {
      goToNextTab(e);
    }
  };

  // Determine if continue button should be disabled
  const isContinueDisabled = 
    isCheckingSubdirectory || 
    !formValues.name || 
    !formValues.subdirectory || 
    !formValues.description || 
    subdirectoryStatus !== "available";

  return (
    <>
      <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SimpleIcon name="briefcase" size={20} color="currentColor"/>
              Basic Information
            </h2>
            <p className="text-sm text-muted-foreground">
              Let's start with the essentials for your new site
            </p>
          </div>

          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor="site-name" className="text-base">
              Site Name
            </Label>
            <Input
              id="site-name"
              name="name"
              placeholder="My Awesome Blog"
              className={`h-11 ${localErrors.name ? 'border-destructive' : ''}`}
              required
              value={formValues.name}
              onChange={handleFieldChange}
              aria-describedby="name-hint name-error"
              autoComplete="off"
            />
            <div id="name-hint" className="text-[0.8rem] text-muted-foreground">
              Choose a memorable name for your site
            </div>
            {(fields.name?.errors || localErrors.name) && (
              <div id="name-error" className="text-destructive text-sm">
                {localErrors.name || fields.name?.errors}
              </div>
            )}
          </div>

          {/* Subdirectory */}
          <div className="space-y-2">
            <Label htmlFor="site-subdirectory" className="text-base">
              Subdirectory
            </Label>
            <div className="flex items-center">
              <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-muted-foreground">
                blogstack.io/
              </span>
              <div className="relative flex-1">
                <Input
                  id="site-subdirectory"
                  name="subdirectory"
                  placeholder="your-site"
                  className={`h-11 rounded-l-none pr-8 ${
                    subdirectoryStatus === "available" 
                      ? 'border-green-500 focus-visible:ring-green-500' 
                      : localErrors.subdirectory
                        ? 'border-destructive' 
                        : ''
                  }`}
                  required
                  value={formValues.subdirectory}
                  onChange={handleFieldChange}
                  autoComplete="off"
                  spellCheck="false"
                  aria-describedby="subdirectory-hint subdirectory-error subdirectory-success"
                />
                {isCheckingSubdirectory && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <SimpleIcon name="loader" size={16} className="animate-spin" />
                  </div>
                )}
                {!isCheckingSubdirectory && subdirectoryStatus === "available" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <SimpleIcon name="check" size={16} className="text-green-500" />
                  </div>
                )}
              </div>
            </div>
            <div id="subdirectory-hint" className="text-[0.8rem] text-muted-foreground">
              This will be your site's URL (only letters, numbers, and hyphens)
            </div>
            {localErrors.subdirectory && (
              <div id="subdirectory-error" className="text-destructive text-sm">
                {localErrors.subdirectory}
              </div>
            )}
            {subdirectoryStatus === "available" && formValues.subdirectory && (
              <div id="subdirectory-success" className="text-green-500 text-sm flex items-center gap-1">
                <SimpleIcon name="check" size={14} />
                Subdirectory is available
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="site-description" className="text-base">
              Description
            </Label>
            <Textarea
              id="site-description"
              name="description"
              placeholder="Tell readers what your site is about..."
              className={`min-h-[120px] resize-none ${localErrors.description ? 'border-destructive' : ''}`}
              required
              value={formValues.description}
              onChange={handleFieldChange}
              aria-describedby="description-hint description-error"
              autoComplete="off"
              spellCheck="false"
            />
            <div id="description-hint" className="text-[0.8rem] text-muted-foreground">
              A brief description of your site (max 150 characters)
            </div>
            {(fields.description?.errors || localErrors.description) && (
              <div id="description-error" className="text-destructive text-sm">
                {localErrors.description || fields.description?.errors}
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="site-language" className="text-base">
              Language
            </Label>
            <select
              id="site-language"
              name="language"
              className={`flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${localErrors.language ? 'border-destructive' : ''}`}
              value={formValues.language || "English"}
              onChange={handleFieldChange}
              aria-describedby="language-hint language-error"
            >
              <option value="English">English</option>
              <option value="Hebrew">Hebrew</option>
            </select>
            <div id="language-hint" className="text-[0.8rem] text-muted-foreground">
              Select the primary language for your site
            </div>
            {(fields.language?.errors || localErrors.language) && (
              <div id="language-error" className="text-destructive text-sm">
                {localErrors.language || fields.language?.errors}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
        <div></div>
        <Button 
          type="button" 
          onClick={handleContinue}
          id="basics-continue-button"
          className="gap-2 px-6 min-w-[120px]"
          aria-label="Continue to branding tab after validation"
          disabled={isContinueDisabled}
          data-testid="continue-button"
        >
          {isCheckingSubdirectory ? (
            <>
              <SimpleIcon name="loader" size={16} className="animate-spin mr-2" />
              Checking...
            </>
          ) : (
            <>
              Continue <SimpleIcon name="arrowright" size={16} color="currentColor"/>
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );
} 