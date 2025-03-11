import { Label } from "@/components/ui/label";
import { JSONContent } from "novel";
import { EditorWrapper, getUploadedImages } from "@/app/components/dashboard/contentEditor";
import { SeoRecommendations } from "@/app/components/dashboard/contentEditor/ui/SeoRecommendations";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
}

interface ArticleContentFormProps {
  siteId: string;
  formData: FormData;
  editorValue: JSONContent | undefined;
  setEditorValue: (value: JSONContent | undefined) => void;
  onSubmit: (formData: FormData, content: JSONContent | undefined, imageUrl: string | null) => void;
  isSubmitting: boolean;
  lastResult: any;
}

export function ArticleContentForm({
  siteId,
  formData,
  editorValue,
  setEditorValue,
  lastResult
}: ArticleContentFormProps) {
  const { title, smallDescription } = formData;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label>Article Content</Label>
        <input
          type="hidden"
          name="articleContent"
          value={editorValue ? JSON.stringify(editorValue) : '{}'}
        />
        <input
          type="hidden"
          name="contentImages"
          value={JSON.stringify(getUploadedImages())}
        />
        <EditorWrapper 
          onChange={(newValue) => setEditorValue(newValue)} 
          initialValue={editorValue}
        />
        {lastResult?.error?.articleContent && (
          <p className="text-red-500 text-sm">
            {lastResult.error.articleContent}
          </p>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">SEO Recommendations</h3>
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