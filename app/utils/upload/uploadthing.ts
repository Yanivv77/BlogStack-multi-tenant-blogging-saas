import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";
import { OurFileRouter } from "../../api/uploadthing/core";

/**
 * Basic upload components from uploadthing
 */
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

/**
 * Direct uploader for programmatic uploads
 */
export const uploader = generateUploader<OurFileRouter>();

/**
 * Returns optimized configuration for upload dropzones
 * @returns Configuration object for UploadDropzone
 */
export const getOptimizedDropzoneConfig = () => ({
  config: { mode: "auto" as const },
  appearance: {
    container: "border-dashed border-2 border-muted-foreground rounded-md p-8 flex flex-col items-center justify-center",
    uploadIcon: { color: "currentColor" },
    allowedContent: "text-xs text-muted-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
  }
}); 