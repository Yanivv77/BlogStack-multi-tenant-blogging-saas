"use client";

import Image from "next/image";
import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Label } from "@/components/ui/label";

import { getOptimizedDropzoneConfig, UploadDropzone } from "@/app/utils/upload/uploadthing";

import type { BrandingStepProps } from "../../utils/types";

type UploadResponse = { ufsUrl: string }[];

/**
 * BrandingStep component for uploading site images
 * Second step in the site creation process
 */
export function BrandingStep({
  siteImageCover,
  setSiteImageCover,
  logoImage,
  setLogoImage,
  goToNextStep,
  goToPrevStep,
}: BrandingStepProps) {
  // Add loading states for better UX
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

  /**
   * Handler for cover image upload
   */
  const handleCoverImageUpload = (imageUrl: string) => {
    setIsUploadingCover(false);
    setSiteImageCover(imageUrl);
    toast.success("Cover image uploaded successfully!");
  };

  /**
   * Handler for logo image upload
   */
  const handleLogoImageUpload = (imageUrl: string) => {
    setIsUploadingLogo(false);
    setLogoImage(imageUrl);
    toast.success("Logo uploaded successfully!");
  };

  return (
    <>
      <CardContent className="space-y-6 px-6 pt-6 sm:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <SimpleIcon name="image" size={20} color="currentColor" />
              Visual Branding
            </h2>
            <p className="text-sm text-muted-foreground">Add visual elements to make your site stand out</p>
          </div>

          {/* Cover Image */}
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <Label htmlFor="site-cover-image" className="text-base">
              Site Cover Image
            </Label>
            <div className="flex flex-col items-center gap-4">
              {siteImageCover ? (
                <div className="relative w-full max-w-[500px]">
                  <Image
                    src={siteImageCover}
                    alt="Cover"
                    className="aspect-video h-auto w-full rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => setSiteImageCover("")}
                    aria-label="Remove cover image"
                  >
                    <SimpleIcon name="x" size={16} color="currentColor" />
                  </Button>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  {isUploadingCover ? (
                    <div className="flex aspect-video w-full max-w-[500px] flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground p-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onUploadBegin={() => {
                        setIsUploadingCover(true);
                      }}
                      onClientUploadComplete={(res) => {
                        const response = res as UploadResponse;
                        const imageUrl = response[0].ufsUrl;
                        handleCoverImageUpload(imageUrl);
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingCover(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      {...optimizedConfig}
                      appearance={{
                        ...optimizedConfig.appearance,
                        container:
                          "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[500px] aspect-video flex flex-col items-center justify-center",
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Hidden input to store the image URL */}
            {siteImageCover && (
              <input
                type="hidden"
                id="site-cover-image"
                name="siteImageCover"
                value={siteImageCover}
                aria-label="Site cover image URL"
              />
            )}
            <div id="cover-image-hint" className="text-[0.8rem] text-muted-foreground">
              This image will appear at the top of your site and in shared links
            </div>
          </div>

          {/* Logo Image */}
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <Label htmlFor="site-logo-image" className="text-base">
              Profile / Logo Image
            </Label>
            <div className="flex flex-col items-center gap-4">
              {logoImage ? (
                <div className="relative w-full max-w-[200px]">
                  <Image src={logoImage} alt="Logo" className="h-auto w-full rounded-md" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => setLogoImage("")}
                    aria-label="Remove logo image"
                  >
                    <SimpleIcon name="x" size={16} color="currentColor" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  {isUploadingLogo ? (
                    <div className="flex h-[200px] w-full max-w-[270px] flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground p-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onUploadBegin={() => {
                        setIsUploadingLogo(true);
                      }}
                      onClientUploadComplete={(res) => {
                        const response = res as UploadResponse;
                        const imageUrl = response[0].ufsUrl;
                        handleLogoImageUpload(imageUrl);
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingLogo(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      {...optimizedConfig}
                      appearance={{
                        ...optimizedConfig.appearance,
                        container:
                          "border-dashed border-2 border-muted-foreground rounded-md p-6 w-full max-w-[270px] h-[200px] flex flex-col items-center justify-center",
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Hidden input to store the logo URL */}
            {logoImage && (
              <input
                type="hidden"
                id="site-logo-image"
                name="logoImage"
                value={logoImage}
                aria-label="Site logo image URL"
              />
            )}
            <div id="logo-image-hint" className="text-[0.8rem] text-muted-foreground">
              Upload your profile image or logo (optional)
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 pb-8 pt-2 sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevStep}
          id="branding-back-button"
          className="px-4 text-foreground"
          aria-label="Go back to basics step"
          data-testid="branding-back-button"
          disabled={isUploadingCover || isUploadingLogo}
        >
          <SimpleIcon name="arrowleft" size={16} color="currentColor" className="mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={goToNextStep}
          className="gap-2 px-6"
          id="branding-next-button"
          aria-label="Continue to social step"
          data-testid="branding-continue-button"
          disabled={isUploadingCover || isUploadingLogo}
        >
          {isUploadingCover || isUploadingLogo ? (
            <>
              <span className="animate-pulse">Processing</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            <>
              Continue <SimpleIcon name="arrowright" size={16} color="currentColor" />
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );
}
