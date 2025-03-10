"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { SiteFormValues } from "../utils/types";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";

// Create a submit button component that shows loading state
function SubmitButton({ isPending }: { isPending?: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isPending;
  
  return (
    <Button 
      type="submit" 
      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5 h-auto shadow-md hover:shadow-lg transition-all"
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          <SimpleIcon name="check" size={18} />
          <span>Create Your Blog</span>
        </>
      )}
    </Button>
  );
}

interface SummaryTabProps {
  formValues: SiteFormValues;
  siteImageCover: string | null;
  logoImage: string | null;
  goToPrevTab: (e?: React.MouseEvent) => void;
  isPending?: boolean;
}

/**
 * SummaryTab component for reviewing all site information
 * Final step before submission with elegant UI/UX
 */
export function SummaryTab({ 
  formValues, 
  siteImageCover, 
  logoImage, 
  goToPrevTab,
  isPending
}: SummaryTabProps) {
  // Check if any social links are provided
  const hasSocialLinks = Boolean(
    formValues.email || 
    formValues.githubUrl || 
    formValues.linkedinUrl || 
    formValues.portfolioUrl
  );

  return (
    <div className="summary-tab-content">
      <CardContent className="space-y-8 pt-8 px-6 sm:px-8">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold flex items-center gap-2 justify-center mb-2">
              <SimpleIcon name="check" size={24} className="text-primary" />
              Review Your Site
            </h2>
            <p className="text-sm text-muted-foreground">
              Please review your site information before creating it
            </p>
          </div>

          {/* Site Preview Card */}
          <div className="rounded-xl border overflow-hidden bg-card shadow-md max-w-4xl mx-auto transition-all hover:shadow-lg">
            {/* Cover Image */}
            <div className="relative w-full h-56 sm:h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
              {siteImageCover ? (
                <Image 
                  src={siteImageCover} 
                  alt="Site Cover" 
                  fill 
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <SimpleIcon name="image" size={48} className="mx-auto text-muted-foreground/70" />
                    <p className="text-sm mt-2 font-medium">No cover image</p>
                  </div>
                </div>
              )}
              
              {/* Overlay gradient for better text contrast if there's an image */}
              {siteImageCover && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              )}
            </div>
            
            {/* Site Header - Centered with elegant spacing */}
            <div className="p-8 pb-4 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {logoImage ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-background flex-shrink-0 shadow-sm mx-auto sm:mx-0">
                    <Image 
                      src={logoImage} 
                      alt="Logo" 
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border shadow-sm mx-auto sm:mx-0">
                    <SimpleIcon name="image" size={36} className="text-muted-foreground/70" />
                  </div>
                )}
                <div className="flex-grow min-w-0 text-center sm:text-left">
                  <h3 className="text-2xl font-bold truncate max-w-full">{formValues.name}</h3>
                  <div className="flex items-center mt-3 gap-2 flex-wrap justify-center sm:justify-start">
                    <Badge variant="outline" className="font-mono text-sm px-3 py-1.5 flex items-center gap-2 border-primary/20 max-w-full">
                      <SimpleIcon name="globe" size={16} className="text-primary flex-shrink-0" />
                      <span className="font-medium truncate overflow-hidden">{`blogstack.io/${formValues.subdirectory}`}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-sm px-3 py-1.5 flex items-center gap-2">
                      <SimpleIcon name="languages" size={16} className="flex-shrink-0" />
                      <span className="truncate">{formValues.language}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="leading-relaxed break-words whitespace-normal overflow-hidden">{formValues.description}</p>
              </div>
            </div>
            
            {/* Contact & Social Section - Elegant styling */}
            <div className="px-8 pb-8 pt-2 max-w-3xl mx-auto">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
                <SimpleIcon name="link" size={16} className="text-primary" />
                Contact & Social
              </h4>
              
              {hasSocialLinks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formValues.email && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <SimpleIcon name="mail" size={18} className="text-primary/70 flex-shrink-0" />
                      <span className="truncate overflow-hidden">{formValues.email}</span>
                    </div>
                  )}
                  {formValues.githubUrl && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <SimpleIcon name="github" size={18} className="text-primary/70 flex-shrink-0" />
                      <span className="truncate overflow-hidden">{formValues.githubUrl}</span>
                    </div>
                  )}
                  {formValues.linkedinUrl && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <SimpleIcon name="linkedin" size={18} className="text-primary/70 flex-shrink-0" />
                      <span className="truncate overflow-hidden">{formValues.linkedinUrl}</span>
                    </div>
                  )}
                  {formValues.portfolioUrl && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <SimpleIcon name="link" size={18} className="text-primary/70 flex-shrink-0" />
                      <span className="truncate overflow-hidden">{formValues.portfolioUrl}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <SimpleIcon name="userx" size={24} className="text-muted-foreground/50" />
                    <p className="text-sm">No contact or social links provided</p>
                    <p className="text-xs">You can add these later from your site settings</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Summary Message */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 text-sm max-w-3xl mx-auto border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <div className="flex gap-4">
              <SimpleIcon name="info" size={24} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2 text-base">Ready to create your blog?</p>
                <p className="text-muted-foreground leading-relaxed break-words">
                  Once created, you can start adding blog posts and customizing your site further from the dashboard.
                  Your site will be immediately available at <span className="font-mono text-primary font-medium break-all">{`blogstack.io/${formValues.subdirectory}`}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 sm:px-8 flex flex-col sm:flex-row sm:justify-between gap-4 border-t py-8 max-w-4xl mx-auto">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevTab}
          className="flex items-center gap-2 px-5 py-2.5 h-auto"
          // Disable back button during form submission
          disabled={useFormStatus().pending || isPending}
        >
          <SimpleIcon name="arrowleft" size={16} />
          Back
        </Button>
        
        <SubmitButton isPending={isPending} />
      </CardFooter>
    </div>
  );
} 