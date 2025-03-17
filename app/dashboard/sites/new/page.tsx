import { NewSiteForm } from "@/app/components/dashboard/sites/creation/NewSiteForm";

export default function NewSiteRoute() {
  return (
    <div className="container max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Create Your Blog</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Set up your professional blog in just a few simple steps
        </p>
      </header>

      <NewSiteForm />
    </div>
  );
}
