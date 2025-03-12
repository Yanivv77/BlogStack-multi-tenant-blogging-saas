"use client";

import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/upload/uploadthing";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UpdateImage } from "@/app/serverActions/image/updateImage";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface ImageUploadCardProps {
  siteId: string;
  title: string;
  description: string;
  imageType: "site" | "logo";
  existingImageUrl: string | null;
  aspectRatio?: "landscape" | "square";
}

export function ImageUploadCard({ 
  siteId, 
  title, 
  description, 
  imageType, 
  existingImageUrl, 
  aspectRatio = "landscape" 
}: ImageUploadCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Update imageUrl when existingImageUrl changes
  useEffect(() => {
    if (existingImageUrl !== imageUrl) {
      setImageUrl(existingImageUrl);
    }
  }, [existingImageUrl]);
  
  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

  // Function to handle form submission
  const submitForm = useCallback(() => {
    if (formRef.current && imageUrl) {
      setIsSubmitting(true);
      formRef.current.requestSubmit();
    }
  }, [imageUrl]);
  
  // Reset states and try again
  const handleRetry = () => {
    setUploadError(null);
    setIsUploading(false);
  };

  // Handle form action
  const handleFormAction = async (formData: FormData) => {
    try {
      // Ensure we have an image URL
      if (!imageUrl) {
        toast.error("No image URL available");
        return;
      }
      
      // Add required information
      formData.set("type", imageType);
      formData.set("imageUrl", imageUrl);
      formData.set("siteId", siteId);
      
      console.log(`Submitting ${imageType} update with URL:`, imageUrl);
      
      const result = await UpdateImage(formData);
      
      if (result && 'success' in result && result.success) {
        toast.success("Image updated successfully!");
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center">
          {imageUrl ? (
            <div className="w-full flex-1 flex flex-col items-center">
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
                <SimpleIcon name="x" size={24} className="text-destructive" />
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-1">Upload Error</h3>
                  <p className="text-xs text-muted-foreground mb-1">{uploadError}</p>
                </div>
              </div>
            </div>
          ) : isUploading ? (
            <div className="w-full flex-1 flex items-center justify-center">
              <div className="border-dashed border-2 border-muted-foreground rounded-md p-6 flex flex-col items-center justify-center mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <SimpleIcon name="loader" size={28} className="animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex items-center justify-center">
              <div className="border-dashed border-2 border-muted-foreground/50 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className={`${imageContainerClass} flex items-center justify-center bg-muted/30`}>
                  <SimpleIcon name="image" size={40} className="text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 mb-4 text-center">
                  No image uploaded
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
                      
                      // Auto-submit the form after successful upload
                      setTimeout(() => {
                        if (formRef.current && url) {
                          formRef.current.requestSubmit();
                        }
                      }, 500);
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
          {imageUrl ? (
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setImageUrl(null)}
              className="mr-2"
            >
              Change
            </Button>
          ) : uploadError ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center gap-1"
            >
              <SimpleIcon name="arrowright" size={12} className="rotate-180" /> Try Again
            </Button>
          ) : null}
          
          {imageUrl && (
            <Button 
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
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