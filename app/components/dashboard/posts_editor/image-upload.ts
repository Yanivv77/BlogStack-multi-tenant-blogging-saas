import { createImageUpload } from "novel";
import { toast } from "sonner";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

const onUpload = async (file: File) => {
  return new Promise((resolve, reject) => {
    toast.loading("Uploading image...");
    
    // Use the uploadFiles helper from UploadThing
    uploadFiles("imageUploader", { files: [file] })
      .then((res) => {
        if (!res || res.length === 0) {
          throw new Error("Upload failed");
        }
        
        // Extract the URL from the response
        const url = res[0].url;
        
        // Preload the image
        const image = new Image();
        image.src = url;
        image.onload = () => {
          toast.dismiss();
          toast.success("Image uploaded successfully");
          resolve(url);
        };
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message || "Error uploading image");
        reject(error);
      });
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 4) {
      toast.error("File size too big (max 4MB).");
      return false;
    }
    return true;
  },
});