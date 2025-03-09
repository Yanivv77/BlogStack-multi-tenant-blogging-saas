"use client";

import { useActionState } from "react";
import { CreateSiteAction } from "@/app/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { SiteCreationSchema } from "@/app/utils/zodSchemas";
import { useState } from "react";
import { toast } from "sonner";
import { UploadDropzone } from "@/app/utils/UploadthingComponents";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { Button } from "@/components/ui/button";
import { X, Github, Linkedin, Globe, ArrowRight, CheckCircle2, Image as ImageIcon, Briefcase, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function NewSiteRoute() {
  const [lastResult, action] = useActionState(CreateSiteAction, undefined);
  const [siteImageCover, setSiteImageCover] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basics");
  
  const [form, fields] = useForm({
    id: "create-site-form",
    lastResult,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteCreationSchema() });
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const goToNextTab = () => {
    if (activeTab === "basics") setActiveTab("branding");
    else if (activeTab === "branding") setActiveTab("social");
  };

  const goToPrevTab = () => {
    if (activeTab === "social") setActiveTab("branding");
    else if (activeTab === "branding") setActiveTab("basics");
  };

  return (
    <div className="container max-w-3xl py-10 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your Site</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Set up your professional blog in just a few simple steps
        </p>
      </div>

      <Card className="border shadow-sm overflow-hidden bg-card">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-muted/10 border-b px-8 pt-8 pb-6">
            <div className="relative max-w-md mx-auto">
              <div className="flex justify-between mb-6">
                {["basics", "branding", "social"].map((step) => (
                  <div key={`label-${step}`} className="text-center">
                    <span className={`text-xs font-medium capitalize ${
                      activeTab === step ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-muted-foreground/10 -translate-y-1/2" />
                
                <div 
                  className={`absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 transition-all duration-500 ${
                    activeTab === "basics" ? "w-[0%]" : 
                    activeTab === "branding" ? "w-[50%]" : 
                    "w-[100%]"
                  }`} 
                />
                
                {["basics", "branding", "social"].map((step, index) => (
                  <div key={`indicator-${step}`} className="relative z-10">
                    <button 
                      onClick={() => handleTabChange(step)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        activeTab === step 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : index < ["basics", "branding", "social"].indexOf(activeTab)
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-background text-muted-foreground border border-muted"
                      }`}
                      aria-label={`Go to ${step} step`}
                    >
                      <span className="text-sm font-medium">{index + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form id={form.id} onSubmit={form.onSubmit} action={action}>
            <TabsContent value="basics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Basic Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Let's start with the essential details of your site
                    </p>
                  </div>

                  {/* Site Name */}
                  <div className="space-y-2">
                    <Label htmlFor={fields.name.id} className="text-base">
                      Site Name
                    </Label>
                    <Input
                      id={fields.name.id}
                      name={fields.name.name}
                      placeholder="My Awesome Blog"
                      className="h-11"
                      required
                    />
                    <div className="text-[0.8rem] text-muted-foreground">
                      Choose a memorable name for your site
                    </div>
                    {fields.name.errors && (
                      <div className="text-destructive text-sm">
                        {fields.name.errors}
                      </div>
                    )}
                  </div>

                  {/* Subdirectory */}
                  <div className="space-y-2">
                    <Label htmlFor={fields.subdirectory.id} className="text-base">
                      Subdirectory
                    </Label>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-muted-foreground">
                        blogstack.io/
                      </span>
                      <Input
                        id={fields.subdirectory.id}
                        name={fields.subdirectory.name}
                        placeholder="your-site"
                        className="h-11 rounded-l-none"
                        required
                      />
                    </div>
                    <div className="text-[0.8rem] text-muted-foreground">
                      This will be your site's URL (only letters, numbers, and hyphens)
                    </div>
                    {fields.subdirectory.errors && (
                      <div className="text-destructive text-sm">
                        {fields.subdirectory.errors}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor={fields.description.id} className="text-base">
                      Description
                    </Label>
                    <Textarea
                      id={fields.description.id}
                      name={fields.description.name}
                      placeholder="Tell readers what your site is about..."
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <div className="text-[0.8rem] text-muted-foreground">
                      A brief description that will appear in search results and site previews
                    </div>
                    {fields.description.errors && (
                      <div className="text-destructive text-sm">
                        {fields.description.errors}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pb-8 px-6 sm:px-8 pt-2">
                <Button type="button" onClick={goToNextTab} className="gap-2 px-6">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </TabsContent>

            <TabsContent value="branding" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Visual Branding
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Add visual elements to make your site stand out
                    </p>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                    <Label className="text-base">Site Cover Image</Label>
                    <div className="flex flex-col items-center gap-4">
                      {siteImageCover ? (
                        <div className="relative w-full max-w-[500px]">
                          <img
                            src={siteImageCover}
                            alt="Cover"
                            className="w-full h-auto rounded-md object-cover aspect-video"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setSiteImageCover("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center w-full">
                          <UploadDropzone
                            endpoint="imageUploader"
                            onClientUploadComplete={(res: any) => {
                              const imageUrl = res[0].ufsUrl;
                              setSiteImageCover(imageUrl);
                              toast.success("Cover image uploaded successfully!");
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`ERROR! ${error.message}`);
                            }}
                            config={{ mode: "auto" }}
                            appearance={{
                              button: "hidden",
                              allowedContent: "hidden",
                              container: "border-dashed border-2 border-muted-foreground rounded-md p-8 w-full max-w-[500px] aspect-video flex flex-col items-center justify-center"
                            }}
                          />
                        </div>
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
                    <div className="text-[0.8rem] text-muted-foreground">
                      This image will appear at the top of your site and in shared links
                    </div>
                  </div>

                  {/* Logo Image */}
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                    <Label className="text-base">Profile / Logo Image</Label>
                    <div className="flex flex-col items-center gap-4">
                      {logoImage ? (
                        <div className="relative w-full max-w-[200px]">
                          <img
                            src={logoImage}
                            alt="Logo"
                            className="w-full h-auto rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setLogoImage("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <UploadDropzone
                            endpoint="imageUploader"
                            onClientUploadComplete={(res: any) => {
                              const imageUrl = res[0].ufsUrl;
                              setLogoImage(imageUrl);
                              toast.success("Image uploaded successfully!");
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`ERROR! ${error.message}`);
                            }}
                            config={{ mode: "auto" }}
                            appearance={{
                              button: "hidden",
                              allowedContent: "hidden",
                              container: "border-dashed border-2 border-muted-foreground rounded-md p-6 w-full max-w-[270px] h-[200px] flex flex-col items-center justify-center"
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Hidden input to store the logo URL */}
                    {logoImage && (
                      <input
                        type="hidden"
                        name="logoImage"
                        value={logoImage}
                      />
                    )}
                    <div className="text-[0.8rem] text-muted-foreground">
                      Upload your profile image or logo (optional)
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  Back
                </Button>
                <Button type="button" onClick={goToNextTab} className="gap-2 px-6">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </TabsContent>

            <TabsContent value="social" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Social Media Links
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Connect your social profiles to grow your audience (all fields optional)
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-1">
                    {/* GitHub URL */}
                    <div className="space-y-2">
                      <Label htmlFor={fields.githubUrl.id} className="text-base">
                        <div className="flex items-center gap-2">
                          <Github className="h-5 w-5" />
                          GitHub URL
                        </div>
                      </Label>
                      <Input
                        id={fields.githubUrl.id}
                        name={fields.githubUrl.name}
                        placeholder="https://github.com/yourusername"
                        className="h-11"
                      />
                      {fields.githubUrl.errors && (
                        <div className="text-destructive text-sm">
                          {fields.githubUrl.errors}
                        </div>
                      )}
                    </div>

                    {/* LinkedIn URL */}
                    <div className="space-y-2">
                      <Label htmlFor={fields.linkedinUrl.id} className="text-base">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-5 w-5" />
                          LinkedIn URL
                        </div>
                      </Label>
                      <Input
                        id={fields.linkedinUrl.id}
                        name={fields.linkedinUrl.name}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="h-11"
                      />
                      {fields.linkedinUrl.errors && (
                        <div className="text-destructive text-sm">
                          {fields.linkedinUrl.errors}
                        </div>
                      )}
                    </div>

                    {/* Portfolio URL */}
                    <div className="space-y-2">
                      <Label htmlFor={fields.portfolioUrl.id} className="text-base">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Portfolio URL
                        </div>
                      </Label>
                      <Input
                        id={fields.portfolioUrl.id}
                        name={fields.portfolioUrl.name}
                        placeholder="https://yourportfolio.com"
                        className="h-11"
                      />
                      {fields.portfolioUrl.errors && (
                        <div className="text-destructive text-sm">
                          {fields.portfolioUrl.errors}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pb-8 px-6 sm:px-8 pt-2">
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  Back
                </Button>
                <SubmitButton text="Create Site" />
              </CardFooter>
            </TabsContent>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}