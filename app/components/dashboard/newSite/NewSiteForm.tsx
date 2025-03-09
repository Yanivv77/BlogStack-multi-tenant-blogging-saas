"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CreateSiteAction } from "@/app/actions";
import { SiteCreationSchema } from "@/app/utils/zodSchemas";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { StepIndicator, BasicsTab, BrandingTab, SocialTab } from ".";
import { toast } from "sonner";

interface FormValues {
  name: string;
  subdirectory: string;
  description: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export function NewSiteForm() {
  const [lastResult, action] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basics");
  
  // State to track form values
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    subdirectory: "",
    description: "",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: ""
  });
  
  const [form, fields] = useForm({
    id: "create-site-form",
    lastResult,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteCreationSchema() });
    },
  });
  
  // Update form values when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Initialize form values from DOM only once when the component mounts
  useEffect(() => {
    const formElement = document.getElementById(form.id) as HTMLFormElement;
    if (formElement) {
      const initialValues: Partial<FormValues> = {};
      let hasChanges = false;
      
      // Collect initial values from form fields
      const inputs = formElement.querySelectorAll('input, textarea');
      inputs.forEach((element) => {
        const input = element as HTMLInputElement | HTMLTextAreaElement;
        if (input.name && Object.keys(formValues).includes(input.name) && input.value) {
          const key = input.name as keyof FormValues;
          initialValues[key] = input.value;
          hasChanges = true;
        }
      });
      
      // Only update state if we found values
      if (hasChanges) {
        setFormValues(prev => ({
          ...prev,
          ...initialValues
        }));
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (value: string) => {
    // Only allow tab change if validation passes for current tab
    if (value !== activeTab) {
      if (activeTab === "basics" && value !== "basics") {
        if (!validateBasicsTab()) {
          return;
        }
      }
    }
    setActiveTab(value);
  };

  const validateBasicsTab = () => {
    let isValid = true;
    
    if (!formValues.name || formValues.name.trim() === "") {
      isValid = false;
    }
    
    if (!formValues.subdirectory || formValues.subdirectory.trim() === "") {
      isValid = false;
    }
    
    // Check for spaces in subdirectory
    if (formValues.subdirectory.includes(" ")) {
      isValid = false;
    }
    
    // Check for valid characters in subdirectory
    if (!/^[a-zA-Z0-9-]+$/.test(formValues.subdirectory)) {
      isValid = false;
    }
    
    if (!formValues.description || formValues.description.trim() === "") {
      isValid = false;
    }
    
    return isValid;
  };

  const goToNextTab = () => {
    if (activeTab === "basics") {
      if (validateBasicsTab()) {
        setActiveTab("branding");
      }
    } else if (activeTab === "branding") {
      setActiveTab("social");
    }
  };

  const goToPrevTab = () => {
    if (activeTab === "social") setActiveTab("branding");
    else if (activeTab === "branding") setActiveTab("basics");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Only allow form submission from the social tab
    if (activeTab !== "social") {
      e.preventDefault();
      e.stopPropagation();
      
      // Navigate to the appropriate tab instead
      if (activeTab === "basics") {
        if (validateBasicsTab()) {
          setActiveTab("branding");
        }
      } else if (activeTab === "branding") {
        setActiveTab("social");
      }
    }
  };

  const steps = ["basics", "branding", "social"];
  const activeIndex = steps.findIndex(step => step === activeTab);

  return (
    <Card className="border shadow-sm overflow-hidden bg-card">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <StepIndicator 
          steps={steps} 
          activeIndex={activeIndex} 
          handleTabChange={handleTabChange} 
        />
        
        <form 
          action={action} 
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