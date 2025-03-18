import { useCallback, useEffect, useState } from "react";

import type { JSONContent } from "novel";
import { toast } from "sonner";

import {
  clearEditorStorage,
  clearFormDraft,
  clearUploadedImages,
  type FormDraft,
  loadFormDraft,
  saveFormDraft,
} from "@/app/components/dashboard/contentEditor";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
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
  isNewArticle,
}: UseArticleDraftProps) {
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft when component initializes
  const loadDraft = () => {
    const draft = loadFormDraft();
    if (draft && draft.siteId === siteId) {
      if (draft.title) {
        const updatedFormData = {
          ...formData,
          title: draft.title,
          slug: draft.slug || "",
          smallDescription: draft.smallDescription || "",
        };

        // Add keywords if available in the draft
        if (draft.keywords) {
          updatedFormData.keywords = draft.keywords;
        }

        setFormData(updatedFormData);
      }

      if (draft.coverImage) setImageUrl(draft.coverImage);

      if (draft.articleContent) {
        try {
          if (typeof draft.articleContent === "string") {
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
  const saveDraft = useCallback(() => {
    if (!formData.title && !formData.smallDescription && !imageUrl && !value) {
      return false;
    }

    const draft: FormDraft = {
      title: formData.title,
      slug: formData.slug,
      smallDescription: formData.smallDescription,
      coverImage: imageUrl,
      siteId,
      articleContent: value,
      lastUpdated: Date.now(),
    };

    // Add keywords if available
    if (formData.keywords) {
      draft.keywords = formData.keywords;
    }

    saveFormDraft(draft);
    return true;
  }, [formData, imageUrl, value, siteId]);

  // Autosave draft when form values change
  useEffect(() => {
    if (draftLoaded && !isNewArticle) {
      saveDraft();
    }
  }, [formData, imageUrl, value, draftLoaded, isNewArticle, saveDraft]);

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isNewArticle) {
        saveDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData, imageUrl, value, isNewArticle, saveDraft]);

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
    handleSaveDraft,
  };
}
