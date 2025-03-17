"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { UpdateSiteAction } from "@/app/serverActions/site/updateSite";
import type { LanguageEnum } from "@/app/utils/validation";
import { Language } from "@/app/utils/validation";
import { parseFormWithZod } from "@/app/utils/validation/conform";
import { SiteEditSchema, siteSchema } from "@/app/utils/validation/site-schema";

// Define the props type
interface UpdateSiteFormProps {
  site: {
    id: string;
    name: string;
    description: string | null;
    language: string;
    email: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    subdirectory: string;
    siteImageCover: string | null;
    logoImage: string | null;
  };
}

// Client component for the update form
export function UpdateSiteForm({ site }: UpdateSiteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof siteSchema>>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site.name,
      description: site.description || "",
      subdirectory: site.subdirectory, // Use the existing subdirectory value
      language:
        site.language === Language.LTR || site.language === Language.RTL
          ? (site.language as z.infer<typeof LanguageEnum>)
          : Language.LTR, // Default to LTR for any other values
      email: site.email || "",
      githubUrl: site.githubUrl || "",
      linkedinUrl: site.linkedinUrl || "",
      portfolioUrl: site.portfolioUrl || "",
      siteImageCover: site.siteImageCover || "",
      logoImage: site.logoImage || "",
    },
  });

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      // Add the siteId to the form data
      formData.append("siteId", site.id);

      // Explicitly add the subdirectory value from the site
      // Make sure we're not adding it if it already exists
      if (!formData.has("subdirectory")) {
        formData.append("subdirectory", site.subdirectory);
      }

      // Preserve image fields if they're not explicitly set in the form
      if (!formData.has("siteImageCover") && site.siteImageCover) {
        formData.append("siteImageCover", site.siteImageCover);
      }

      if (!formData.has("logoImage") && site.logoImage) {
        formData.append("logoImage", site.logoImage);
      }

      // First, validate the form data with our schema
      const validationResult = parseFormWithZod(formData, SiteEditSchema());

      if (validationResult.status !== "success") {
        // Show error toast for validation failures
        toast.error("Please fix the validation errors");
        setIsSubmitting(false);
        return;
      }

      // Submit the form if validation passes
      const result = await UpdateSiteAction(null, formData);

      // Handle different response formats
      if (!result) {
        toast.error("No response received from server");
      } else if ("error" in result && result.error) {
        // Handle form errors from the server
        const formError = result.error._form?.[0];
        if (formError) {
          toast.error(formError);
        } else {
          toast.error("An error occurred while updating the site");
        }
      } else if ("success" in result && result.success) {
        toast.success("Site updated successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Information</h3>
        <p className="text-sm text-muted-foreground">Update your site's basic information and settings</p>
      </div>

      <Form {...form}>
        <form action={onSubmit} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Blog" {...field} />
                      </FormControl>
                      <FormDescription>The name of your site as it will appear to visitors</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select text direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Language.LTR}>LTR (Left to Right)</SelectItem>
                          <SelectItem value={Language.RTL}>RTL (Right to Left)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The text direction for your site. LTR for languages like English or Spanish, RTL for Hebrew or
                        Arabic.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Read-only subdirectory field (for display only, not part of the form) */}
              <div className="mt-6">
                <FormItem>
                  <FormLabel>Site URL</FormLabel>
                  <div className="flex items-center">
                    <div className="rounded-l-md border border-r-0 border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                      blogstack.io/
                    </div>
                    <Input
                      value={site.subdirectory}
                      disabled
                      className="rounded-l-none bg-muted/50 font-medium text-muted-foreground"
                    />
                  </div>
                  <FormDescription>Your site's URL cannot be changed after creation</FormDescription>
                </FormItem>
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of your site"
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Describe what your site is about (supports markdown)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <SimpleIcon name="mail" size={20} className="text-muted-foreground" />
            <h3 className="text-lg font-medium">Contact Information</h3>
          </div>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Public contact email (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <SimpleIcon name="link" size={20} className="text-muted-foreground" />
            <h3 className="text-lg font-medium">Social Links</h3>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/yourusername" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/yourusername"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourportfolio.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <SimpleIcon name="loader" size={16} className="mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
