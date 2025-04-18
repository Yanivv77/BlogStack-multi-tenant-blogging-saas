import type { JSONContent } from "novel";

import { Label } from "@/components/ui/label";

import { EditorWrapper, getUploadedImages } from "@/app/components/dashboard/contentEditor";
import { SeoRecommendations } from "@/app/components/dashboard/contentEditor/ui/SeoRecommendations";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
}

interface FormError {
  error?: {
    articleContent?: string;
  };
  success?: boolean;
  postId?: string;
  status?: "success" | "error";
  errors?: string[];
}

interface ArticleContentFormProps {
  siteId: string;
  formData: FormData;
  editorValue: JSONContent | undefined;
  setEditorValue: (value: JSONContent | undefined) => void;
  onSubmit: (formData: FormData, content: JSONContent | undefined, imageUrl: string | null) => void;
  isSubmitting: boolean;
  lastResult: FormError | undefined;
}

export function ArticleContentForm({ formData, editorValue, setEditorValue, lastResult }: ArticleContentFormProps) {
  const { title, smallDescription } = formData;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label>Article Content</Label>
        <input type="hidden" name="articleContent" value={editorValue ? JSON.stringify(editorValue) : "{}"} />
        <input type="hidden" name="contentImages" value={JSON.stringify(getUploadedImages())} />
        <EditorWrapper onChange={(newValue) => setEditorValue(newValue)} initialValue={editorValue} />
        {lastResult?.error?.articleContent && <p className="text-sm text-red-500">{lastResult.error.articleContent}</p>}
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-medium">SEO Recommendations</h3>
        <SeoRecommendations
          content={editorValue}
          title={title}
          smallDescription={smallDescription}
          keywords={formData.keywords}
        />
      </div>
    </div>
  );
}
