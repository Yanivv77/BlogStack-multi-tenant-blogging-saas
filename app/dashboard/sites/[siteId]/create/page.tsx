"use client";

import { ArticleFormContainer } from '@/app/components/dashboard/createPost/components/ArticleFormContainer';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function ArticleCreationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const isNewParam = searchParams.get('new') === 'true';
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <ArticleFormContainer 
        siteId={siteId}
        router={router}
        isNewFromUrl={isNewParam}
        initialStep={initialStep}
      />
    </div>
  );
}