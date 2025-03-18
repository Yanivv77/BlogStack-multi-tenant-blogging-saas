"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

import { useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { JSONContent } from "novel";
import slugify from "react-slugify";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { EditPostActions } from "@/app/serverActions/post/editPost";
import { getOptimizedDropzoneConfig, UploadDropzone } from "@/app/utils/upload/uploadthing";
import { PostSchema } from "@/app/utils/validation/postSchema";

import { EditorWrapper } from "../../contentEditor";
import { SeoRecommendations } from "../../contentEditor/ui/SeoRecommendations";
import { addExistingImages, clearUploadedImages, getUploadedImages } from "../../contentEditor/utils/image-upload";
import { SubmitButton } from "../../SubmitButtons";

interface iAppProps {
  data: {
    slug: string;
    title: string;
    smallDescription: string;
    articleContent: unknown;
    contentImages?: string[];
    id: string;
    postCoverImage: string;
    keywords?: string;
  };
  siteId: string;
}

export function EditArticleForm({ data, siteId }: iAppProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(data.postCoverImage || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [value, setValue] = useState<JSONContent | undefined>(data.articleContent as JSONContent);
  const [slug, setSlugValue] = useState<string>(data.slug || "");
  const [title, setTitle] = useState<string>(data.title || "");
  const [smallDescription, setSmallDescription] = useState<string>(data.smallDescription || "");
  const [keywords, setKeywords] = useState<string>(data.keywords || "");

  // Initialize uploaded images with existing content images
  useEffect(() => {
    clearUploadedImages();
    // If there are existing content images, re-add them to the tracking array
    if (data.contentImages && Array.isArray(data.contentImages)) {
      // Add existing images to our tracking array
      addExistingImages(data.contentImages);
    }
  }, [data.contentImages]);

  const [lastResult, action] = useActionState(EditPostActions, undefined);
  const [form, fields] = useForm({
    // Use type assertion with a more specific type to ensure compatibility
    lastResult: lastResult
      ? ({
          status: "error" in lastResult && lastResult.error ? "error" : "success",
          error: "error" in lastResult && lastResult.error ? lastResult.error : undefined,
          value: "success" in lastResult && lastResult.success ? { postId: lastResult.postId } : undefined,
        } as SubmissionResult<unknown>)
      : undefined,

    onValidate({ formData }) {
      // Use the PostSchema for basic validation
      // In a server action we'd use PostEditSchema with slug uniqueness check
      return parseWithZod(formData, {
        schema: PostSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Add a useEffect to show toast messages when the article is successfully saved
  useEffect(() => {
    if (lastResult) {
      // Check if it has a status property
      interface ActionResult {
        success: boolean;
        postId?: string;
        error?: { message: string };
      }
      const result = lastResult as ActionResult;
      if (result.success) {
        toast.success("Article updated successfully!");
      } else if (result.error) {
        toast.error(result.error.message || "Failed to update article");
      }
    }
  }, [lastResult]);

  // Get optimized config
  const optimizedConfig = getOptimizedDropzoneConfig();

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
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Article Details</CardTitle>
        <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" id={form.id} onSubmit={form.onSubmit} action={action}>
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="keywords" value={keywords} />
          {/* Hidden input to store the post cover image URL */}
          {imageUrl && (
            <input type="hidden" name={fields.postCoverImage.name} key={fields.postCoverImage.key} value={imageUrl} />
          )}
          <div className="grid gap-2">
            <Label>Cover Image (Optional)</Label>
            {imageUrl ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-[200px] w-[200px]">
                  <Image src={imageUrl} alt="Uploaded Image" className="rounded-lg object-cover" fill sizes="200px" />
                </div>
                <Button type="button" variant="destructive" onClick={() => setImageUrl(null)} className="w-auto">
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                {isUploadingImage ? (
                  <div className="flex h-[200px] w-full max-w-[400px] flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                      <p className="text-sm text-muted-foreground">Uploading image...</p>
                    </div>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onUploadBegin={() => {
                      setIsUploadingImage(true);
                    }}
                    onClientUploadComplete={(res: { ufsUrl: string }[]) => {
                      setIsUploadingImage(false);
                      console.info("Upload response:", res[0]);
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
                      container:
                        "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px] h-[200px] flex flex-col items-center justify-center",
                    }}
                  />
                )}
              </div>
            )}
            <p className="text-sm text-red-500">{fields.postCoverImage.errors as string}</p>
          </div>

          <div className="grid gap-2">
            <Label>Keywords</Label>
            <Input
              placeholder="Enter keywords separated by commas (e.g., react, nextjs, web development)"
              onChange={(e) => setKeywords(e.target.value)}
              value={keywords}
              name="keywords"
              aria-describedby="edit-keywords-hint edit-keywords-count"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="edit-keywords-hint">Add 3-5 relevant keywords to improve SEO (separated by commas)</span>
              <span
                id="edit-keywords-count"
                className={`${!keywords ? "text-muted-foreground" : ""} ${
                  keywords &&
                  keywords.split(",").filter((k) => k.trim()).length >= 3 &&
                  keywords.split(",").filter((k) => k.trim()).length <= 5 &&
                  "text-green-500"
                } ${
                  keywords &&
                  (keywords.split(",").filter((k) => k.trim()).length < 3 ||
                    keywords.split(",").filter((k) => k.trim()).length > 5) &&
                  "text-amber-500"
                }`}
                aria-live="polite"
              >
                {keywords ? keywords.split(",").filter((k) => k.trim()).length : 0} keywords
              </span>
            </div>
            {keywords && keywords.split(",").filter((k) => k.trim()).length > 5 && (
              <p className="text-sm text-amber-500">For best SEO results, use 3-5 keywords</p>
            )}
            {keywords && keywords.split(",").filter((k) => k.trim()).length < 3 && keywords.length > 0 && (
              <p className="text-sm text-amber-500">For best SEO results, add at least 3 keywords</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              key={fields.title.key}
              name={fields.title.name}
              placeholder="Article Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              maxLength={60}
              aria-describedby="edit-title-hint edit-title-error edit-title-keywords"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="edit-title-hint">Optimum length for SEO (55-60 characters)</span>
              <span
                className={`${
                  title.length < 3 && "text-destructive"
                } ${title.length >= 55 && title.length <= 60 && "text-green-500"} ${
                  title.length >= 3 && (title.length < 55 || title.length > 60) && "text-amber-500"
                }`}
                aria-live="polite"
              >
                {title.length}/60
              </span>
            </div>
            {keywords && keywords.length > 0 && (
              <div id="edit-title-keywords" className="text-xs">
                {(() => {
                  const keywordsList = keywords.split(",").filter((k) => k.trim());
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
            {fields.title.errors ? (
              <p id="edit-title-error" className="text-sm text-red-500">
                {fields.title.errors as unknown as React.ReactNode}
              </p>
            ) : null}
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
            <Button onClick={handleSlugGeneration} className="w-fit" variant="secondary" type="button">
              <SimpleIcon name="atom" size={16} className="mr-2" /> Generate Slug
            </Button>
            {fields.slug.errors ? (
              <p className="text-sm text-red-500">{fields.slug.errors as unknown as React.ReactNode}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>Meta Description</Label>
            <Textarea
              key={fields.smallDescription.key}
              name={fields.smallDescription.name}
              value={smallDescription}
              onChange={(e) => setSmallDescription(e.target.value)}
              placeholder="Meta description for search engine results..."
              className="h-32"
              maxLength={160}
              aria-describedby="edit-description-hint edit-description-error edit-description-keywords"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="edit-description-hint">Optimum length for SEO (120-160 characters)</span>
              <span
                className={`${(smallDescription.length < 10 || smallDescription.length > 160) && "text-destructive"} ${
                  smallDescription.length >= 120 && smallDescription.length <= 160 && "text-green-500"
                } ${smallDescription.length >= 10 && smallDescription.length < 120 && "text-amber-500"}`}
                aria-live="polite"
              >
                {smallDescription.length}/160
              </span>
            </div>
            {keywords && keywords.length > 0 && (
              <div id="edit-description-keywords" className="text-xs">
                {(() => {
                  const keywordsList = keywords.split(",").filter((k) => k.trim());
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
            {fields.smallDescription.errors ? (
              <p id="edit-description-error" className="text-sm text-red-500">
                {fields.smallDescription.errors as unknown as React.ReactNode}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>Article Content</Label>
            <input
              type="hidden"
              name={fields.articleContent.name}
              key={fields.articleContent.key}
              value={value ? JSON.stringify(value) : "{}"}
            />
            <input
              type="hidden"
              name={fields.contentImages.name}
              key={fields.contentImages.key}
              value={JSON.stringify(getUploadedImages())}
            />
            <EditorWrapper onChange={setValue} initialValue={value} />
            {fields.articleContent.errors ? (
              <p className="text-sm text-red-500">{fields.articleContent.errors as unknown as React.ReactNode}</p>
            ) : null}

            {/* SEO Recommendations */}
            <SeoRecommendations content={value} title={title} smallDescription={smallDescription} keywords={keywords} />
          </div>

          <SubmitButton text="Edit Article" />
        </form>
      </CardContent>
    </Card>
  );
}
