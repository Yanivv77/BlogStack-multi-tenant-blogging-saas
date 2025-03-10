import { useState, useEffect } from "react";
import { JSONContent } from "novel";
import { toast } from "sonner";
import { 
  saveFormDraft, 
  loadFormDraft, 
  clearFormDraft, 
  clearEditorStorage, 
  clearUploadedImages 
} from "@/app/components/dashboard/contentEditor";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
}

interface UseArticleDraftProps {
  siteId: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  value: JSONContent | undefined;
  setValue: (value: JSONContent | undefined) => void;
  isNewArticle: boolean;
}

export function useArticleDraft({
  siteId,
  formData,
  setFormData,
  imageUrl,
  setImageUrl,
  value,
  setValue,
  isNewArticle
}: UseArticleDraftProps) {
  const [draftLoaded, setDraftLoaded] = useState(false);
  
  // Load draft when component initializes
  const loadDraft = () => {
    const draft = loadFormDraft();
    if (draft && draft.siteId === siteId) {
      if (draft.title) setFormData({
        ...formData,
        title: draft.title,
        slug: draft.slug || "",
        smallDescription: draft.smallDescription || "",
      });
      
      if (draft.coverImage) setImageUrl(draft.coverImage);
      
      if (draft.articleContent) {
        try {
          if (typeof draft.articleContent === 'string') {
            setValue(JSON.parse(draft.articleContent));
          } else {
            setValue(draft.articleContent);
          }
        } catch (e) {
          console.error("Error parsing editor content from draft:", e);
        }
      }
      
      setDraftLoaded(true);
      return true;
    }
    
    setDraftLoaded(true);
    return false;
  };
  
  // Save draft with current form state
  const saveDraft = () => {
    if (!formData.title && !formData.smallDescription && !imageUrl && !value) {
      return false;
    }
    
    const draft = {
      title: formData.title,
      slug: formData.slug,
      smallDescription: formData.smallDescription,
      coverImage: imageUrl,
      siteId,
      articleContent: value,
      lastUpdated: Date.now()
    };
    
    saveFormDraft(draft);
    return true;
  };
  
  // Autosave draft when form values change
  useEffect(() => {
    if (draftLoaded && !isNewArticle) {
      saveDraft();
    }
  }, [formData, imageUrl, value, draftLoaded, isNewArticle]);
  
  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isNewArticle) {
        saveDraft();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, imageUrl, value, isNewArticle]);
  
  // Clear all drafts and storage
  const clearAllDrafts = () => {
    clearFormDraft();
    clearEditorStorage();
    clearUploadedImages();
  };
  
  // Save draft explicitly (triggered by button)
  const handleSaveDraft = () => {
    if (saveDraft()) {
      toast.success("Draft saved successfully");
    } else {
      toast.info("Nothing to save - add some content first");
    }
  };
  
  return {
    draftLoaded,
    saveDraft,
    loadDraft,
    clearAllDrafts,
    handleSaveDraft
  };
} 