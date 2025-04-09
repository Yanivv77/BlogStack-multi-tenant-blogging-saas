import { redirect } from "next/navigation";

/**
 * Editor page that redirects to the article page
 * This handles the route /dashboard/sites/[siteId]/editor/[postId]
 * and redirects to /dashboard/sites/[siteId]/[articleId]
 */
export default async function EditorPage({
  params,
}: {
  params: { siteId: string; postId: string } | Promise<{ siteId: string; postId: string }>;
}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  // Redirect to the article page
  redirect(`/dashboard/sites/${resolvedParams.siteId}/${resolvedParams.postId}`);
}
