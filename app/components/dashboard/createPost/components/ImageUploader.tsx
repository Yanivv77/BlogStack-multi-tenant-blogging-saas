import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/upload/uploadthing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  errors?: string;
}

export function ImageUploader({ imageUrl, setImageUrl, errors }: ImageUploaderProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const optimizedConfig = getOptimizedDropzoneConfig();

  return (
    <div className="grid gap-2">
      <Label>Cover Image (Optional)</Label>
      {imageUrl ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-[200px] h-[200px]">
            <Image
              src={imageUrl}
              alt="Article Cover"
              className="object-cover rounded-lg"
              fill
              sizes="200px"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setImageUrl(null)}
            className="w-auto"
          >
            Remove Image
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          {isUploadingImage ? (
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
                setIsUploadingImage(true);
              }}
              onClientUploadComplete={(res: any) => {
                setIsUploadingImage(false);
                const imageUrl = res[0].ufsUrl;
                setImageUrl(imageUrl);
                toast.success("Image uploaded successfully!");
              }}
              onUploadError={(error: Error) => {
                setIsUploadingImage(false);
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
      {errors && <p className="text-red-500 text-sm">{errors}</p>}
    </div>
  );
} 