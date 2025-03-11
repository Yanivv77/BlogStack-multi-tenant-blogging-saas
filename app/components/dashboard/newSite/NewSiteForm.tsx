"use client";

/**
 * New Site Form Component
 * -----------------------
 * A multi-step form for creating a new blog site in the BlogStack platform.
 * 
 * Features:
 * - Multi-step form with tabs for different sections (Basics, Branding, Social)
 * - Form validation using Zod schemas
 * - Real-time subdirectory availability checking
 * - Image upload for site logo and cover image
 * - Form state management with useForm hook
 * - Success/error toast notifications
 * - Automatic redirection after successful submission
 * 
 * The form is divided into three main sections:
 * 1. Basics - Site name, description, subdirectory, language
 * 2. Branding - Logo and cover image uploads
 * 3. Social - Email and social media links
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useTransition } from "react";

import { SiteCreationSchema } from "@/app/utils/validation/siteSchema";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Import types and utilities
import { SiteFormValues, StepName } from "./utils/types";
import { addHiddenInput } from "./utils/hooks";
import { validateForm, validateTabFields } from "./utils/zodValidation";

// Import components
import { StepIndicator } from "./shared/StepIndicator";
import { BasicsTab } from "./tabs/BasicsTab";
import { BrandingTab } from "./tabs/BrandingTab";
import { SocialTab } from "./tabs/SocialTab";
import { CreateSiteAction } from "@/app/serverActions/site/createSite";
import { SummaryTab } from "./tabs/SummaryTab";

export function NewSiteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, formAction] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<StepName>("basics");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Define steps for the form - memoize to prevent recreation
  const steps: StepName[] = useMemo(() => ["basics", "branding", "social", "summary"], []);
  
  // State for form values and active tab
  const [formValues, setFormValues] = useState<SiteFormValues>({
    name: "",
    description: "",
    subdirectory: "",
    language: "LTR",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: ""
  });
  
  const [form, fields] = useForm({
    id: "create-site-form",
    lastResult: lastResult as any,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteCreationSchema() });
    },
  });
  
  // Handle form submission result
  useEffect(() => {
    if (!lastResult) return;
    
    // Check if lastResult is a custom response with success property
    if ('success' in lastResult && lastResult.success && 'redirectUrl' in lastResult) {
      toast.success("Site created successfully!");
      router.push(lastResult.redirectUrl as string);
    } 
  }, [lastResult, router]);
  
  /**
   * Update form values when input changes
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Only call stopPropagation if e is a valid event object
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    // Make sure e.target exists and has name/value properties
    if (e && e.target && 'name' in e.target && 'value' in e.target) {
      const { name, value } = e.target;
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  
  /**
   * Set the active tab with validation
   */
  const setTabExplicitly = useCallback((tabName: StepName) => {
    // Validate current tab before allowing navigation
    const currentTabIndex = steps.findIndex(step => step === activeTab);
    const targetTabIndex = steps.findIndex(step => step === tabName);
    
    // Only validate when moving forward
    if (targetTabIndex > currentTabIndex) {
      const errors = validateTabFields(formValues, activeTab);
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return; // Don't allow navigation if there are errors
      }
    }
    
    setActiveTab(tabName);
  }, [activeTab, formValues, steps]);
  
  /**
   * Navigate to next tab with validation
   */
  const goToNextTab = useCallback((e?: React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function' && typeof e.stopPropagation === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentIndex = steps.findIndex(step => step === activeTab);
    if (currentIndex < steps.length - 1) {
      // Validate current tab before proceeding
      const errors = validateTabFields(formValues, activeTab);
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return; // Don't proceed if there are errors
      }
      
      setActiveTab(steps[currentIndex + 1]);
    }
  }, [activeTab, formValues, steps]);
  
  /**
   * Navigate to previous tab
   */
  const goToPrevTab = useCallback((e?: React.MouseEvent) => {
    if (e && typeof e.stopPropagation === 'function' && typeof e.preventDefault === 'function') {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const currentIndex = steps.findIndex(step => step === activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  }, [activeTab, steps]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    // Always prevent default to handle submission ourselves
    e.preventDefault();
    
    // Only allow form submission from the summary tab
    if (activeTab !== "summary") {
      goToNextTab();
      return;
    }
    
    // Validate all form fields before submission
    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Don't submit if there are errors
    }
    
    // When on the summary tab, prepare the form data and submit
    const formElement = e.currentTarget;
    
    // Clear any existing hidden inputs to prevent duplicates
    const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach((input) => {
      // Safe type assertion since we're only selecting input elements
      const inputEl = input as HTMLInputElement;
      // Skip CSRF and framework-specific inputs
      if (inputEl.name !== 'csrf' && !inputEl.name.startsWith('_')) {
        inputEl.parentNode?.removeChild(inputEl);
      }
    });
    
    // Add hidden fields for images if they exist
    if (siteImageCover) {
      addHiddenInput(formElement, 'siteImageCover', siteImageCover);
    }
    
    if (logoImage) {
      addHiddenInput(formElement, 'logoImage', logoImage);
    }
    
    // Add all form values as hidden fields to ensure they're included
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== undefined) {
        addHiddenInput(formElement, key, String(value));
      }
    });
    
    // Create a FormData object
    const formData = new FormData(formElement);
    
    // Use startTransition to properly dispatch the server action
    startTransition(() => {
      formAction(formData);
    });
  }, [activeTab, formValues, goToNextTab, siteImageCover, logoImage, formAction, startTransition]);

  // Memoize the active index calculation
  const activeIndex = useMemo(() => 
    steps.findIndex(step => step === activeTab), 
    [steps, activeTab]
  );

  return (
    <Card className="border shadow-sm overflow-hidden bg-card">
      <Tabs value={activeTab} className="w-full">
        <StepIndicator 
          steps={steps} 
          activeIndex={activeIndex} 
          handleTabChange={setTabExplicitly} 
        />
        
        <form 
          id={form.id} 
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <TabsContent value="basics">
            <BasicsTab 
              fields={fields} 
              goToNextTab={goToNextTab}
              formValues={formValues}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
          
          <TabsContent value="branding">
            <BrandingTab 
              fields={fields} 
              siteImageCover={siteImageCover} 
              setSiteImageCover={setSiteImageCover}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              goToNextTab={goToNextTab}
              goToPrevTab={goToPrevTab}
            />
          </TabsContent>
          
          <TabsContent value="social">
            <SocialTab 
              fields={fields} 
              goToPrevTab={goToPrevTab}
              formValues={formValues}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
          
          <TabsContent value="summary">
            <SummaryTab 
              formValues={formValues}
              siteImageCover={siteImageCover}
              logoImage={logoImage}
              goToPrevTab={goToPrevTab}
              isPending={isPending}
            />
          </TabsContent>
        </form>
      </Tabs>
    </Card>
  );
} 