"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/app/utils/UploadthingComponents";
import { toast } from "sonner";
import { memo } from "react";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface BrandingTabProps {
  fields: any;
  siteImageCover: string;
  setSiteImageCover: (url: string) => void;
  logoImage: string;
  setLogoImage: (url: string) => void;
  goToNextTab: () => void;
  goToPrevTab: () => void;
}

// Using memo to prevent unnecessary re-renders
export const BrandingTab = memo(function BrandingTab({ 
  fields, 
  siteImageCover, 
  setSiteImageCover, 
  logoImage, 
  setLogoImage, 
  goToNextTab, 
  goToPrevTab 
}: BrandingTabProps) {
  // Handler for cover image upload
  const handleCoverImageUpload = (imageUrl: string) => {
    setSiteImageCover(imageUrl);
    toast.success("Cover image uploaded successfully!");
  };
  
  // Handler for logo image upload
  const handleLogoImageUpload = (imageUrl: string) => {
    setLogoImage(imageUrl);
    toast.success("Image uploaded successfully!");
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
            <Label className="text-base">Site Cover Image</Label>
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
                  >
                    <SimpleIcon name="x" size={16} color="currentColor"/>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res: any) => {
                      const imageUrl = res[0].ufsUrl;
                      handleCoverImageUpload(imageUrl);
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                    config={{ mode: "auto" }}
                    appearance={{
                      button: "hidden",
                      allowedContent: "hidden",
                      container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[500px] aspect-video flex flex-col items-center justify-center"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hidden input to store the image URL */}
            {siteImageCover && (
              <input
                type="hidden"
                name={fields.siteImageCover.name}
                value={siteImageCover}
              />
            )}
            <div className="text-[0.8rem] text-muted-foreground">
              This image will appear at the top of your site and in shared links
            </div>
          </div>

          {/* Logo Image */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
            <Label className="text-base">Profile / Logo Image</Label>
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
                  >
                    <SimpleIcon name="x" size={16} color="currentColor"/>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res: any) => {
                      const imageUrl = res[0].ufsUrl;
                      handleLogoImageUpload(imageUrl);
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                    config={{ mode: "auto" }}
                    appearance={{
                      button: "hidden",
                      allowedContent: "hidden",
                      container: "border-dashed border-2 border-muted-foreground rounded-md p-6 w-full max-w-[270px] h-[200px] flex flex-col items-center justify-center"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hidden input to store the logo URL */}
            {logoImage && (
              <input
                type="hidden"
                name="logoImage"
                value={logoImage}
              />
            )}
            <div className="text-[0.8rem] text-muted-foreground">
              Upload your profile image or logo (optional)
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
        <Button type="button" variant="outline" onClick={goToPrevTab}>
          Back
        </Button>
        <Button type="button" onClick={goToNextTab} className="gap-2 px-6">
          Continue <SimpleIcon name="arrowright" size={16} color="currentColor"/>
        </Button>
      </CardFooter>
    </>
  );
}); 