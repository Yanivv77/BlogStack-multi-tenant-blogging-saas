import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { checkSlugAvailability, formatAsSlug } from "@/app/utils/validation/postUtils";

import { ImageUploader } from "./ImageUploader";
import { SlugInput } from "./SlugInput";

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
  siteId: string;
  onSlugAvailabilityChange?: (isAvailable: boolean) => void;
}

export function ArticleBasicForm({
  formData,
  setFormData,
  imageUrl,
  setImageUrl,
  isValid,
  siteId,
  onSlugAvailabilityChange,
}: ArticleBasicFormProps) {
  const { title, slug, smallDescription } = formData;
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const slugInputRef = useRef<{ checkSlug: (slug: string) => Promise<void> } | null>(null);

  const updateFormData = (field: keyof FormData, value: string) => {
    if (field === "slug") {
      // Reset slug availability when slug changes
      setSlugAvailable(false);
    }
    setFormData({ ...formData, [field]: value });
  };

  async function handleSlugGeneration() {
    if (!title || title.length === 0) {
      return toast.error("Please create a title first");
    }

    // Format the title into a proper slug
    const formattedSlug = formatAsSlug(title);

    if (!formattedSlug) {
      return toast.error("Could not generate a valid slug from title");
    }

    // Update the slug in the form data
    updateFormData("slug", formattedSlug);

    // Check if the slug is available
    setIsCheckingSlug(true);
    try {
      const isAvailable = await checkSlugAvailability(formattedSlug, siteId);

      if (isAvailable) {
        setSlugAvailable(true);
        // Manually trigger the slug check in the SlugInput component
        if (slugInputRef.current) {
          await slugInputRef.current.checkSlug(formattedSlug);
        }
      } else {
        // If not available, try adding a random number
        const randomSuffix = Math.floor(Math.random() * 1000);
        const alternativeSlug = `${formattedSlug}-${randomSuffix}`;

        const isAlternativeAvailable = await checkSlugAvailability(alternativeSlug, siteId);

        if (isAlternativeAvailable) {
          updateFormData("slug", alternativeSlug);
          setSlugAvailable(true);
          // Manually trigger the slug check for the alternative slug
          if (slugInputRef.current) {
            await slugInputRef.current.checkSlug(alternativeSlug);
          }
          toast.success("Generated an alternative available slug");
        } else {
          toast.error("Could not generate an available slug. Please try a different title or create a custom slug.");
        }
      }
    } catch (error) {
      toast.error("Error checking slug availability");
      console.error("Error checking slug availability:", error);
    } finally {
      setIsCheckingSlug(false);
    }
  }

  useEffect(() => {
    if (onSlugAvailabilityChange) {
      onSlugAvailabilityChange(slugAvailable);
    }
  }, [slugAvailable, onSlugAvailabilityChange]);

  return (
    <div className="flex flex-col gap-6">
      <ImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} errors={undefined} />

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
              !formData.keywords
                ? "text-muted-foreground"
                : formData.keywords.split(",").filter((k) => k.trim()).length >= 3 &&
                    formData.keywords.split(",").filter((k) => k.trim()).length <= 5
                  ? "text-green-500"
                  : "text-amber-500"
            }`}
            aria-live="polite"
          >
            {formData.keywords ? formData.keywords.split(",").filter((k) => k.trim()).length : 0} keywords
          </span>
        </div>
        {formData.keywords && formData.keywords.split(",").filter((k) => k.trim()).length > 5 && (
          <p className="text-sm text-amber-500">For best SEO results, use 3-5 keywords</p>
        )}
        {formData.keywords &&
          formData.keywords.split(",").filter((k) => k.trim()).length < 3 &&
          formData.keywords.length > 0 && (
            <p className="text-sm text-amber-500">For best SEO results, add at least 3 keywords</p>
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
          <span
            className={`${
              title.length < 3
                ? "text-destructive"
                : title.length >= 55 && title.length <= 60
                  ? "text-green-500"
                  : "text-amber-500"
            }`}
            aria-live="polite"
          >
            {title.length}/60
          </span>
        </div>
        {formData.keywords && formData.keywords.length > 0 && (
          <div id="title-keywords" className="text-xs">
            {(() => {
              const keywordsList = formData.keywords.split(",").filter((k) => k.trim());
              const keywordsInTitle = keywordsList.filter((keyword) =>
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
          <p id="title-error" className="text-sm text-red-500">
            Title must be at least 3 characters
          </p>
        )}
        {title.length > 60 && (
          <p id="title-error" className="text-sm text-red-500">
            Title must be at most 60 characters
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <SlugInput
          ref={slugInputRef}
          siteId={siteId}
          value={slug}
          onChange={(value) => updateFormData("slug", value)}
          autoGenerateFromTitle={true}
          title={title}
          onAvailabilityChange={setSlugAvailable}
        />
        <Button
          onClick={handleSlugGeneration}
          className="w-fit"
          variant="secondary"
          type="button"
          disabled={!title || title.length < 3 || isCheckingSlug}
          aria-label="Generate slug from title"
        >
          {isCheckingSlug ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Checking...
            </>
          ) : (
            <>
              <SimpleIcon name="atom" className="mr-2" size={16} /> Generate Slug
            </>
          )}
        </Button>
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
          <span
            className={`${
              smallDescription.length < 10 || smallDescription.length > 160
                ? "text-destructive"
                : smallDescription.length >= 120 && smallDescription.length <= 160
                  ? "text-green-500"
                  : "text-amber-500"
            }`}
            aria-live="polite"
          >
            {smallDescription.length}/160
          </span>
        </div>
        {formData.keywords && formData.keywords.length > 0 && (
          <div id="description-keywords" className="text-xs">
            {(() => {
              const keywordsList = formData.keywords.split(",").filter((k) => k.trim());
              const keywordsInDesc = keywordsList.filter((keyword) =>
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
          <p id="description-error" className="text-sm text-red-500">
            Meta description must be at least 10 characters
          </p>
        )}
        {smallDescription.length > 160 && (
          <p id="description-error" className="text-sm text-red-500">
            Meta description must be at most 160 characters
          </p>
        )}
      </div>

      {!isValid && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30">
          <div className="flex gap-3">
            <SimpleIcon name="info" size={20} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Required Fields</p>
              <p className="text-blue-700 dark:text-blue-400">
                Please complete all required fields before proceeding to the next step.
                {slug && !slugAvailable && " Make sure your slug is available."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
