import Link from "next/link";
import { redirect } from "next/navigation";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { EditArticleForm } from "@/app/components/dashboard/posts/components/EditArticleForm";
import prisma from "@/app/utils/db/prisma";

async function getData(articleId: string, userId: string, siteId: string) {
  // First verify site ownership
  const site = await prisma.site.findUnique({
    where: {
      id: siteId,
      userId: userId,
    },
  });

  if (!site) {
    throw new Error("Site not found or you don't have permission to access it");
  }

  // Then fetch article data
  const article = await prisma.post.findUnique({
    where: {
      id: articleId,
      siteId: siteId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      articleContent: true,
      contentImages: true,
      postCoverImage: true,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  // Process data to ensure correct types for the form component
  return {
    id: article.id,
    title: article.title || "",
    slug: article.slug || "",
    smallDescription: article.smallDescription || "",
    // For article content, which could be JSON, ensure it's in the right format
    articleContent: article.articleContent || {},
    // Handle contentImages - must be a string array or undefined
    contentImages: Array.isArray(article.contentImages) ? article.contentImages.map((item) => String(item)) : [],
    postCoverImage: article.postCoverImage || "",
  };
}

export default async function EditArticlePage({
  params,
}: {
  params: { siteId: string; articleId: string } | Promise<{ siteId: string; articleId: string }>;
}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const { siteId, articleId } = resolvedParams;

  // Get user session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    return redirect("/api/auth/login");
  }

  // Get article data
  try {
    const data = await getData(articleId, user.id, siteId);

    return (
      <div className="space-y-5">
        <div className="flex items-center">
          <Button asChild size="icon" variant="outline" className="mr-3">
            <Link href={`/dashboard/sites/${siteId}`}>
              <SimpleIcon name="arrowleft" size={16} />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Edit Article</h1>
        </div>

        <EditArticleForm data={data} siteId={siteId} />
      </div>
    );
  } catch (error) {
    // Handle error
    console.error("Error fetching article:", error);
    return (
      <div className="space-y-5">
        <div className="flex items-center">
          <Button asChild size="icon" variant="outline" className="mr-3">
            <Link href={`/dashboard/sites/${siteId}`}>
              <SimpleIcon name="arrowleft" size={16} />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Error</h1>
        </div>

        <div className="p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">Article not found</h2>
          <p className="mb-4 text-muted-foreground">
            The article you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <Button asChild>
            <Link href={`/dashboard/sites/${siteId}`}>Back to site</Link>
          </Button>
        </div>
      </div>
    );
  }
}
