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
import { validateField, checkSubdirectoryAvailability, ValidationErrors } from "../utils/zodValidation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * BasicsTab component for collecting basic site information
 * First step in the site creation process
 */
export function BasicsTab({ fields, goToNextTab, formValues, handleInputChange }: BasicsTabProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isCheckingSubdirectory, setIsCheckingSubdirectory] = useState(false);
  const [subdirectoryStatus, setSubdirectoryStatus] = useState<SubdirectoryStatus>(null);
  const [attemptedNext, setAttemptedNext] = useState(false);
  
  // Track if we've already validated the subdirectory to prevent unnecessary API calls
  const validatedSubdirectories = useRef<Set<string>>(new Set());

  /**
   * Check if a subdirectory is available
   */
  const checkSubdirectoryUniqueness = async (subdirectory: string) => {
    // First validate the subdirectory format
    const formatError = validateField('subdirectory', subdirectory);
    if (formatError) {
      setSubdirectoryStatus("invalid");
      setErrors(prev => ({ ...prev, subdirectory: formatError }));
      return;
    }
    
    // If we've already validated this subdirectory as available, don't check again
    if (validatedSubdirectories.current.has(subdirectory)) {
      setSubdirectoryStatus("available");
      setErrors(prev => ({ ...prev, subdirectory: undefined }));
      return;
    }
    
    setIsCheckingSubdirectory(true);
    setSubdirectoryStatus("checking");
    
    try {
      const isAvailable = await checkSubdirectoryAvailability(subdirectory);
      
      if (isAvailable) {
        setSubdirectoryStatus("available");
        validatedSubdirectories.current.add(subdirectory); // Remember this subdirectory is valid
        setErrors(prev => ({ ...prev, subdirectory: undefined }));
      } else {
        setSubdirectoryStatus("unavailable");
        setErrors(prev => ({ ...prev, subdirectory: "This subdirectory is already taken" }));
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
      setErrors(prev => ({ ...prev, subdirectory: undefined }));
      return;
    }
    
    // Only validate if the user has interacted with the field or attempted to proceed
    if (touchedFields.subdirectory || attemptedNext) {
      // Validate subdirectory format first
      const formatError = validateField('subdirectory', formValues.subdirectory);
      if (formatError) {
        setSubdirectoryStatus("invalid");
        setErrors(prev => ({ ...prev, subdirectory: formatError }));
        return;
      }
      
      debouncedCheckSubdirectory(formValues.subdirectory);
    }
  }, [formValues.subdirectory, touchedFields.subdirectory, attemptedNext]);

  /**
   * Handle input change with validation
   */
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For subdirectory, handle special validation
    if (name === 'subdirectory') {
      // Remove spaces automatically
      if (value.includes(" ")) {
        const newValue = value.replace(/\s+/g, "").toLowerCase();
        
        // Create a simpler synthetic event without trying to clone the original event
        const syntheticEvent = {
          target: { name, value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(syntheticEvent);
        return;
      }
      
      // Convert to lowercase
      if (value !== value.toLowerCase()) {
        const newValue = value.toLowerCase();
        
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
    }
    
    // Pass to parent handler
    handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  /**
   * Handle field blur to validate after user interaction
   */
  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Validate the field
    const fieldError = validateField(name as keyof SiteFormValues, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
    
    // For subdirectory, check availability
    if (name === 'subdirectory' && value && !fieldError) {
      debouncedCheckSubdirectory(value);
    }
  };

  /**
   * Handle language selection
   */
  const handleLanguageChange = (value: string) => {
    const syntheticEvent = {
      target: { name: 'language', value }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleFieldChange(syntheticEvent);
    
    // Mark as touched and validate
    setTouchedFields(prev => ({ ...prev, language: true }));
    const fieldError = validateField('language', value);
    setErrors(prev => ({ ...prev, language: fieldError }));
  };

  /**
   * Validate form fields and proceed if valid
   */
  const validateAndProceed = () => {
    // Mark all fields as touched
    setTouchedFields({
      name: true,
      subdirectory: true,
      description: true,
      language: true
    });
    
    // Set attempted next to true to show all errors
    setAttemptedNext(true);
    
    // Validate all fields
    const newErrors: ValidationErrors = {};
    
    // Validate each field
    const nameError = validateField('name', formValues.name);
    if (nameError) newErrors.name = nameError;
    
    const subdirectoryError = validateField('subdirectory', formValues.subdirectory);
    if (subdirectoryError) {
      newErrors.subdirectory = subdirectoryError;
    } else if (subdirectoryStatus !== "available") {
      newErrors.subdirectory = "Please ensure subdirectory is available";
    }
    
    const descriptionError = validateField('description', formValues.description);
    if (descriptionError) newErrors.description = descriptionError;
    
    const languageError = validateField('language', formValues.language);
    if (languageError) newErrors.language = languageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    (formValues.subdirectory && subdirectoryStatus !== "available" && subdirectoryStatus !== null);

  // Helper function to determine if an error should be shown
  const shouldShowError = (fieldName: keyof SiteFormValues) => {
    return Boolean((touchedFields[fieldName as string] || attemptedNext) && errors[fieldName]);
  };

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
              className={`h-11 ${shouldShowError('name') ? 'border-destructive' : ''}`}
              required
              value={formValues.name}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              aria-describedby="name-hint name-error"
              autoComplete="off"
            />
            <div id="name-hint" className="text-[0.8rem] text-muted-foreground">
              Choose a memorable name for your site
            </div>
            {shouldShowError('name') && (
              <div id="name-error" className="text-destructive text-sm">
                {errors.name}
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
                      : shouldShowError('subdirectory')
                        ? 'border-destructive' 
                        : ''
                  }`}
                  required
                  value={formValues.subdirectory}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
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
              This will be your site's URL (only lowercase letters, numbers, and hyphens)
            </div>
            {shouldShowError('subdirectory') && (
              <div id="subdirectory-error" className="text-destructive text-sm">
                {errors.subdirectory}
              </div>
            )}
            {subdirectoryStatus === "available" && (
              <div id="subdirectory-success" className="text-green-500 text-sm">
                This subdirectory is available
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
              placeholder="Write a brief description of your site..."
              className={`min-h-[100px] ${shouldShowError('description') ? 'border-destructive' : ''}`}
              required
              value={formValues.description}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              aria-describedby="description-hint description-error"
            />
            <div id="description-hint" className="text-[0.8rem] text-muted-foreground">
              Describe what your site is about (10-500 characters)
            </div>
            {shouldShowError('description') && (
              <div id="description-error" className="text-destructive text-sm">
                {errors.description}
              </div>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="site-language" className="text-base">
              Language
            </Label>
            <Select 
              value={formValues.language} 
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger 
                id="site-language"
                className={`h-11 ${shouldShowError('language') ? 'border-destructive' : ''}`}
              >
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hebrew">Hebrew</SelectItem>
              </SelectContent>
            </Select>
            <div id="language-hint" className="text-[0.8rem] text-muted-foreground">
              Select the primary language for your site
            </div>
            {shouldShowError('language') && (
              <div id="language-error" className="text-destructive text-sm">
                {errors.language}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between px-6 sm:px-8 pb-6">
        <div></div> {/* Empty div for spacing */}
        <Button 
          onClick={handleContinue}
          disabled={!!isContinueDisabled}
          className="w-full sm:w-auto"
        >
          Continue
          <SimpleIcon name="arrow-right" className="ml-2" size={16} />
        </Button>
      </CardFooter>
    </>
  );
} 