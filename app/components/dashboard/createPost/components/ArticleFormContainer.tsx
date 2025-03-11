"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { JSONContent } from "novel";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Edit, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ArticleBasicForm } from "./ArticleBasicForm";
import { ArticleContentForm } from "./ArticleContentForm";
import { useCreateArticle } from "../hooks/useCreateArticle";
import { useArticleDraft } from "../hooks/useArticleDraft";

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
type FormDataState = {
  title: string;
  slug: string;
  smallDescription: string;
  keywords: string;
};

type FormStep = 1 | 2;

export function ArticleFormContainer({ 
  siteId, 
  router, 
  isNewFromUrl,
  initialStep = 1 
}: ArticleFormContainerProps) {
  // Form step state
  const [currentStep, setCurrentStep] = useState<FormStep>(
    initialStep === 2 ? 2 : 1
  );
  
  // Core state for article
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [value, setValue] = useState<JSONContent | undefined>(undefined);
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    slug: "",
    smallDescription: "",
    keywords: ""
  });
  
  // Validation states
  const [basicInfoValid, setBasicInfoValid] = useState(false);
  
  // Track if this is a new article (from URL param)
  const [isNewArticle, setIsNewArticle] = useState(isNewFromUrl);
  
  const [slugAvailable, setSlugAvailable] = useState(false);
  
  // Custom hooks for article management
  const { 
    draftLoaded, 
    loadDraft, 
    clearAllDrafts, 
    handleSaveDraft
  } = useArticleDraft({
    siteId,
    formData,
    setFormData: (data: FormData) => {
      // Ensure keywords is always a string
      const updatedData = {
        ...data,
        keywords: data.keywords || ""
      };
      setFormData(updatedData);
    },
    imageUrl,
    setImageUrl,
    value,
    setValue,
    isNewArticle
  });
  
  const { handleSubmit, isSubmitting, lastResult } = useCreateArticle({
    siteId,
    onSuccess: () => {
      clearAllDrafts();
      
      router.push(`/dashboard/sites/${siteId}`);
    }
  });
  
  // Check if basic info is valid to enable next step
  useEffect(() => {
    const { title, slug, smallDescription } = formData;
    const isValid = 
      title.trim().length >= 3 && 
      slug.trim().length >= 3 && 
      smallDescription.trim().length >= 10 &&
      slugAvailable;
    
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
        url.searchParams.delete('new');
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
      url.searchParams.set('step', '2');
      router.replace(url.toString());
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      // Update URL to reflect step
      const url = new URL(window.location.href);
      url.searchParams.set('step', '1');
      router.replace(url.toString());
    }
  };

  // Get current step key for tabs
  const currentTabValue = `step-${currentStep}`;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
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
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          >
            New Article
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveDraft}
            className="bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white"
          >
            Save Draft
          </Button>
        </div>
      </div>
      
      {/* Step indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center w-full max-w-md">
          <div className={`flex flex-col items-center flex-1 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`rounded-full border-2 p-2 ${currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
              <Edit className="size-4" />
            </div>
            <span className="mt-1 text-sm font-medium">Basic Info</span>
          </div>
          
          <div className={`border-t-2 flex-1 ${currentStep >= 2 ? 'border-primary' : 'border-muted-foreground'}`} />
          
          <div className={`flex flex-col items-center flex-1 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`rounded-full border-2 p-2 ${currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
              <FileText className="size-4" />
            </div>
            <span className="mt-1 text-sm font-medium">Content & SEO</span>
          </div>
        </div>
      </div>
      
      {/* Main form content */}
      <Tabs value={currentTabValue} className="w-full" onValueChange={val => {
        if (val === 'step-1') setCurrentStep(1);
        else if (val === 'step-2' && basicInfoValid) setCurrentStep(2);
      }}>
        <TabsContent value="step-1" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Start with the basic information about your article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleBasicForm
                formData={formData}
                setFormData={(data) => {
                  // Ensure keywords is always a string
                  const updatedData = {
                    ...data,
                    keywords: data.keywords || ""
                  };
                  setFormData(updatedData);
                }}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                isValid={basicInfoValid}
                siteId={siteId}
                onSlugAvailabilityChange={setSlugAvailable}
              />
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={goToNextStep} 
                  disabled={!basicInfoValid}
                  className="min-w-[120px]"
                >
                  Next Step <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="step-2" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Write your article content and optimize for SEO
              </CardDescription>
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
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={goToPrevStep}
                  className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <ArrowLeft className="mr-2 size-4" /> Previous Step
                </Button>
                
                <Button 
                  onClick={() => handleSubmit(formData, value, imageUrl)}
                  disabled={isSubmitting || !value}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 size-4" /> Create Article
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