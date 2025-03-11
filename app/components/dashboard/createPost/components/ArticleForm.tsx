import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { JSONContent } from "novel";
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
import { SlugInput } from "./SlugInput";
import { formatAsSlug } from "@/app/utils/validation/postUtils";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
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

    // Format the title into a proper slug
    const formattedSlug = formatAsSlug(title);
    
    if (!formattedSlug) {
      return toast.error("Could not generate a valid slug from title");
    }
    
    updateFormData("slug", formattedSlug);
    return toast.success("Slug has been created");
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate required fields before submitting
    if (!title || title.length < 3) {
      toast.error("Please enter a valid title (at least 3 characters)");
      return;
    }
    
    if (!slug || slug.length < 3) {
      toast.error("Please enter a valid slug (at least 3 characters)");
      return;
    }
    
    if (!smallDescription || smallDescription.length < 10) {
      toast.error("Please enter a valid meta description (at least 10 characters)");
      return;
    }
    
    if (!editorValue) {
      toast.error("Please add some content to your article");
      return;
    }
    
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
            <Label htmlFor={`keywords-${fields.title.id}`}>Keywords</Label>
            <Input
              id={`keywords-${fields.title.id}`}
              placeholder="Enter keywords separated by commas (e.g., react, nextjs, web development)"
              onChange={(e) => updateFormData("keywords", e.target.value)}
              value={formData.keywords || ""}
              aria-describedby="article-keywords-hint article-keywords-count"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="article-keywords-hint">Add 3-5 relevant keywords to improve SEO (separated by commas)</span>
              <span 
                id="article-keywords-count"
                className={`${
                  !formData.keywords ? 'text-muted-foreground' : 
                  formData.keywords.split(',').filter(k => k.trim()).length >= 3 && 
                  formData.keywords.split(',').filter(k => k.trim()).length <= 5 ? 'text-green-500' : 
                  'text-amber-500'
                }`}
                aria-live="polite"
              >
                {formData.keywords ? formData.keywords.split(',').filter(k => k.trim()).length : 0} keywords
              </span>
            </div>
            {formData.keywords && formData.keywords.split(',').filter(k => k.trim()).length > 5 && (
              <p className="text-amber-500 text-sm">For best SEO results, use 3-5 keywords</p>
            )}
            {formData.keywords && formData.keywords.split(',').filter(k => k.trim()).length < 3 && formData.keywords.length > 0 && (
              <p className="text-amber-500 text-sm">For best SEO results, add at least 3 keywords</p>
            )}
          </div>

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
              aria-describedby="article-title-hint article-title-error article-title-keywords"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="article-title-hint">Optimum length for SEO (55-60 characters)</span>
              <span 
                className={`${
                  title.length < 3 ? 'text-destructive' : 
                  title.length >= 55 && title.length <= 60 ? 'text-green-500' : 
                  'text-amber-500'
                }`} 
                aria-live="polite"
              >
                {title.length}/60
              </span>
            </div>
            {formData.keywords && formData.keywords.length > 0 && (
              <div id="article-title-keywords" className="text-xs">
                {(() => {
                  const keywordsList = formData.keywords.split(',').filter(k => k.trim());
                  const keywordsInTitle = keywordsList.filter(keyword => 
                    title.toLowerCase().includes(keyword.toLowerCase().trim())
                  );
                  
                  if (keywordsInTitle.length > 0) {
                    return (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Title contains {keywordsInTitle.length} of your {keywordsList.length} keywords
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-amber-600 dark:text-amber-400">
                        Consider including at least one keyword in your title
                      </span>
                    );
                  }
                })()}
              </div>
            )}
            {fields.title.errors && (
              <p id="article-title-error" className="text-red-500 text-sm">{fields.title.errors}</p>
            )}
          </div>

          <div className="grid gap-2">
            <SlugInput
              siteId={siteId}
              value={slug}
              onChange={(value) => updateFormData("slug", value)}
              autoGenerateFromTitle={true}
              title={title}
              error={fields.slug.errors ? fields.slug.errors.join(', ') : undefined}
            />
            <input
              type="hidden"
              name={fields.slug.name}
              value={slug}
            />
            <Button
              onClick={handleSlugGeneration}
              className="w-fit"
              variant="secondary"
              type="button"
              disabled={!title || title.length < 3}
              aria-label="Generate slug from title"
            >
              <Atom className="size-4 mr-2" aria-hidden="true" /> Generate Slug
            </Button>
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
              aria-describedby="article-description-hint article-description-error article-description-keywords"
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
            {formData.keywords && formData.keywords.length > 0 && (
              <div id="article-description-keywords" className="text-xs">
                {(() => {
                  const keywordsList = formData.keywords.split(',').filter(k => k.trim());
                  const keywordsInDesc = keywordsList.filter(keyword => 
                    smallDescription.toLowerCase().includes(keyword.toLowerCase().trim())
                  );
                  
                  if (keywordsInDesc.length > 0) {
                    return (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Meta description contains {keywordsInDesc.length} of your {keywordsList.length} keywords
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-amber-600 dark:text-amber-400">
                        Include at least one keyword in your meta description
                      </span>
                    );
                  }
                })()}
              </div>
            )}
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
              keywords={formData.keywords}
            />
          </div>

          <SubmitButton text="Create Article"  />
        </form>
      </CardContent>
    </Card>
  );
} 