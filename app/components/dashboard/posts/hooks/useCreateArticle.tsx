import { startTransition, useActionState, useEffect, useState } from "react";

import type { JSONContent } from "novel";
import { toast } from "sonner";

import { getUploadedImages } from "@/app/components/dashboard/contentEditor";
import { CreatePostAction } from "@/app/serverActions/post/createPost";

// Define the possible action result types
type ActionResult =
  | { success: true; postId: string }
  | { status: "success" }
  | { status: "error"; errors: string[] }
  | { error: { _form: string[] } | { errors: string[] } };

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
}

interface UseCreateArticleProps {
  siteId: string;
  onSuccess: () => void;
}

export function useCreateArticle({ siteId, onSuccess }: UseCreateArticleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, dispatch] = useActionState(CreatePostAction, undefined);

  // Handle submission to server action
  const handleSubmit = (formData: FormData, content: JSONContent | undefined, imageUrl: string | null) => {
    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("siteId", siteId);
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("slug", formData.slug);
      formDataToSubmit.append("smallDescription", formData.smallDescription);

      // Add keywords if available
      if (formData.keywords) {
        formDataToSubmit.append("keywords", formData.keywords);
      }

      if (imageUrl) {
        formDataToSubmit.append("postCoverImage", imageUrl);
      }

      if (content) {
        formDataToSubmit.append("articleContent", JSON.stringify(content));
      }

      const contentImages = getUploadedImages();
      if (contentImages.length > 0) {
        formDataToSubmit.append("contentImages", JSON.stringify(contentImages));
      }

      // Use startTransition to properly dispatch the server action
      startTransition(() => {
        dispatch(formDataToSubmit);
      });
    } catch (error) {
      toast.error(`Submission failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsSubmitting(false);
    }
  };

  // Handle result changes
  useEffect(() => {
    if (!lastResult) return;

    const result = lastResult as ActionResult;
    if ("success" in result || ("status" in result && result.status === "success")) {
      // Don't show a toast here, let the onSuccess callback handle it
      onSuccess();
      setIsSubmitting(false);
    } else if (lastResult) {
      let errors: string[] = [];
      if ("error" in result && result.error) {
        if ("_form" in result.error) {
          errors = result.error._form;
        }
      } else if ("errors" in result) {
        errors = result.errors;
      }

      (Array.isArray(errors) ? errors : [errors]).forEach((error: string) => toast.error(error));
      setIsSubmitting(false);
    }
  }, [lastResult, onSuccess]);

  return {
    handleSubmit,
    isSubmitting,
    lastResult,
  };
}
