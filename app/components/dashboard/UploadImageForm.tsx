"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { UpdateImage } from "@/app/serverActions/image/updateImage";
import { getOptimizedDropzoneConfig, UploadDropzone } from "@/app/utils/upload/uploadthing";

interface iAppProps {
  siteId: string;
}

export function UploadImageForm({ siteId }: iAppProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

      // Add type information to identify this as a site image update
      formData.set("type", "site");
      formData.set("imageUrl", imageUrl);

      console.log("Submitting image update with URL:", imageUrl);

      const result = await UpdateImage(formData);

      if (result && "success" in result && result.success) {
        toast.success("Image updated successfully!");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Cover Image</CardTitle>
        <CardDescription>
          This is the cover image for your site. It will be displayed on your site's homepage and in previews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {imageUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-[200px] w-full max-w-[400px]">
              <Image
                src={imageUrl}
                alt="Uploaded Image"
                className="rounded-lg object-cover"
                fill
                sizes="(max-width: 400px) 100vw, 400px"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setImageUrl(null)} className="mt-2">
              Change Image
            </Button>
          </div>
        ) : uploadError ? (
          <div className="mx-auto flex w-full max-w-[400px] flex-col items-center justify-center space-y-4 rounded-md border-2 border-dashed border-destructive/30 bg-destructive/5 p-6">
            <SimpleIcon name="x" size={32} className="text-destructive" />
            <div className="text-center">
              <h3 className="mb-1 font-semibold">Upload Error</h3>
              <p className="mb-2 text-sm text-muted-foreground">{uploadError}</p>
              <p className="text-xs text-muted-foreground">
                This could be due to network issues or UploadThing service problems.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center gap-1">
                <SimpleIcon name="arrowright" size={12} className="rotate-180" /> Try Again
              </Button>
            </div>
          </div>
        ) : isUploading ? (
          <div className="mx-auto flex h-[200px] w-full max-w-[400px] flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground p-8">
            <div className="flex flex-col items-center gap-2">
              <SimpleIcon name="loader" size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <UploadDropzone
              endpoint="imageUploader"
              onUploadBegin={() => {
                setIsUploading(true);
                setUploadError(null);
              }}
              onClientUploadComplete={(res: unknown) => {
                setIsUploading(false);
                if (res && res[0] && res[0].ufsUrl) {
                  console.log("Upload response:", res[0]);
                  const url = res[0].ufsUrl;
                  setImageUrl(url);
                  toast.success("Image uploaded successfully!");
                } else {
                  console.error("Invalid upload response:", res);
                  setUploadError("Received invalid response from upload service");
                }
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                console.error("Upload error:", error);
                setUploadError(`Upload failed: ${error.message || "FetchError - Network issue detected"}`);
              }}
              {...optimizedConfig}
              appearance={{
                ...optimizedConfig.appearance,
                container:
                  "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] h-[200px] flex flex-col items-center justify-center",
              }}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <form ref={formRef} action={handleFormAction}>
          <input type="hidden" name="siteId" value={siteId} />
          {imageUrl && (
            <Button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting || !imageUrl}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SimpleIcon name="loader" size={16} className="animate-spin" />
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
