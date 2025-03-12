"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/upload/uploadthing";
import { toast } from "sonner";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { BrandingStepProps } from "../../utils/types";

/**
 * BrandingStep component for uploading site images
 * Second step in the site creation process
 */
export function BrandingStep({ 
  fields, 
  siteImageCover, 
  setSiteImageCover, 
  logoImage, 
  setLogoImage, 
  goToNextStep, 
  goToPrevStep 
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
      <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SimpleIcon name="image" size={20} color="currentColor"/>
              Visual Branding
            </h2>
            <p className="text-sm text-muted-foreground">
              Add visual elements to make your site stand out
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
            <Label htmlFor="site-cover-image" className="text-base">Site Cover Image</Label>
            <div className="flex flex-col items-center gap-4">
              {siteImageCover ? (
                <div className="relative w-full max-w-[500px]">
                  <img
                    src={siteImageCover}
                    alt="Cover"
                    className="w-full h-auto rounded-md object-cover aspect-video"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setSiteImageCover("")}
                    aria-label="Remove cover image"
                  >
                    <SimpleIcon name="x" size={16} color="currentColor"/>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  {isUploadingCover ? (
                    <div className="border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[500px] aspect-video flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onUploadBegin={() => {
                        setIsUploadingCover(true);
                      }}
                      onClientUploadComplete={(res: any) => {
                        const imageUrl = res[0].ufsUrl;
                        handleCoverImageUpload(imageUrl);
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingCover(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      {...optimizedConfig}
                      appearance={{
                        ...optimizedConfig.appearance,
                        container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[500px] aspect-video flex flex-col items-center justify-center"
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
          <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
            <Label htmlFor="site-logo-image" className="text-base">Profile / Logo Image</Label>
            <div className="flex flex-col items-center gap-4">
              {logoImage ? (
                <div className="relative w-full max-w-[200px]">
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="w-full h-auto rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setLogoImage("")}
                    aria-label="Remove logo image"
                  >
                    <SimpleIcon name="x" size={16} color="currentColor"/>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  {isUploadingLogo ? (
                    <div className="border-dashed border-2 border-muted-foreground rounded-md p-6 w-full max-w-[270px] h-[200px] flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onUploadBegin={() => {
                        setIsUploadingLogo(true);
                      }}
                      onClientUploadComplete={(res: any) => {
                        const imageUrl = res[0].ufsUrl;
                        handleLogoImageUpload(imageUrl);
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingLogo(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      {...optimizedConfig}
                      appearance={{
                        ...optimizedConfig.appearance,
                        container: "border-dashed border-2 border-muted-foreground rounded-md p-6 w-full max-w-[270px] h-[200px] flex flex-col items-center justify-center"
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
      <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
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
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : (
            <>Continue <SimpleIcon name="arrowright" size={16} color="currentColor"/></>
          )}
        </Button>
      </CardFooter>
    </>
  );
} 