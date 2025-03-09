"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { SocialTabProps } from "../utils/types";

/**
 * SocialTab component for collecting social media links
 * Final step in the site creation process
 */
export function SocialTab({ 
  fields, 
  goToPrevTab, 
  formValues, 
  handleInputChange 
}: SocialTabProps) {
  return (
    <>
      <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
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
                className="h-11"
                value={formValues.email}
                onChange={handleInputChange}
                autoComplete="email"
                aria-describedby="email-hint email-error"
              />
              {fields.email?.errors && (
                <div id="email-error" className="text-destructive text-sm">
                  {fields.email.errors}
                </div>
              )}
              <div id="email-hint" className="text-[0.8rem] text-muted-foreground">
                This email will be displayed as a contact option on your site
              </div>
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
                className="h-11"
                value={formValues.githubUrl}
                onChange={handleInputChange}
                autoComplete="url"
                aria-describedby="github-hint github-error"
              />
              {fields.githubUrl?.errors && (
                <div id="github-error" className="text-destructive text-sm">
                  {fields.githubUrl.errors}
                </div>
              )}
              <div id="github-hint" className="text-[0.8rem] text-muted-foreground">
                Your GitHub profile URL (optional)
              </div>
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
                className="h-11"
                value={formValues.linkedinUrl}
                onChange={handleInputChange}
                autoComplete="url"
                aria-describedby="linkedin-hint linkedin-error"
              />
              {fields.linkedinUrl?.errors && (
                <div id="linkedin-error" className="text-destructive text-sm">
                  {fields.linkedinUrl.errors}
                </div>
              )}
              <div id="linkedin-hint" className="text-[0.8rem] text-muted-foreground">
                Your LinkedIn profile URL (optional)
              </div>
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
                className="h-11"
                value={formValues.portfolioUrl}
                onChange={handleInputChange}
                autoComplete="url"
                aria-describedby="portfolio-hint portfolio-error"
              />
              {fields.portfolioUrl?.errors && (
                <div id="portfolio-error" className="text-destructive text-sm">
                  {fields.portfolioUrl.errors}
                </div>
              )}
              <div id="portfolio-hint" className="text-[0.8rem] text-muted-foreground">
                Your personal website or portfolio URL (optional)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPrevTab}
          id="social-back-button"
          className="px-4"
          aria-label="Go back to branding tab"
          data-testid="social-back-button"
        >
          <SimpleIcon name="arrowleft" size={16} color="currentColor" className="mr-2" />
          Back
        </Button>
        <SubmitButton 
          text="Create Site" 
          className="px-6"
          variant="default"
          data-testid="create-site-button"
        />
      </CardFooter>
    </>
  );
} 