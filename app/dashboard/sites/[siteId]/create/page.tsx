"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

// Define the props type to match the ArticleFormContainer component
type AppRouterInstance = ReturnType<typeof useRouter>;

interface ArticleFormContainerProps {
  siteId: string;
  router: AppRouterInstance;
  isNewFromUrl: boolean;
  initialStep?: number;
}

// Lazy load the heavy component with proper typing
const ArticleFormContainer = dynamic<ArticleFormContainerProps>(
  () =>
    import("@/app/components/dashboard/posts/components/ArticleFormContainer").then((mod) => mod.ArticleFormContainer),
  {
    loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-muted/30" />,
    ssr: false, // Disable server-side rendering since it contains client components
  }
);

export default function ArticleCreationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const isNewParam = searchParams.get("new") === "true";
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <ArticleFormContainer siteId={siteId} router={router} isNewFromUrl={isNewParam} initialStep={initialStep} />
    </div>
  );
}
