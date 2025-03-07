import { UploadImageForm } from "@/app/components/dashboard/forms/UploadImageForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { DeleteSiteClient } from "./DeleteSiteClient";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";
import { notFound, redirect } from "next/navigation";

export default async function SettingsSiteRoute({
  params,
}: {
  params: { siteId: string } | Promise<{ siteId: string }>;
}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const { siteId } = resolvedParams;

  // Get the current user
  const user = await requireUser();
  
  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch the site to get its name
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: user.id, // Ensure the site belongs to the user
    },
    select: {
      id: true,
      name: true,
    },
  });

  // If site not found or doesn't belong to the user, show 404
  if (!site) {
    notFound();
  }

  return (
    <>
      <div className="flex items-center gap-x-2">
        <Button variant="outline" size="icon">
          <Link href={`/dashboard/sites/${siteId}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h3 className="text-xl font-semibold">Go back</h3>
      </div>

      <UploadImageForm siteId={siteId} />

      <DeleteSiteClient siteId={siteId} siteName={site.name} />
    </>
  );
}