import { redirect } from "next/navigation";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { DashboardCard } from "@/app/components/dashboard/DashboardCard";
import { DashboardGrid } from "@/app/components/dashboard/DashboardGrid";
import { SectionHeader } from "@/app/components/dashboard/SectionHeader";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import prisma from "@/app/utils/db/prisma";

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
          icon: <SimpleIcon name="pluscircle" size={16} />,
        }}
      />

      <DashboardGrid
        isEmpty={isEmpty}
        emptyState={{
          title: "No sites created yet",
          description: "Create your first blog site to start publishing content and sharing your ideas with the world.",
          buttonText: "Create Your First Site",
          href: "/dashboard/sites/new",
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
            buttonIcon={<SimpleIcon name="file" size={16} />}
            badge={{
              text: (() => {
                if (site.language === "LTR") return "Left to Right";
                if (site.language === "RTL") return "Right to Left";
                return site.language || "LTR";
              })(),
            }}
            subdirectory={site.subdirectory}
            priority={index === 0}
          />
        ))}
      </DashboardGrid>
    </div>
  );
}
