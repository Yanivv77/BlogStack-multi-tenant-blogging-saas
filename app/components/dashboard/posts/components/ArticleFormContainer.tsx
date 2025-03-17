"use client";

import Link from "next/link";
import type { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { JSONContent } from "novel";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { useArticleDraft } from "../hooks/useArticleDraft";
import { useCreateArticle } from "../hooks/useCreateArticle";
import { ArticleBasicForm } from "./ArticleBasicForm";
import { ArticleContentForm } from "./ArticleContentForm";

type AppRouterInstance = ReturnType<typeof useRouter>;

interface ArticleFormContainerProps {
  siteId: string;
  router: AppRouterInstance;
  isNewFromUrl: boolean;
  initialStep?: number;
}

interface FormData {
  title: string;
  slug: string;
  smallDescription: string;
  keywords?: string;
}

// Use this type for the state to make keywords optional
interface FormDataState {
  title: string;
  slug: string;
  smallDescription: string;
  keywords: string;
}

type FormStep = 1 | 2;

export function ArticleFormContainer({ siteId, router, isNewFromUrl, initialStep = 1 }: ArticleFormContainerProps) {
  // Form step state
  const [currentStep, setCurrentStep] = useState<FormStep>(initialStep === 2 ? 2 : 1);

  // Core state for article
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [value, setValue] = useState<JSONContent | undefined>(undefined);
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    slug: "",
    smallDescription: "",
    keywords: "",
  });

  // Validation states
  const [basicInfoValid, setBasicInfoValid] = useState(false);

  // Track if this is a new article (from URL param)
  const [isNewArticle, setIsNewArticle] = useState(isNewFromUrl);

  const [slugAvailable, setSlugAvailable] = useState(false);

  // Custom hooks for article management
  const { draftLoaded, loadDraft, clearAllDrafts, handleSaveDraft } = useArticleDraft({
    siteId,
    formData,
    setFormData: (data: FormData) => {
      // Ensure keywords is always a string
      const updatedData = {
        ...data,
        keywords: data.keywords || "",
      };
      setFormData(updatedData);
    },
    imageUrl,
    setImageUrl,
    value,
    setValue,
    isNewArticle,
  });

  const { handleSubmit, isSubmitting, lastResult } = useCreateArticle({
    siteId,
    onSuccess: () => {
      clearAllDrafts();

      router.push(`/dashboard/sites/${siteId}`);
    },
  });

  // Check if basic info is valid to enable next step
  useEffect(() => {
    const { title, slug, smallDescription } = formData;
    const isValid =
      title.trim().length >= 3 && slug.trim().length >= 3 && smallDescription.trim().length >= 10 && slugAvailable;

    setBasicInfoValid(isValid);
  }, [formData, slugAvailable]);

  // Handle new article parameter
  useEffect(() => {
    if (isNewFromUrl) {
      clearAllDrafts();
      setFormData({ title: "", slug: "", smallDescription: "", keywords: "" });
      setImageUrl(null);
      setValue(undefined);
      setCurrentStep(1);

      // Remove the 'new' parameter to avoid clearing on refresh
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("new");
        router.replace(url.pathname);
        setIsNewArticle(false);
      }, 100);
    } else if (!draftLoaded) {
      // Load draft if exists
      loadDraft();
    }
  }, [isNewFromUrl, router, draftLoaded]);

  // Reset form to create a new article
  const resetForm = () => {
    setFormData({ title: "", slug: "", smallDescription: "", keywords: "" });
    setImageUrl(null);
    setValue(undefined);
    clearAllDrafts();
    setIsNewArticle(true);
    setCurrentStep(1);
    toast.success("Form cleared for new article");
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 1 && basicInfoValid) {
      setCurrentStep(2);
      // Update URL to reflect step
      const url = new URL(window.location.href);
      url.searchParams.set("step", "2");
      router.replace(url.toString());
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      // Update URL to reflect step
      const url = new URL(window.location.href);
      url.searchParams.set("step", "1");
      router.replace(url.toString());
    }
  };

  // Get current step key for tabs
  const currentTabValue = `step-${currentStep}`;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center">
        <Button asChild size="icon" variant="outline" className="mr-3">
          <Link href={`/dashboard/sites/${siteId}`}>
            <SimpleIcon name="arrowleft" size={16} />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Create Article</h1>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex justify-center">
        <div className="flex w-full max-w-md items-center">
          <div
            className={`flex flex-1 flex-col items-center ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`rounded-full border-2 p-2 ${currentStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
            >
              <SimpleIcon name="edit" size={16} />
            </div>
            <span className="mt-1 text-sm font-medium">Basic Info</span>
          </div>

          <div className={`flex-1 border-t-2 ${currentStep >= 2 ? "border-primary" : "border-muted-foreground"}`} />

          <div
            className={`flex flex-1 flex-col items-center ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`rounded-full border-2 p-2 ${currentStep >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
            >
              <SimpleIcon name="file" size={16} />
            </div>
            <span className="mt-1 text-sm font-medium">Content & SEO</span>
          </div>
        </div>
      </div>

      {/* Main form content */}
      <Tabs
        value={currentTabValue}
        className="w-full"
        onValueChange={(val) => {
          if (val === "step-1") setCurrentStep(1);
          else if (val === "step-2" && basicInfoValid) setCurrentStep(2);
        }}
      >
        <TabsContent value="step-1" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>Start with the basic information about your article</CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleBasicForm
                formData={formData}
                setFormData={(data) => {
                  // Ensure keywords is always a string
                  const updatedData = {
                    ...data,
                    keywords: data.keywords || "",
                  };
                  setFormData(updatedData);
                }}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                isValid={basicInfoValid}
                siteId={siteId}
                onSlugAvailabilityChange={setSlugAvailable}
              />

              <div className="mt-6 flex justify-end">
                <Button onClick={goToNextStep} disabled={!basicInfoValid} className="min-w-[120px]">
                  Next Step <SimpleIcon name="arrowright" size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-2" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Write your article content and optimize for SEO</CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleContentForm
                siteId={siteId}
                formData={formData}
                editorValue={value}
                setEditorValue={setValue}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                lastResult={lastResult}
              />

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevStep}
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <SimpleIcon name="arrowleft" size={16} className="mr-2" /> Previous Step
                </Button>

                <Button
                  onClick={() => handleSubmit(formData, value, imageUrl)}
                  disabled={isSubmitting || !value}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <SimpleIcon name="check" size={16} className="mr-2" /> Create Article
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
