"use client";

import Image from "next/image";

import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Separator } from "@/components/ui/separator";

import type { SiteFormValues } from "../../utils/types";

function SubmitButton({ isPending }: { isPending?: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isPending;

  return (
    <Button
      type="submit"
      className="flex h-auto items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

interface SummaryStepProps {
  formValues: SiteFormValues;
  siteImageCover: string | null;
  logoImage: string | null;
  goToPrevStep: (e?: React.MouseEvent) => void;
  isPending?: boolean;
}

/**
 * SummaryStep component for reviewing all site information
 * Final step before submission with elegant UI/UX
 */
export function SummaryStep({ formValues, siteImageCover, logoImage, goToPrevStep, isPending }: SummaryStepProps) {
  // Check if any social links are provided
  const hasSocialLinks = Boolean(
    formValues.email || formValues.githubUrl || formValues.linkedinUrl || formValues.portfolioUrl
  );

  return (
    <div className="summary-step-content">
      <CardContent className="space-y-8 px-6 pt-8 sm:px-8">
        <div className="space-y-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-semibold">
              <SimpleIcon name="check" size={24} className="text-primary" />
              Review Your Site
            </h2>
            <p className="text-sm text-muted-foreground">Please review your site information before creating it</p>
          </div>

          {/* Site Preview Card */}
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card shadow-md transition-all hover:shadow-lg">
            {/* Cover Image */}
            <div className="relative h-56 w-full border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 sm:h-64">
              {siteImageCover ? (
                <Image src={siteImageCover} alt="Site Cover" fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <SimpleIcon name="image" size={48} className="mx-auto text-muted-foreground/70" />
                    <p className="mt-2 text-sm font-medium">No cover image</p>
                  </div>
                </div>
              )}

              {/* Overlay gradient for better text contrast if there's an image */}
              {siteImageCover && <div className="absolute inset-0 from-black/30 to-transparent" />}
            </div>

            {/* Site Header - Centered with elegant spacing */}
            <div className="mx-auto max-w-3xl p-8 pb-4">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {logoImage ? (
                  <div className="relative mx-auto h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-background shadow-sm sm:mx-0">
                    <Image src={logoImage} alt="Logo" fill className="object-cover" priority />
                  </div>
                ) : (
                  <div className="mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border bg-muted shadow-sm sm:mx-0">
                    <SimpleIcon name="image" size={36} className="text-muted-foreground/70" />
                  </div>
                )}
                <div className="min-w-0 flex-grow text-center sm:text-left">
                  <h3 className="max-w-full truncate text-2xl font-bold">{formValues.name}</h3>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Badge
                      variant="outline"
                      className="flex max-w-full items-center gap-2 border-primary/20 px-3 py-1.5 font-mono text-sm"
                    >
                      <SimpleIcon name="globe" size={16} className="flex-shrink-0 text-primary" />
                      <span className="overflow-hidden truncate font-medium">{`blogstack.io/${formValues.subdirectory}`}</span>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm">
                      <SimpleIcon name="languages" size={16} className="flex-shrink-0" />
                      <span className="truncate">
                        {formValues.language === "LTR" ? "Left to Right" : "Right to Left"}
                        <span className="ml-1 opacity-70">({formValues.language})</span>
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="overflow-hidden whitespace-normal break-words leading-relaxed">
                  {formValues.description}
                </p>
              </div>
            </div>

            {/* Contact & Social Section - Elegant styling */}
            <div className="mx-auto max-w-3xl px-8 pb-8 pt-2">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SimpleIcon name="link" size={16} className="text-primary" />
                Contact & Social
              </h4>

              {hasSocialLinks ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {formValues.email && (
                    <div className="flex items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50">
                      <SimpleIcon name="mail" size={18} className="flex-shrink-0 text-primary/70" />
                      <span className="overflow-hidden truncate">{formValues.email}</span>
                    </div>
                  )}
                  {formValues.githubUrl && (
                    <div className="flex items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50">
                      <SimpleIcon name="github" size={18} className="flex-shrink-0 text-primary/70" />
                      <span className="overflow-hidden truncate">{formValues.githubUrl}</span>
                    </div>
                  )}
                  {formValues.linkedinUrl && (
                    <div className="flex items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50">
                      <SimpleIcon name="linkedin" size={18} className="flex-shrink-0 text-primary/70" />
                      <span className="overflow-hidden truncate">{formValues.linkedinUrl}</span>
                    </div>
                  )}
                  {formValues.portfolioUrl && (
                    <div className="flex items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50">
                      <SimpleIcon name="link" size={18} className="flex-shrink-0 text-primary/70" />
                      <span className="overflow-hidden truncate">{formValues.portfolioUrl}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-4 text-center">
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
          <div className="mx-auto max-w-3xl rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex gap-4">
              <SimpleIcon name="info" size={24} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <div>
                <p className="mb-2 text-base font-semibold">Ready to create your blog?</p>
                <p className="break-words leading-relaxed text-muted-foreground">
                  Once created, you can start adding blog posts and customizing your site further from the blog settings
                  page. Your site will be immediately available at{" "}
                  <span className="break-all font-mono font-medium text-primary">{`blogstack.io/${formValues.subdirectory}`}</span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mx-auto flex max-w-4xl flex-col gap-4 border-t px-6 py-8 sm:flex-row sm:justify-between sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevStep}
          className="flex h-auto items-center gap-2 px-5 py-2.5 text-foreground"
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
