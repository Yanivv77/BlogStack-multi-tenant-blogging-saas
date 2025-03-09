"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { memo } from "react";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface FormValues {
  name: string;
  subdirectory: string;
  description: string;
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
              Let's start with the essential details of your site
            </p>
          </div>

          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor={fields.name.id} className="text-base">
              Site Name
            </Label>
            <Input
              id={fields.name.id}
              name="name"
              placeholder="My Awesome Blog"
              className="h-11"
              required
              value={formValues.name}
              onChange={handleInputChange}
            />
            <div className="text-[0.8rem] text-muted-foreground">
              Choose a memorable name for your site
            </div>
            {fields.name.errors && (
              <div className="text-destructive text-sm">
                {fields.name.errors}
              </div>
            )}
          </div>

          {/* Subdirectory */}
          <div className="space-y-2">
            <Label htmlFor={fields.subdirectory.id} className="text-base">
              Subdirectory
            </Label>
            <div className="flex items-center">
              <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-muted-foreground">
                blogstack.io/
              </span>
              <Input
                id={fields.subdirectory.id}
                name="subdirectory"
                placeholder="your-site"
                className="h-11 rounded-l-none"
                required
                value={formValues.subdirectory}
                onChange={handleInputChange}
              />
            </div>
            <div className="text-[0.8rem] text-muted-foreground">
              This will be your site's URL (only letters, numbers, and hyphens)
            </div>
            {fields.subdirectory.errors && (
              <div className="text-destructive text-sm">
                {fields.subdirectory.errors}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor={fields.description.id} className="text-base">
              Description
            </Label>
            <Textarea
              id={fields.description.id}
              name="description"
              placeholder="Tell readers what your site is about..."
              className="min-h-[120px] resize-none"
              required
              value={formValues.description}
              onChange={handleInputChange}
            />
            <div className="text-[0.8rem] text-muted-foreground">
              A brief description that will appear in search results and site previews
            </div>
            {fields.description.errors && (
              <div className="text-destructive text-sm">
                {fields.description.errors}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pb-8 px-6 sm:px-8 pt-2">
        <Button type="button" onClick={goToNextTab}>
          Next Step
        </Button>
      </CardFooter>
    </>
  );
}); 