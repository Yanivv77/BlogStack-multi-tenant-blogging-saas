import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/app/utils/auth/user";
import prisma from "@/app/utils/db/prisma";

import { DeleteFormClient } from "./DeleteFormClient";

// Server component to fetch article data
export default async function DeletePage({
  params,
}: {
  params: { siteId: string; articleId: string } | Promise<{ siteId: string; articleId: string }>;
}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const { siteId, articleId } = resolvedParams;

  const user = await requireUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch the article to get its title
  const article = await prisma.post.findFirst({
    where: {
      id: articleId,
      userId: user.id, // Ensure the article belongs to the user
    },
    select: {
      id: true,
      title: true,
      siteId: true,
    },
  });

  // If article not found or doesn't belong to the user, show 404
  if (!article) {
    notFound();
  }

  // Verify the article belongs to the specified site
  if (article.siteId !== siteId) {
    redirect(`/dashboard/sites/${article.siteId}`);
  }

  return <DeleteFormClient siteId={siteId} articleId={articleId} articleTitle={article.title} />;
}
