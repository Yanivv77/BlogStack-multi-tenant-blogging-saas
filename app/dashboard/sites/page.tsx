import prisma from "@/app/utils/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { FileIcon, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import { DashboardCard } from "@/app/components/dashboard/DashboardCard";
import { DashboardGrid } from "@/app/components/dashboard/DashboardGrid";
import { SectionHeader } from "@/app/components/dashboard/SectionHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getData(userId: string) {
  const data = await prisma.site.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export default async function SitesRoute() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }
  
  const sites = await getData(user.id);
  const isEmpty = sites.length === 0;
  
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Your Sites"
        description="Manage and create new blog sites"
        action={{
          href: "/dashboard/sites/new",
          text: "Create New Site",
          icon: <PlusCircle className="size-4" />
        }}
      />

      <DashboardGrid
        isEmpty={isEmpty}
        emptyState={{
          title: "No sites created yet",
          description: "Create your first blog site to start publishing content and sharing your ideas with the world.",
          buttonText: "Create Your First Site",
          href: "/dashboard/sites/new"
        }}
      >
        {sites.map((site, index) => (
          <DashboardCard
            key={site.id}
            id={site.id}
            title={site.name}
            description={site.description || ""}
            imageUrl={site.siteImageCover || DEFAULT_IMAGE_URL}
            createdAt={site.createdAt}
            href={`/dashboard/sites/${site.id}`}
            buttonText="Manage Articles"
            buttonIcon={<FileIcon className="size-4" />}
            badge={{ text: site.language || "English" }}
            subdirectory={site.subdirectory}
            priority={index === 0}
          />
        ))}
      </DashboardGrid>
    </div>
  );
}