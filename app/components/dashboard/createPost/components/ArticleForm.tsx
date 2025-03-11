import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { JSONContent } from "novel";
import slugify from "react-slugify";
import { toast } from "sonner";
import { Atom } from "lucide-react";

import { PostSchema } from "@/app/utils/validation/postSchema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { 
  EditorWrapper, 
  getUploadedImages 
} from "@/app/components/dashboard/contentEditor";
import { SeoRecommendations } from "@/app/components/dashboard/contentEditor/ui/SeoRecommendations";
import { ImageUploader } from "./ImageUploader";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
}

interface ArticleFormProps {
  siteId: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  editorValue: JSONContent | undefined;
  setEditorValue: (value: JSONContent | undefined) => void;
  onSubmit: (formData: FormData, content: JSONContent | undefined, imageUrl: string | null) => void;
  isSubmitting: boolean;
  lastResult: any;
}

export function ArticleForm({
  siteId,
  formData,
  setFormData,
  imageUrl,
  setImageUrl,
  editorValue,
  setEditorValue,
  onSubmit,
  isSubmitting,
  lastResult
}: ArticleFormProps) {
  const { title, slug, smallDescription } = formData;
  
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { 
        schema: PostSchema 
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  function handleSlugGeneration() {
    if (!title || title.length === 0) {
      return toast.error("Please create a title first");
    }

    const generatedSlug = slugify(title);
    updateFormData("slug", generatedSlug);
    return toast.success("Slug has been created");
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData, editorValue, imageUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Details</CardTitle>
        <CardDescription>
          Fill in the details to create your new article
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          id={form.id}
          onSubmit={handleFormSubmit}
        >
          <input type="hidden" name="siteId" value={siteId} />
          {imageUrl && (
            <input
              type="hidden"
              name={fields.postCoverImage.name}
              key={fields.postCoverImage.key}
              value={imageUrl}
            />
          )}
          
          <ImageUploader 
            imageUrl={imageUrl} 
            setImageUrl={setImageUrl} 
            errors={fields.postCoverImage.errors?.join(', ')}
          />

          <div className="grid gap-2">
            <Label htmlFor={fields.title.id}>Title</Label>
            <Input
              id={fields.title.id}
              key={fields.title.key}
              name={fields.title.name}
              placeholder="Article Title"
              onChange={(e) => updateFormData("title", e.target.value)}
              value={title}
              maxLength={60}
              aria-describedby="article-title-hint article-title-error"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="article-title-hint">Optimum length for SEO (3-60 characters)</span>
              <span 
                className={`${title.length < 3 || title.length > 60 ? 'text-destructive' : title.length > 50 ? 'text-amber-500' : 'text-green-500'}`} 
                aria-live="polite"
              >
                {title.length}/60
              </span>
            </div>
            {fields.title.errors && (
              <p id="article-title-error" className="text-red-500 text-sm">{fields.title.errors}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={fields.slug.id}>Slug</Label>
            <Input
              id={fields.slug.id}
              key={fields.slug.key}
              name={fields.slug.name}
              placeholder="Article Slug"
              onChange={(e) => updateFormData("slug", e.target.value)}
              value={slug}
            />
            <Button
              onClick={handleSlugGeneration}
              className="w-fit"
              variant="secondary"
              type="button"
            >
              <Atom className="size-4 mr-2" /> Generate Slug
            </Button>
            <p className="text-red-500 text-sm">{fields.slug.errors}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={fields.smallDescription.id}>Meta Description</Label>
            <Textarea
              id={fields.smallDescription.id}
              key={fields.smallDescription.key}
              name={fields.smallDescription.name}
              placeholder="Meta description for search engine results..."
              onChange={(e) => updateFormData("smallDescription", e.target.value)}
              value={smallDescription}
              className="h-32"
              maxLength={160}
              aria-describedby="article-description-hint article-description-error"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="article-description-hint">Optimum length for SEO (120-160 characters)</span>
              <span 
                className={`${smallDescription.length < 10 || smallDescription.length > 160 ? 'text-destructive' : (smallDescription.length >= 120 && smallDescription.length <= 160) ? 'text-green-500' : 'text-amber-500'}`} 
                aria-live="polite"
              >
                {smallDescription.length}/160
              </span>
            </div>
            {fields.smallDescription.errors && (
              <p id="article-description-error" className="text-red-500 text-sm">
                {fields.smallDescription.errors}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Article Content</Label>
            <input
              type="hidden"
              name={fields.articleContent.name}
              key={fields.articleContent.key}
              value={editorValue ? JSON.stringify(editorValue) : '{}'}
            />
            <input
              type="hidden"
              name={fields.contentImages.name}
              key={fields.contentImages.key}
              value={JSON.stringify(getUploadedImages())}
            />
            <EditorWrapper 
              onChange={(newValue) => setEditorValue(newValue)} 
              initialValue={editorValue}
            />
            <p className="text-red-500 text-sm">
              {fields.articleContent.errors}
            </p>
            
            <SeoRecommendations 
              content={editorValue} 
              title={title} 
              smallDescription={smallDescription} 
            />
          </div>

          <SubmitButton text="Create Article"  />
        </form>
      </CardContent>
    </Card>
  );
} 