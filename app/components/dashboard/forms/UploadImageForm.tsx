"use client";

import { UploadDropzone } from "@/app/utils/UploadthingComponents";
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
import { UpdateImage } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface iAppProps {
  siteId: string;
}

export function UploadImageForm({ siteId }: iAppProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
          </div>
        ) : (
          <div className="flex justify-center">
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res: any) => {
                console.log("Upload response:", res[0]);
                const imageUrl = res[0].ufsUrl;
                setImageUrl(imageUrl);
                toast.success("Image uploaded successfully!");
                
                // Automatically submit the form after upload
                setTimeout(submitForm, 500);
              }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
              config={{ mode: "auto" }}
              appearance={{
                button: "hidden",
                allowedContent: "hidden",
                container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px]"
              }}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <form ref={formRef} action={UpdateImage}>
          <input type="hidden" name="siteId" value={siteId} />
          {imageUrl && (
            <input type="hidden" name="siteImageCover" value={imageUrl} />
          )}
          
        </form>
      </CardFooter>
    </Card>
  );
}