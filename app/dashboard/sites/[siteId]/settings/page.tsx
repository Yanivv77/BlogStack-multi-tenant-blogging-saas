import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Separator } from "@/components/ui/separator";

import { SettingsTabs } from "@/app/components/dashboard/sites";
import { requireUser } from "@/app/utils/auth/user";
import prisma from "@/app/utils/db/prisma";

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

  // Fetch the site with all fields needed for the form
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: user.id, // Ensure the site belongs to the user
    },
    select: {
      id: true,
      name: true,
      description: true,
      subdirectory: true,
      language: true,
      email: true,
      githubUrl: true,
      linkedinUrl: true,
      portfolioUrl: true,
      siteImageCover: true,
      logoImage: true,
      customDomain: true,
      domainVerified: true,
    },
  });

  // If site not found or doesn't belong to the user, show 404
  if (!site) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl py-6">
      {/* Header with breadcrumb navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/sites/${siteId}`}>
              <SimpleIcon name="chevronleft" size={16} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your site "{site.name}" settings and preferences</p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Settings tabs */}
      <SettingsTabs site={site} />
    </div>
  );
}
