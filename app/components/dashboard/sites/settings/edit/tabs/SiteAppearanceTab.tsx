"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import type { AppearanceTabProps } from "@/app/components/dashboard/sites/utils/types";
import { UpdateImage } from "@/app/serverActions/image/updateImage";
import { getOptimizedDropzoneConfig, UploadDropzone } from "@/app/utils/upload/uploadthing";

// Define the upload response type
type UploadResponse = { ufsUrl: string }[];

/**
 * Tab component for site appearance settings
 */
export function SiteAppearanceTab({ siteId, site }: AppearanceTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Site Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize how your site looks to visitors</p>
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
  aspectRatio = "landscape",
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

      if (result && "success" in result && result.success) {
        toast.success("Image updated successfully!");
        setIsChanging(false);
      } else {
        const errorMessage = result && "error" in result ? result.error : "Failed to update image";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Image update error:", error);
      toast.error(`Failed to update image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageHeight = aspectRatio === "landscape" ? "h-[160px]" : "h-[120px]";
  const imageWidth = aspectRatio === "landscape" ? "w-full" : "w-[120px]";
  const imageContainerClass = `relative ${imageWidth} ${imageHeight} mx-auto`;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center">
          {(() => {
            if (imageUrl && !isChanging) {
              return (
                <div className="relative w-full">
                  <div className={imageContainerClass}>
                    <Image
                      src={imageUrl}
                      alt={title}
                      className="rounded-lg object-cover"
                      fill
                      sizes={aspectRatio === "landscape" ? "(max-width: 768px) 100vw, 400px" : "120px"}
                    />
                  </div>
                </div>
              );
            }

            if (uploadError) {
              return (
                <div className="flex w-full flex-1 items-center justify-center">
                  <div className="mx-auto flex flex-col items-center justify-center space-y-3 rounded-md border-2 border-dashed border-destructive/30 bg-destructive/5 p-4">
                    <SimpleIcon name="alerttriangle" className="size-6 text-destructive" />
                    <div className="text-center">
                      <h3 className="mb-1 text-sm font-semibold text-foreground">Upload Error</h3>
                      <p className="mb-1 text-xs text-muted-foreground">{uploadError}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (isUploading) {
              return (
                <div className="flex w-full flex-1 items-center justify-center">
                  <div className="mx-auto flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/40 p-6">
                    <div className="flex flex-col items-center gap-2">
                      <SimpleIcon name="loader" className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading image...</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="flex w-full flex-1 items-center justify-center">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-4">
                  <div className={`${imageContainerClass} flex items-center justify-center bg-muted/30`}>
                    <SimpleIcon name="image" className="size-10 text-muted-foreground/40" />
                  </div>
                  <p className="mb-4 mt-2 text-center text-xs text-muted-foreground">
                    {isChanging && imageUrl ? "Select a new image" : "No image uploaded"}
                  </p>
                  <UploadDropzone
                    endpoint="imageUploader"
                    onUploadBegin={() => {
                      setIsUploading(true);
                      setUploadError(null);
                    }}
                    onClientUploadComplete={(res: UploadResponse) => {
                      setIsUploading(false);
                      if (res?.[0]?.ufsUrl) {
                        console.info("Upload response:", res[0]);
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
                      container: "w-full",
                    }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex justify-center border-t pb-4 pt-2">
        <form ref={formRef} action={handleFormAction} className="flex w-full justify-center">
          {uploadError && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="mr-2 flex items-center gap-1 text-foreground"
            >
              <SimpleIcon name="refreshcw" size={12} className="mr-1" /> Try Again
            </Button>
          )}

          {imageUrl && !isChanging && (
            <Button type="button" size="sm" variant="outline" onClick={toggleChange} className="mr-2 text-foreground">
              Change
            </Button>
          )}

          {isChanging && (
            <Button type="button" size="sm" variant="outline" onClick={toggleChange} className="mr-2 text-foreground">
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
