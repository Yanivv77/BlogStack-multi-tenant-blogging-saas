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
import TailwindAdvancedEditor from "@/app/components/dashboard/posts_editor/EditorWrapper";
import { getUploadedImages, clearUploadedImages } from "@/app/components/dashboard/posts_editor/image-upload";

export default function ArticleCreationRoute() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [value, setValue] = useState<JSONContent | undefined>(undefined);
  const [slug, setSlugValue] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [smallDescription, setSmallDescription] = useState<string>("");
  const [lastResult, action] = useActionState(CreatePostAction, undefined);
  
  // Clear uploaded images when component mounts
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
      return toast.error("Pleaes create a title first");
    }

    setSlugValue(slugify(titleInput));

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

      <div className="grid gap-2">
        <Label>Cover Image</Label>
        <input
          type="hidden"
          name={fields.postCoverImage.name}
          key={fields.postCoverImage.key}
          value={imageUrl}
        />
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Uploaded Image"
            className="object-cover w-[200px] h-[200px] rounded-lg"
            width={200}
            height={200}
          />
        ) : (
          <UploadDropzone
            onClientUploadComplete={(res) => {
              setImageUrl(res[0].ufsUrl);
              toast.success("Image has been uploaded");
            }}
            endpoint="imageUploader"
            onUploadError={() => {
              toast.error("Something went wrong...");
            }}
          />
        )}

        <p className="text-red-500 text-sm">{fields.postCoverImage.errors}</p>
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
                value={JSON.stringify(value)}
              />
              <input
                type="hidden"
                name={fields.contentImages.name}
                key={fields.contentImages.key}
                value={JSON.stringify(getUploadedImages())}
              />
              <TailwindAdvancedEditor onChange={setValue} initialValue={value} />
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