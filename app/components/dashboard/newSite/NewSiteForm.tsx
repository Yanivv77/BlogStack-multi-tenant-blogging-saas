"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import { SiteCreationSchema } from "@/app/utils/zodSchemas";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

// Import types and utilities
import { SiteFormValues, StepName } from "./utils/types";
import { addHiddenInput } from "./utils/hooks";

// Import components
import { StepIndicator } from "./shared/StepIndicator";
import { BasicsTab } from "./tabs/BasicsTab";
import { BrandingTab } from "./tabs/BrandingTab";
import { SocialTab } from "./tabs/SocialTab";
import { CreateSiteAction } from "@/app/serverActions/site/createSite";

/**
 * NewSiteForm component
 * Multi-step form for creating a new site
 */
export function NewSiteForm() {
  const router = useRouter();
  const [lastResult, formAction] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<StepName>("basics");
  
  // Define steps for the form - memoize to prevent recreation
  const steps: StepName[] = useMemo(() => ["basics", "branding", "social"], []);
  
  // State to track form values
  const [formValues, setFormValues] = useState<SiteFormValues>({
    name: "",
    subdirectory: "",
    description: "",
    language: "English", // Default to English
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
    // Prevent any default behaviors
    e.stopPropagation();
    
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  /**
   * Set the active tab
   */
  const setTabExplicitly = useCallback((tabName: StepName) => {
    setActiveTab(tabName);
  }, []);
  
  /**
   * Validate basics tab fields
   */
  const validateBasicsTab = useCallback(() => {
    let isValid = true;
    const errors: string[] = [];
    
    if (!formValues.name?.trim()) {
      isValid = false;
      errors.push("Site name is required");
    }
    
    if (!formValues.subdirectory?.trim()) {
      isValid = false;
      errors.push("Subdirectory is required");
    }
    
    // Check for spaces in subdirectory
    if (formValues.subdirectory?.includes(" ")) {
      isValid = false;
      errors.push("Subdirectory cannot contain spaces");
    }
    
    // Check for valid characters in subdirectory
    if (formValues.subdirectory && !/^[a-zA-Z0-9-]+$/.test(formValues.subdirectory)) {
      isValid = false;
      errors.push("Subdirectory can only contain letters, numbers, and hyphens");
    }
    
    if (!formValues.description?.trim()) {
      isValid = false;
      errors.push("Description is required");
    }
    
    return isValid;
  }, [formValues.name, formValues.subdirectory, formValues.description]);
  
  /**
   * Navigate to next tab
   */
  const goToNextTab = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (activeTab === "basics") {
      if (validateBasicsTab()) {
        setActiveTab("branding");
      }
    } else if (activeTab === "branding") {
      setActiveTab("social");
    }
  }, [activeTab, validateBasicsTab]);
  
  /**
   * Navigate to previous tab
   */
  const goToPrevTab = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (activeTab === "social") setActiveTab("branding");
    else if (activeTab === "branding") setActiveTab("basics");
  }, [activeTab]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow form submission from the social tab
    if (activeTab !== "social") {
      // Navigate to the appropriate tab instead
      if (activeTab === "basics") {
        if (validateBasicsTab()) {
          setActiveTab("branding");
        }
      } else if (activeTab === "branding") {
        setActiveTab("social");
      }
    } else {
      // When on the social tab, allow the form to actually submit to the server
      const formElement = e.currentTarget;
      
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
          addHiddenInput(formElement, key, value);
        }
      });
      
      // Submit the form to create the site
      formElement.requestSubmit();
    }
  }, [activeTab, validateBasicsTab, siteImageCover, logoImage, formValues]);

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
          action={formAction}
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
        </form>
      </Tabs>
    </Card>
  );
} 