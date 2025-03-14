import { NewSiteForm } from "@/app/components/dashboard/newSite";

export default function NewSiteRoute() {
  return (
    <div className="container max-w-5xl py-10 px-4 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your Blog</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Set up your professional blog in just a few simple steps
        </p>
      </header>
      
      <NewSiteForm />
    </div>
  );
}