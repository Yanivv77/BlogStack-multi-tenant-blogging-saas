import { redirect } from "next/navigation";

/**
 * Delete page that redirects to the article delete page
 * This handles the route /dashboard/sites/[siteId]/editor/[postId]/delete
 * and redirects to /dashboard/sites/[siteId]/[articleId]/delete
 */
export default function DeletePage({ params }: { params: { siteId: string; postId: string } }) {
  // Redirect to the article delete page
  redirect(`/dashboard/sites/${params.siteId}/${params.postId}/delete`);
}
