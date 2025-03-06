import { createImageUpload } from "novel";
import { toast } from "sonner";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

// Store uploaded image URLs for later use
let uploadedImages: string[] = [];

// Function to get all uploaded images
export const getUploadedImages = () => {
  return [...uploadedImages];
};

// Function to clear the uploaded images array
export const clearUploadedImages = () => {
  uploadedImages = [];
};

// Function to add existing images to the tracking array
export const addExistingImages = (urls: string[]) => {
  if (Array.isArray(urls)) {
    urls.forEach(url => {
      if (url && !uploadedImages.includes(url)) {
        uploadedImages.push(url);
      }
    });
  }
};

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
        const url = res[0].ufsUrl;
        
        // Add to our tracked images
        uploadedImages.push(url);
        
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