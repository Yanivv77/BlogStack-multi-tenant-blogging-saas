"use client";

import { CreateSiteAction } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { siteSchema } from "@/app/utils/zodSchemas";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { useState } from "react";
import { UploadDropzone } from "@/app/utils/UploadthingComponents";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NewSiteRoute() {
  const [lastResult, action] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string | null>(null);
  
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: siteSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Card className="max-w-[450px]">
        <CardHeader>
          <CardTitle>Create Site</CardTitle>
          <CardDescription>
            Create your Site here. Click the button below once your done...
          </CardDescription>
        </CardHeader>
        <form id={form.id} onSubmit={form.onSubmit} action={action}>
          <CardContent>
            <div className="flex flex-col gap-y-6">
              <div className="grid gap-2">
                <Label>Site Name</Label>
                <Input
                  name={fields.name.name}
                  key={fields.name.key}
                  defaultValue={fields.name.initialValue}
                  placeholder="Site Name"
                />
                <p className="text-red-500 text-sm">{fields.name.errors}</p>
              </div>

              <div className="grid gap-2">
                <Label>Subdirectory</Label>
                <Input
                  name={fields.subdirectory.name}
                  key={fields.subdirectory.key}
                  defaultValue={fields.subdirectory.initialValue}
                  placeholder="Subdirectory"
                />
                <p className="text-red-500 text-sm">
                  {fields.subdirectory.errors}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  name={fields.description.name}
                  key={fields.description.key}
                  defaultValue={fields.description.initialValue}
                  placeholder="Small Description for your site"
                />
                <p className="text-red-500 text-sm">
                  {fields.description.errors}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Site Cover Image (Optional)</Label>
                {siteImageCover ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full h-40">
                      <Image
                        src={siteImageCover}
                        alt="Site cover"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setSiteImageCover(null)}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res: any) => {
                      setSiteImageCover(res[0].url);
                      toast.success("Image uploaded successfully!");
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                  />
                )}
              </div>

              {/* Hidden input to store the image URL */}
              {siteImageCover && (
                <input
                  type="hidden"
                  name={fields.siteImageCover.name}
                  value={siteImageCover}
                />
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton text="Create Site" />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}