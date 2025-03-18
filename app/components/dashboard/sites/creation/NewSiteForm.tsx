"use client";

/**
 * New Site Form Component
 * -----------------------
 * A multi-step form for creating a new blog site in the BlogStack platform.
 *
 * Features:
 * - Multi-step form with steps for different sections (Basics, Branding, Social)
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
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { CreateSiteAction } from "@/app/serverActions/site/createSite";
import { SiteCreationSchema } from "@/app/utils/validation/siteSchema";

import { addHiddenInput } from "../utils/hooks";
// Import types and utilities
import type { SiteFormValues, StepName } from "../utils/types";
import { validateForm, validateStepFields } from "../utils/zodValidation";
// Import components
import { StepIndicator } from "./components/StepIndicator";
import { BasicsStep } from "./steps/BasicsStep";
import { BrandingStep } from "./steps/BrandingStep";
import { SocialStep } from "./steps/SocialStep";
import { SummaryStep } from "./steps/SummaryStep";

export function NewSiteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, formAction] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [activeStep, setActiveStep] = useState<StepName>("basics");
  const [_formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Define steps for the form - memoize to prevent recreation
  const steps: StepName[] = useMemo(() => ["basics", "branding", "social", "summary"], []);

  // State for form values and active step
  const [formValues, setFormValues] = useState<SiteFormValues>({
    name: "",
    description: "",
    subdirectory: "",
    language: "LTR",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  const [form, fields] = useForm({
    id: "create-site-form",
    lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteCreationSchema() });
    },
  });

  // Handle form submission result
  useEffect(() => {
    if (!lastResult) return;

    // Check if lastResult is a custom response with success property
    if ("success" in lastResult && lastResult.success && "redirectUrl" in lastResult) {
      toast.success("Site created successfully!");
      router.push(lastResult.redirectUrl as string);
    }
  }, [lastResult, router]);

  /**
   * Update form values when input changes
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Only call stopPropagation if e is a valid event object
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }

    // Make sure e.target exists and has name/value properties
    if (e && e.target && "name" in e.target && "value" in e.target) {
      const { name, value } = e.target;
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  /**
   * Set the active step with validation
   */
  const setStepExplicitly = useCallback(
    (stepName: StepName) => {
      // Validate current step before allowing navigation
      const currentStepIndex = steps.findIndex((step) => step === activeStep);
      const targetStepIndex = steps.findIndex((step) => step === stepName);

      // Only validate when moving forward
      if (targetStepIndex > currentStepIndex) {
        const errors = validateStepFields(formValues, activeStep);

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return; // Don't allow navigation if there are errors
        }
      }

      setActiveStep(stepName);
    },
    [activeStep, formValues, steps, setFormErrors]
  );

  /**
   * Navigate to next step with validation
   */
  const goToNextStep = useCallback(
    (e?: React.MouseEvent) => {
      if (e && typeof e.preventDefault === "function" && typeof e.stopPropagation === "function") {
        e.preventDefault();
        e.stopPropagation();
      }

      const currentIndex = steps.findIndex((step) => step === activeStep);
      if (currentIndex < steps.length - 1) {
        // Validate current step before proceeding
        const errors = validateStepFields(formValues, activeStep);

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return; // Don't proceed if there are errors
        }

        setActiveStep(steps[currentIndex + 1]);
      }
    },
    [activeStep, formValues, steps, setFormErrors]
  );

  /**
   * Navigate to previous step
   */
  const goToPrevStep = useCallback(
    (e?: React.MouseEvent) => {
      if (e && typeof e.stopPropagation === "function" && typeof e.preventDefault === "function") {
        e.stopPropagation();
        e.preventDefault();
      }

      const currentIndex = steps.findIndex((step) => step === activeStep);
      if (currentIndex > 0) {
        setActiveStep(steps[currentIndex - 1]);
      }
    },
    [activeStep, steps]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      // Always prevent default to handle submission ourselves
      e.preventDefault();

      // Only allow form submission from the summary step
      if (activeStep !== "summary") {
        goToNextStep();
        return;
      }

      // Validate all form fields before submission
      const errors = validateForm(formValues);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return; // Don't submit if there are errors
      }

      // When on the summary step, prepare the form data and submit
      const formElement = e.currentTarget;

      // Clear any existing hidden inputs to prevent duplicates
      const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach((input) => {
        // Safe type assertion since we're only selecting input elements
        const inputEl = input as HTMLInputElement;
        // Skip CSRF and framework-specific inputs
        if (inputEl.name !== "csrf" && !inputEl.name.startsWith("_")) {
          inputEl.parentNode?.removeChild(inputEl);
        }
      });

      // Add hidden fields for images if they exist
      if (siteImageCover) {
        addHiddenInput(formElement, "siteImageCover", siteImageCover);
      }

      if (logoImage) {
        addHiddenInput(formElement, "logoImage", logoImage);
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
    },
    [activeStep, formValues, goToNextStep, siteImageCover, logoImage, formAction, startTransition, setFormErrors]
  );

  // Memoize the active index calculation
  const activeIndex = useMemo(() => steps.findIndex((step) => step === activeStep), [steps, activeStep]);

  return (
    <Card className="overflow-hidden border bg-card shadow-sm">
      <Tabs value={activeStep} className="w-full">
        <StepIndicator steps={steps} activeIndex={activeIndex} handleStepChange={setStepExplicitly} />

        <form id={form.id} className="space-y-6" onSubmit={handleSubmit}>
          <TabsContent value="basics">
            <BasicsStep
              fields={fields}
              goToNextStep={goToNextStep}
              formValues={formValues}
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingStep
              fields={fields}
              siteImageCover={siteImageCover}
              setSiteImageCover={setSiteImageCover}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              goToNextStep={goToNextStep}
              goToPrevStep={goToPrevStep}
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialStep
              fields={fields}
              goToPrevStep={goToPrevStep}
              formValues={formValues}
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryStep
              formValues={formValues}
              siteImageCover={siteImageCover}
              logoImage={logoImage}
              goToPrevStep={goToPrevStep}
              isPending={isPending}
            />
          </TabsContent>
        </form>
      </Tabs>
    </Card>
  );
}
