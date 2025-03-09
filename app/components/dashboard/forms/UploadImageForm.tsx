"use client";

import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/UploadthingComponents";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { SubmitButton } from "../SubmitButtons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UpdateImage } from "@/app/serverActions/image/updateImage";

interface iAppProps {
  siteId: string;
}

export function UploadImageForm({ siteId }: iAppProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

  // Function to handle form submission
  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image</CardTitle>
        <CardDescription>
          This is the image of your site. It will be updated automatically after upload.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {imageUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-[200px] h-[200px]">
              <Image
                src={imageUrl}
                alt="Uploaded Image"
                className="object-cover rounded-lg"
                fill
                sizes="200px"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setImageUrl(null)}
              className="mt-2"
            >
              Change Image
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            {isUploading ? (
              <div className="border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] flex flex-col items-center justify-center h-[200px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </div>
              </div>
            ) : (
              <UploadDropzone
                endpoint="imageUploader"
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                onClientUploadComplete={(res: any) => {
                  setIsUploading(false);
                  console.log("Upload response:", res[0]);
                  const imageUrl = res[0].ufsUrl;
                  setImageUrl(imageUrl);
                  toast.success("Image uploaded successfully!");
                  
                  // Automatically submit the form after upload
                  setTimeout(submitForm, 500);
                }}
                onUploadError={(error: Error) => {
                  setIsUploading(false);
                  toast.error(`Upload failed: ${error.message}`);
                }}
                {...optimizedConfig}
                appearance={{
                  ...optimizedConfig.appearance,
                  container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] h-[200px] flex flex-col items-center justify-center"
                }}
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <form 
          ref={formRef} 
          action={async (formData) => {
            try {
              await UpdateImage(formData);
              toast.success("Image updated successfully!");
            } catch (error) {
              toast.error("Failed to update image");
              console.error(error);
            }
          }}
        >
          <input type="hidden" name="siteId" value={siteId} />
          {imageUrl && (
            <input type="hidden" name="siteImageCover" value={imageUrl} />
          )}
          <SubmitButton text="Save Changes" />
        </form>
      </CardFooter>
    </Card>
  );
}