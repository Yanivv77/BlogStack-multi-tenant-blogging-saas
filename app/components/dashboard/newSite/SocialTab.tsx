"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { memo } from "react";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface FormValues {
  name: string;
  subdirectory: string;
  description: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

interface SocialTabProps {
  fields: any;
  goToPrevTab: () => void;
  formValues: FormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SocialTab = memo(function SocialTab({ 
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor={fields.email.id} className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="mail" size={20} color="currentColor" />
                  Contact Email
                </div>
              </Label>
              <Input
                id={fields.email.id}
                name="email"
                type="email"
                placeholder="contact@yourdomain.com"
                className="h-11"
                value={formValues.email}
                onChange={handleInputChange}
              />
              {fields.email.errors && (
                <div className="text-destructive text-sm">
                  {fields.email.errors}
                </div>
              )}
              <div className="text-[0.8rem] text-muted-foreground">
                This email will be displayed as a contact option on your site
              </div>
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor={fields.githubUrl.id} className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="github" size={20} />
                  GitHub URL
                </div>
              </Label>
              <Input
                id={fields.githubUrl.id}
                name="githubUrl"
                placeholder="https://github.com/yourusername"
                className="h-11"
                value={formValues.githubUrl}
                onChange={handleInputChange}
              />
              {fields.githubUrl.errors && (
                <div className="text-destructive text-sm">
                  {fields.githubUrl.errors}
                </div>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor={fields.linkedinUrl.id} className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="linkedin" size={20} />
                  LinkedIn URL
                </div>
              </Label>
              <Input
                id={fields.linkedinUrl.id}
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                className="h-11"
                value={formValues.linkedinUrl}
                onChange={handleInputChange}
              />
              {fields.linkedinUrl.errors && (
                <div className="text-destructive text-sm">
                  {fields.linkedinUrl.errors}
                </div>
              )}
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor={fields.portfolioUrl.id} className="text-base">
                <div className="flex items-center gap-2">
                  <SimpleIcon name="globe" size={20} color="currentColor" />
                  Portfolio URL
                </div>
              </Label>
              <Input
                id={fields.portfolioUrl.id}
                name="portfolioUrl"
                placeholder="https://yourportfolio.com"
                className="h-11"
                value={formValues.portfolioUrl}
                onChange={handleInputChange}
              />
              {fields.portfolioUrl.errors && (
                <div className="text-destructive text-sm">
                  {fields.portfolioUrl.errors}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
        <Button type="button" variant="outline" onClick={goToPrevTab}>
          Back
        </Button>
        <SubmitButton text="Create Site" />
      </CardFooter>
    </>
  );
}); 