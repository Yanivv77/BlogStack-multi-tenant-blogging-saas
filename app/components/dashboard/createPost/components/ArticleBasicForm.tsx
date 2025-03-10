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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Nextjs blogging application"
          onChange={(e) => updateFormData("title", e.target.value)}
          value={title}
        />
        {title.length > 0 && title.length < 3 && (
          <p className="text-red-500 text-sm">Title must be at least 3 characters</p>
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
        <Label htmlFor="smallDescription">Small Description</Label>
        <Textarea
          id="smallDescription"
          name="smallDescription"
          placeholder="Small Description for your blog article..."
          onChange={(e) => updateFormData("smallDescription", e.target.value)}
          value={smallDescription}
          className="h-32"
        />
        {smallDescription.length > 0 && smallDescription.length < 10 && (
          <p className="text-red-500 text-sm">Description must be at least 10 characters</p>
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