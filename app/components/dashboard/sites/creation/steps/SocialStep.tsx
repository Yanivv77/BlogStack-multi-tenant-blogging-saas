"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { SocialStepProps } from "../../utils/types";
import type { ValidationErrors } from "../../utils/zodValidation";
import { validateField } from "../../utils/zodValidation";

/**
 * SocialStep component for collecting social media links
 * Final step in the site creation process
 */
export function SocialStep({ goToPrevStep, formValues, handleInputChange }: SocialStepProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [attemptedSubmit] = useState(false);

  /**
   * Handle input change
   */
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pass to parent handler
    handleInputChange(e);
  };

  /**
   * Handle field blur to validate after user interaction
   */
  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate the field using Zod schema
    const fieldError = validateField(name as keyof typeof formValues, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Helper function to determine if an error should be shown
  const shouldShowError = (fieldName: keyof typeof formValues) => {
    return Boolean((touchedFields[fieldName as string] || attemptedSubmit) && errors[fieldName]);
  };

  return (
    <>
      <CardContent className="space-y-6 px-6 pt-6 sm:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <SimpleIcon name="link" size={20} color="currentColor" />
              Contact & Social Links
            </h2>
            <p className="text-sm text-muted-foreground">
              Connect your social profiles to grow your audience (all fields optional)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="mail" size={20} color="currentColor" />
                  Contact Email
                </div>
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder="contact@yourdomain.com"
                className={`h-11 ${shouldShowError("email") ? "border-destructive" : ""}`}
                value={formValues.email}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                autoComplete="email"
                aria-describedby="email-hint email-error"
              />
              <div id="email-hint" className="text-[0.8rem] text-muted-foreground">
                This email will be displayed as a contact option on your site
              </div>
              {shouldShowError("email") && (
                <div id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </div>
              )}
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github-url" className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="github" size={20} />
                  GitHub URL
                </div>
              </Label>
              <Input
                id="github-url"
                name="githubUrl"
                placeholder="https://github.com/yourusername"
                className={`h-11 ${shouldShowError("githubUrl") ? "border-destructive" : ""}`}
                value={formValues.githubUrl}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                autoComplete="url"
                aria-describedby="github-hint github-error"
              />
              <div id="github-hint" className="text-[0.8rem] text-muted-foreground">
                Your GitHub profile URL (optional)
              </div>
              {shouldShowError("githubUrl") && (
                <div id="github-error" className="text-sm text-destructive">
                  {errors.githubUrl}
                </div>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor="linkedin-url" className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="linkedin" size={20} />
                  LinkedIn URL
                </div>
              </Label>
              <Input
                id="linkedin-url"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                className={`h-11 ${shouldShowError("linkedinUrl") ? "border-destructive" : ""}`}
                value={formValues.linkedinUrl}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                autoComplete="url"
                aria-describedby="linkedin-hint linkedin-error"
              />
              <div id="linkedin-hint" className="text-[0.8rem] text-muted-foreground">
                Your LinkedIn profile URL (optional)
              </div>
              {shouldShowError("linkedinUrl") && (
                <div id="linkedin-error" className="text-sm text-destructive">
                  {errors.linkedinUrl}
                </div>
              )}
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor="portfolio-url" className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="globe" size={20} color="currentColor" />
                  Portfolio URL
                </div>
              </Label>
              <Input
                id="portfolio-url"
                name="portfolioUrl"
                placeholder="https://yourportfolio.com"
                className={`h-11 ${shouldShowError("portfolioUrl") ? "border-destructive" : ""}`}
                value={formValues.portfolioUrl}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                autoComplete="url"
                aria-describedby="portfolio-hint portfolio-error"
              />
              <div id="portfolio-hint" className="text-[0.8rem] text-muted-foreground">
                Your personal website or portfolio URL (optional)
              </div>
              {shouldShowError("portfolioUrl") && (
                <div id="portfolio-error" className="text-sm text-destructive">
                  {errors.portfolioUrl}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 pb-8 pt-2 sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevStep}
          id="social-back-button"
          className="px-4 text-foreground"
          aria-label="Go back to branding step"
          data-testid="social-back-button"
        >
          <SimpleIcon name="arrowleft" size={16} color="currentColor" className="mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={false} // Never disable since all fields are optional
          className="px-6"
          data-testid="create-site-button"
        >
          Show Summary
          <SimpleIcon name="arrow-right" className="ml-2" size={16} />
        </Button>
      </CardFooter>
    </>
  );
}
