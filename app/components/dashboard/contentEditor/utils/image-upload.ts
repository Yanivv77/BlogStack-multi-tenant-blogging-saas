/**
 * Image upload utility for the content editor
 * Handles file uploads and file conversions for the editor
 */

// Track uploaded images for the session
let uploadedImages: string[] = [];

/**
 * Upload function for handling image uploads in the editor
 * Converts image files to data URLs
 */
export const uploadFn = async (file: File): Promise<string> => {
  // For security, only allow image file types
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Add the uploaded image to the tracking array
      uploadedImages.push(result);
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Get all uploaded images for the current session
 */
export const getUploadedImages = (): string[] => {
  return [...uploadedImages];
};

/**
 * Add existing images to the tracking array
 * Useful when loading existing content
 */
export const addExistingImages = (images: string[]): void => {
  if (images && Array.isArray(images)) {
    uploadedImages = [...uploadedImages, ...images];
  }
};

/**
 * Clear the uploaded images array
 * Useful when submitting a form or changing context
 */
export const clearUploadedImages = (): void => {
  uploadedImages = [];
}; 