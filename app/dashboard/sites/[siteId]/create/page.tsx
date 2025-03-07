"use client";

import { CreatePostAction } from "@/app/actions";
import { UploadDropzone } from "@/app/utils/UploadthingComponents";
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
import { useParams } from 'next/navigation';
import { EditorWrapper, getUploadedImages, clearUploadedImages } from "@/app/components/dashboard/contentEditor";

export default function ArticleCreationRoute() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [value, setValue] = useState<JSONContent | undefined>(undefined);
  const [slug, setSlugValue] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [smallDescription, setSmallDescription] = useState<string>("");
  const [lastResult, action] = useActionState(CreatePostAction, undefined);
  

  useEffect(() => {
    clearUploadedImages();
  }, []);
  
  const [form, fields] = useForm({
    lastResult,

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
  return (
    <>
      <div className="flex items-center">
        <Button size="icon" variant="outline" className="mr-3" asChild>
          <Link href={`/dashboard/sites/${siteId}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Create Article</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>
            Lipsum dolor sit amet, consectetur adipiscing elit
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
                  <UploadDropzone
                    onClientUploadComplete={(res: any) => {
                      console.log("Upload response:", res[0]);
                      const imageUrl = res[0].ufsUrl;
                      setImageUrl(imageUrl);
                      toast.success("Image uploaded successfully!");
                    }}
                    endpoint="imageUploader"
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                    config={{ mode: "auto" }}
                    appearance={{
                      button: "hidden",
                      allowedContent: "hidden",
                      container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[400px]"
                    }}
                  />
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
              <EditorWrapper onChange={setValue} initialValue={value} />
              <p className="text-red-500 text-sm">
                {fields.articleContent.errors}
              </p>
            </div>

            <SubmitButton text="Create Article" />
          </form>
        </CardContent>
      </Card>
    </>
  );
}