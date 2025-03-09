"use client";

import { CreatePostAction } from "@/app/actions";
import { UploadDropzone, getOptimizedDropzoneConfig } from "@/app/utils/UploadthingComponents";
import { PostSchema } from "@/app/utils/zodSchemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ArrowLeft, Atom } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { JSONContent } from "novel";
import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import slugify from "react-slugify";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  EditorWrapper, 
  getUploadedImages, 
  clearUploadedImages, 
  saveFormDraft, 
  loadFormDraft, 
  hasFormDraft, 
  clearFormDraft, 
  clearEditorStorage 
} from "@/app/components/dashboard/contentEditor";
import { SeoRecommendations } from "@/app/components/dashboard/contentEditor/ui/SeoRecommendations";

export default function ArticleCreationRoute() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = params.siteId as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [value, setValue] = useState<JSONContent | undefined>(undefined);
  const [slug, setSlugValue] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [smallDescription, setSmallDescription] = useState<string>("");
  const [lastResult, action] = useActionState(CreatePostAction, undefined);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isNewArticle, setIsNewArticle] = useState(searchParams.get('new') === 'true');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Handle the 'new' parameter to create an empty article, but only on first load
  useEffect(() => {
    const isNewFromUrl = searchParams.get('new') === 'true';
    
    if (isNewFromUrl) {
      // Clear everything for a new article
      console.log("Creating new article - clearing all content");
      clearFormDraft();
      clearUploadedImages();
      clearEditorStorage();
      setTitle("");
      setSlugValue("");
      setSmallDescription("");
      setImageUrl(null);
      setValue(undefined);
      
      // Remove the 'new' parameter to avoid clearing on refresh
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        router.replace(url.pathname);
        setIsNewArticle(false); // Mark as not new anymore
      }, 100);
    } else {
      // Not a new article, try to load draft
      const draft = loadFormDraft();
      if (draft && draft.siteId === siteId) {
        console.log("Loading saved draft on page load:", draft);
        if (draft.title) setTitle(draft.title);
        if (draft.slug) setSlugValue(draft.slug);
        if (draft.smallDescription) setSmallDescription(draft.smallDescription);
        if (draft.coverImage) setImageUrl(draft.coverImage);
        
        // Also load editor content if available in the draft
        if (draft.articleContent) {
          try {
            // Parse the content from string to object if needed
            if (typeof draft.articleContent === 'string') {
              setValue(JSON.parse(draft.articleContent));
            } else {
              setValue(draft.articleContent);
            }
            console.log("Loaded editor content from draft");
          } catch (e) {
            console.error("Error parsing editor content from draft:", e);
          }
        }
      }
    }
    
    // Mark as loaded to prevent repeated loading
    setDraftLoaded(true);
  }, [searchParams, siteId, router]);
  
  // Important: Immediate save for all changes
  useEffect(() => {
    // Only save if draft is loaded and it's not a new article
    if (draftLoaded && !isNewArticle) {
      saveDraftImmediately();
    }
  }, [title, slug, smallDescription, imageUrl, value, draftLoaded, isNewArticle, siteId]);
  
  // Immediately save draft when form values change
  const saveDraftImmediately = () => {
    // Only save if there's content to save
    if (title || slug || smallDescription || imageUrl || value) {
      // Create draft object with all form values
      const draft = {
        title,
        slug,
        smallDescription,
        coverImage: imageUrl,
        siteId,
        articleContent: value,
        lastUpdated: Date.now()
      };
      
      // Save draft to localStorage
      saveFormDraft(draft);
      console.log("Draft saved:", draft);
    }
  };

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isNewArticle) {
        saveDraftImmediately();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, slug, smallDescription, imageUrl, value, siteId, isNewArticle]);

  // Simplify draft handling with a single function to clear all drafts
  const clearAllDrafts = () => {
    clearFormDraft();
    clearEditorStorage();
    clearUploadedImages();
    console.log("All drafts cleared");
  };

  // Type guard for custom action result
  const isCustomActionResult = (result: any): result is { status: string; errors: string[] } => {
    return result && typeof result.status === 'string' && Array.isArray(result.errors);
  };

  // Handle form submission success
  useEffect(() => {
    if (lastResult) {
      if (isCustomActionResult(lastResult) && lastResult.status === "success") {
        clearAllDrafts();
        toast.success("Article created successfully");
        // Redirect to the site page
        router.push(`/dashboard/sites/${siteId}`);
      } else if (isCustomActionResult(lastResult) && lastResult.status === "error" && lastResult.errors.length > 0) {
        // Display error messages
        lastResult.errors.forEach((error: string) => toast.error(error));
      } else if (lastResult.status === "success") {
        // Handle standard submission result success
        clearAllDrafts();
        toast.success("Article created successfully");
        router.push(`/dashboard/sites/${siteId}`);
      }
    }
  }, [lastResult, siteId, router]);

  // Reset form to create a new article
  const resetForm = () => {
    setTitle("");
    setSlugValue("");
    setSmallDescription("");
    setImageUrl(null);
    setValue(undefined);
    clearAllDrafts();
    // Set as new article if we're using that state
    if (typeof setIsNewArticle === 'function') {
      setIsNewArticle(true);
    }
    toast.success("Form cleared for new article");
  };

  // Manual save button with simplified logic
  const handleSaveDraft = () => {
    if (title || slug || smallDescription || imageUrl || value) {
      saveDraftImmediately();
      // Set as not a new article if we're using that state
      if (typeof setIsNewArticle === 'function') {
        setIsNewArticle(false);
      }
      toast.success("Draft saved successfully");
    } else {
      toast.info("Nothing to save - add some content first");
    }
  };

  const [form, fields] = useForm({
    // Cast lastResult to any to avoid type issues with the custom action result
    lastResult: lastResult as any,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PostSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  function handleSlugGeneration() {
    const titleInput = title;

    if (titleInput?.length === 0 || titleInput === undefined) {
      return toast.error("Please create a title first");
    }

    // Generate a slug that follows the regex pattern: lowercase letters, numbers, and hyphens
    const generatedSlug = slugify(titleInput);

    setSlugValue(generatedSlug);

    return toast.success("Slug has been created");
  }

  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button asChild size="icon" variant="outline" className="mr-3">
            <Link href={`/dashboard/sites/${siteId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Create Article</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={resetForm}
            className="flex items-center"
          >
            New Article
          </Button>
        </div>
      </div>

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
            onSubmit={form.onSubmit}
            action={action}
          >
            <input type="hidden" name="siteId" value={siteId} />
            {/* Hidden input to store the post cover image URL */}
            {imageUrl && (
              <input
                type="hidden"
                name={fields.postCoverImage.name}
                key={fields.postCoverImage.key}
                value={imageUrl}
              />
            )}
            
            <div className="grid gap-2">
              <Label>Cover Image (Optional)</Label>
              {imageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-[200px] h-[200px]">
                    <Image
                      src={imageUrl}
                      alt="Uploaded Image"
                      className="object-cover rounded-lg"
                      fill
                      sizes="200px"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setImageUrl(null)}
                    className="w-auto"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  {isUploadingImage ? (
                    <div className="border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] flex flex-col items-center justify-center h-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onUploadBegin={() => {
                        setIsUploadingImage(true);
                      }}
                      onClientUploadComplete={(res: any) => {
                        setIsUploadingImage(false);
                        console.log("Upload response:", res[0]);
                        const imageUrl = res[0].ufsUrl;
                        setImageUrl(imageUrl);
                        toast.success("Image uploaded successfully!");
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingImage(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      {...optimizedConfig}
                      appearance={{
                        ...optimizedConfig.appearance,
                        container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] h-[200px] flex flex-col items-center justify-center"
                      }}
                    />
                  )}
                </div>
              )}
              <p className="text-red-500 text-sm">{fields.postCoverImage.errors}</p>
            </div>

            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                key={fields.title.key}
                name={fields.title.name}
                placeholder="Nextjs blogging application"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
              <p className="text-red-500 text-sm">{fields.title.errors}</p>
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                key={fields.slug.key}
                name={fields.slug.name}
                placeholder="Article Slug"
                onChange={(e) => setSlugValue(e.target.value)}
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
              <Label>Small Description</Label>
              <Textarea
                key={fields.smallDescription.key}
                name={fields.smallDescription.name}
                placeholder="Small Description for your blog article..."
                onChange={(e) => setSmallDescription(e.target.value)}
                value={smallDescription}
                className="h-32"
              />
              <p className="text-red-500 text-sm">
                {fields.smallDescription.errors}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Article Content</Label>
              <input
                type="hidden"
                name={fields.articleContent.name}
                key={fields.articleContent.key}
                value={value ? JSON.stringify(value) : '{}'}
              />
              <input
                type="hidden"
                name={fields.contentImages.name}
                key={fields.contentImages.key}
                value={JSON.stringify(getUploadedImages())}
              />
              <EditorWrapper 
                onChange={(newValue) => {
                  console.log("Editor content changed");
                  setValue(newValue);
                }} 
                initialValue={value}
              />
              <p className="text-red-500 text-sm">
                {fields.articleContent.errors}
              </p>
              
              {/* SEO Recommendations */}
              <SeoRecommendations 
                content={value} 
                title={title} 
                smallDescription={smallDescription} 
              />
            </div>

            <SubmitButton text="Create Article" />
          </form>
        </CardContent>
      </Card>
    </>
  );
}