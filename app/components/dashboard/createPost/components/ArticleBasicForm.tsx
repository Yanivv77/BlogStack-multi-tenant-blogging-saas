import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";
import { Atom, Info } from "lucide-react";
import slugify from "react-slugify";
import { toast } from "sonner";

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
}

interface ArticleBasicFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  isValid: boolean;
}

export function ArticleBasicForm({
  formData,
  setFormData,
  imageUrl,
  setImageUrl,
  isValid
}: ArticleBasicFormProps) {
  const { title, slug, smallDescription } = formData;
  
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  function handleSlugGeneration() {
    if (!title || title.length === 0) {
      return toast.error("Please create a title first");
    }

    const generatedSlug = slugify(title);
    updateFormData("slug", generatedSlug);
    return toast.success("Slug has been created");
  }
  
  return (
    <div className="flex flex-col gap-6">
      <ImageUploader 
        imageUrl={imageUrl} 
        setImageUrl={setImageUrl} 
        errors={undefined}
      />

      <div className="grid gap-2">
        <Label htmlFor="keywords">Keywords</Label>
        <Input
          id="keywords"
          name="keywords"
          placeholder="Enter keywords separated by commas (e.g., react, nextjs, web development)"
          onChange={(e) => updateFormData("keywords", e.target.value)}
          value={formData.keywords || ""}
          aria-describedby="keywords-hint keywords-count"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span id="keywords-hint">Add 3-5 relevant keywords to improve SEO (separated by commas)</span>
          <span 
            id="keywords-count"
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Article Title"
          onChange={(e) => updateFormData("title", e.target.value)}
          value={title}
          maxLength={60}
          aria-describedby="title-hint title-error title-keywords"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span id="title-hint">Optimum length for SEO (55-60 characters)</span>
          <span className={`${
            title.length < 3 ? 'text-destructive' : 
            title.length >= 55 && title.length <= 60 ? 'text-green-500' : 
            'text-amber-500'
          }`} aria-live="polite">
            {title.length}/60
          </span>
        </div>
        {formData.keywords && formData.keywords.length > 0 && (
          <div id="title-keywords" className="text-xs">
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
        {title.length > 0 && title.length < 3 && (
          <p id="title-error" className="text-red-500 text-sm">Title must be at least 3 characters</p>
        )}
        {title.length > 60 && (
          <p id="title-error" className="text-red-500 text-sm">Title must be at most 60 characters</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
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
        {slug.length > 0 && slug.length < 3 && (
          <p className="text-red-500 text-sm">Slug must be at least 3 characters</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="smallDescription">Meta Description</Label>
        <Textarea
          id="smallDescription"
          name="smallDescription"
          placeholder="Meta description for search engine results..."
          onChange={(e) => updateFormData("smallDescription", e.target.value)}
          value={smallDescription}
          className="h-32"
          maxLength={160}
          aria-describedby="description-hint description-error description-keywords"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span id="description-hint">Optimum length for SEO (120-160 characters)</span>
          <span className={`${
            smallDescription.length < 10 || smallDescription.length > 160 ? 'text-destructive' : 
            (smallDescription.length >= 120 && smallDescription.length <= 160) ? 'text-green-500' : 
            'text-amber-500'
          }`} aria-live="polite">
            {smallDescription.length}/160
          </span>
        </div>
        {formData.keywords && formData.keywords.length > 0 && (
          <div id="description-keywords" className="text-xs">
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
        {smallDescription.length > 0 && smallDescription.length < 10 && (
          <p id="description-error" className="text-red-500 text-sm">Meta description must be at least 10 characters</p>
        )}
        {smallDescription.length > 160 && (
          <p id="description-error" className="text-red-500 text-sm">Meta description must be at most 160 characters</p>
        )}
      </div>
      
      {!isValid && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
          <div className="flex gap-3">
            <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Required Fields</p>
              <p className="text-blue-700 dark:text-blue-400">
                Please complete all required fields before proceeding to the next step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 