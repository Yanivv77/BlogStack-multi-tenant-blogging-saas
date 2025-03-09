"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { memo, useState } from "react";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface FormValues {
  name: string;
  subdirectory: string;
  description: string;
  language: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

interface BasicsTabProps {
  fields: any;
  goToNextTab: () => void;
  formValues: FormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BasicsTab = memo(function BasicsTab({ 
  fields, 
  goToNextTab, 
  formValues, 
  handleInputChange 
}: BasicsTabProps) {
  const [localErrors, setLocalErrors] = useState<{
    name?: string;
    subdirectory?: string;
    description?: string;
    language?: string;
  }>({});

  // Handle subdirectory validation on input
  const handleSubdirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    const originalValue = value;
    
    // Clear previous errors
    setLocalErrors(prev => ({ ...prev, subdirectory: undefined }));
    
    // Only remove spaces automatically
    if (value.includes(" ")) {
      value = value.replace(/\s+/g, "");
      e.target.value = value;
    }
    
    // Show validation warning but don't prevent typing
    if (value && !/^[a-zA-Z0-9-]+$/.test(value)) {
      setLocalErrors(prev => ({ 
        ...prev, 
        subdirectory: "Only letters, numbers, and hyphens will be allowed" 
      }));
    }
    
    // Pass the event to the parent handler
    if (value !== originalValue) {
      // Create a new synthetic event with the modified value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value
        }
      };
      handleInputChange(syntheticEvent);
    } else {
      handleInputChange(e);
    }
  };

  // Validate all fields before proceeding
  const validateAndProceed = () => {
    const errors: {
      name?: string;
      subdirectory?: string;
      description?: string;
      language?: string;
    } = {};
    
    // Validate name
    if (!formValues.name || formValues.name.trim() === "") {
      errors.name = "Site name is required";
    }
    
    // Validate subdirectory
    if (!formValues.subdirectory || formValues.subdirectory.trim() === "") {
      errors.subdirectory = "Subdirectory is required";
    } else if (formValues.subdirectory.includes(" ")) {
      errors.subdirectory = "Subdirectory cannot contain spaces";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formValues.subdirectory)) {
      errors.subdirectory = "Subdirectory can only contain letters, numbers, and hyphens";
    }
    
    // Validate description
    if (!formValues.description || formValues.description.trim() === "") {
      errors.description = "Description is required";
    }
    
    // Validate language
    if (!formValues.language) {
      errors.language = "Language is required";
    } else if (!["English", "Hebrew"].includes(formValues.language)) {
      errors.language = "Please select a valid language";
    }
    
    // Update error state
    setLocalErrors(errors);
    
    // If no errors, proceed to next tab
    if (Object.keys(errors).length === 0) {
      return true;
    }
    
    return false;
  };

  // Handle continue button click
  const handleContinue = () => {
    // Only proceed if validation passes
    if (validateAndProceed()) {
      goToNextTab();
    }
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
              className="h-11"
              required
              value={formValues.name}
              onChange={(e) => {
                setLocalErrors(prev => ({ ...prev, name: undefined }));
                handleInputChange(e);
              }}
              aria-describedby="name-hint name-error"
              autoComplete="off"
            />
            <div id="name-hint" className="text-[0.8rem] text-muted-foreground">
              Choose a memorable name for your site
            </div>
            {(fields.name.errors || localErrors.name) && (
              <div id="name-error" className="text-destructive text-sm">
                {localErrors.name || fields.name.errors}
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
              <Input
                id="site-subdirectory"
                name="subdirectory"
                placeholder="your-site"
                className="h-11 rounded-l-none"
                required
                value={formValues.subdirectory}
                onChange={handleSubdirectoryChange}
                autoComplete="off"
                spellCheck="false"
                aria-describedby="subdirectory-hint subdirectory-error"
              />
            </div>
            <div id="subdirectory-hint" className="text-[0.8rem] text-muted-foreground">
              This will be your site's URL (only letters, numbers, and hyphens)
            </div>
            {(fields.subdirectory.errors || localErrors.subdirectory) && (
              <div id="subdirectory-error" className="text-destructive text-sm">
                {localErrors.subdirectory || fields.subdirectory.errors}
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
              className="min-h-[120px] resize-none"
              required
              value={formValues.description}
              onChange={(e) => {
                setLocalErrors(prev => ({ ...prev, description: undefined }));
                handleInputChange(e);
              }}
              aria-describedby="description-hint description-error"
              autoComplete="off"
              spellCheck="false"
            />
            <div id="description-hint" className="text-[0.8rem] text-muted-foreground">
              A brief description of your site (max 150 characters)
            </div>
            {(fields.description.errors || localErrors.description) && (
              <div id="description-error" className="text-destructive text-sm">
                {localErrors.description || fields.description.errors}
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
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formValues.language || "English"}
              onChange={(e) => {
                setLocalErrors(prev => ({ ...prev, language: undefined }));
                handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
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
          className="gap-2 px-6"
          aria-label="Continue to branding tab after validation"
        >
          Continue <SimpleIcon name="arrowright" size={16} color="currentColor"/>
        </Button>
      </CardFooter>
    </>
  );
}); 