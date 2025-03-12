"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/upload/uploadthing";
import { UpdateImage } from "@/app/serverActions/image/updateImage";
import { AppearanceTabProps } from "@/app/components/dashboard/sites/utils/types";

/**
 * Tab component for site appearance settings
 */
export function SiteAppearanceTab({ siteId, site }: AppearanceTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Site Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your site looks to visitors
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="h-full">
          <SiteImageCard 
            title="Cover Image"
            description="This image appears at the top of your site's homepage"
            imageUrl={site?.siteImageCover || null}
            imageType="site"
            siteId={siteId}
            aspectRatio="landscape"
          />
        </div>
        
        <div className="h-full">
          <SiteImageCard 
            title="Site Logo"
            description="Your site's logo appears in the header and navigation"
            imageUrl={site?.logoImage || null}
            imageType="logo"
            siteId={siteId}
            aspectRatio="square"
          />
        </div>
      </div>
    </div>
  );
}

// A full-featured image card with upload functionality
function SiteImageCard({ 
  title, 
  description, 
  imageUrl: initialImageUrl, 
  imageType,
  siteId,
  aspectRatio = "landscape"
}: { 
  title: string; 
  description: string; 
  imageUrl: string | null;
  imageType: "site" | "logo";
  siteId: string;
  aspectRatio?: "landscape" | "square";
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

  // Function to handle form submission
  const submitForm = useCallback(() => {
    if (formRef.current && imageUrl) {
      setIsSubmitting(true);
      formRef.current.requestSubmit();
    }
  }, [imageUrl]);
  
  // Reset error state
  const handleRetry = () => {
    setUploadError(null);
    setIsUploading(false);
  };
  
  // Toggle the changing state
  const toggleChange = () => {
    setIsChanging(!isChanging);
    setUploadError(null);
  };

  // Handle form action
  const handleFormAction = async (formData: FormData) => {
    try {
      if (!imageUrl) {
        toast.error("No image URL available");
        return;
      }
      
      // Add required information
      formData.set("type", imageType);
      formData.set("imageUrl", imageUrl);
      formData.set("siteId", siteId);
      
      const result = await UpdateImage(formData);
      
      if (result && 'success' in result && result.success) {
        toast.success("Image updated successfully!");
        setIsChanging(false);
      } else {
        const errorMessage = result && 'error' in result ? result.error : "Failed to update image";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Image update error:", error);
      toast.error("Failed to update image: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageHeight = aspectRatio === "landscape" ? "h-[160px]" : "h-[120px]";
  const imageWidth = aspectRatio === "landscape" ? "w-full" : "w-[120px]";
  const imageContainerClass = `relative ${imageWidth} ${imageHeight} mx-auto`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          {imageUrl && !isChanging ? (
            <div className="relative w-full">
              <div className={imageContainerClass}>
                <Image
                  src={imageUrl}
                  alt={title}
                  className="object-cover rounded-lg"
                  fill
                  sizes={aspectRatio === "landscape" ? "(max-width: 768px) 100vw, 400px" : "120px"}
                />
              </div>
            </div>
          ) : uploadError ? (
            <div className="w-full flex-1 flex items-center justify-center">
              <div className="border-dashed border-2 border-destructive/30 bg-destructive/5 rounded-md p-4 flex flex-col items-center justify-center space-y-3 mx-auto">
                <SimpleIcon name="alerttriangle" className="text-destructive size-6" />
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-1 text-foreground">Upload Error</h3>
                  <p className="text-xs text-muted-foreground mb-1">{uploadError}</p>
                </div>
              </div>
            </div>
          ) : isUploading ? (
            <div className="w-full flex-1 flex items-center justify-center">
              <div className="border-dashed border-2 border-muted-foreground/40 rounded-md p-6 flex flex-col items-center justify-center mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <SimpleIcon name="loader" className="h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex items-center justify-center">
              <div className="border-dashed border-2 border-muted-foreground/50 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className={`${imageContainerClass} flex items-center justify-center bg-muted/30`}>
                  <SimpleIcon name="image" className="size-10 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 mb-4 text-center">
                  {isChanging && imageUrl ? "Select a new image" : "No image uploaded"}
                </p>
                <UploadDropzone
                  endpoint="imageUploader"
                  onUploadBegin={() => {
                    setIsUploading(true);
                    setUploadError(null);
                  }}
                  onClientUploadComplete={(res: any) => {
                    setIsUploading(false);
                    if (res && res[0] && res[0].ufsUrl) {
                      console.log("Upload response:", res[0]);
                      const url = res[0].ufsUrl;
                      setImageUrl(url);
                      toast.success("Image uploaded successfully!");
                      
                      // Auto-submit if the user is changing an existing image
                      if (isChanging) {
                        setTimeout(submitForm, 500);
                      }
                    } else {
                      console.error("Invalid upload response:", res);
                      setUploadError("Received invalid response from upload service");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false);
                    console.error("Upload error:", error);
                    setUploadError(`Upload failed: ${error.message || "Network issue detected"}`);
                  }}
                  {...optimizedConfig}
                  appearance={{
                    button: "bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded",
                    allowedContent: "hidden",
                    container: "w-full"
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-2 pb-4 flex justify-center border-t">
        <form 
          ref={formRef} 
          action={handleFormAction}
          className="w-full flex justify-center"
        >
          {uploadError && (
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-1 mr-2 text-foreground"
            >
              <SimpleIcon name="refreshcw" size={12} className="mr-1" /> Try Again
            </Button>
          )}
          
          {imageUrl && !isChanging && (
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={toggleChange}
              className="text-foreground mr-2"
            >
              Change
            </Button>
          )}
          
          {isChanging && (
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={toggleChange}
              className="text-foreground mr-2"
            >
              Cancel
            </Button>
          )}
          
          {imageUrl && !isChanging && (
            <Button 
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <SimpleIcon name="loader" size={12} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  );
} 