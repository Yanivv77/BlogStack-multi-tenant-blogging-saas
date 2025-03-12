import { requireUser } from "../utils/auth/user";
import { DEFAULT_IMAGE_URL } from "../utils/constants/images";
import { DashboardCard } from "../components/dashboard/DashboardCard";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";
import { SectionHeader } from "../components/dashboard/SectionHeader";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import prisma from "../utils/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getData(userId: string) {
  const [sites, articles] = await Promise.all([
    prisma.site.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
    prisma.post.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        Site: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  return { sites, articles };
}

export default async function DashboardIndexPage() {
  const user = await requireUser();
  const { articles, sites } = await getData(user.id);
  
  return (
    <div className="space-y-10">
      <section>
        <SectionHeader
          title="Your Sites"
          action={{
            href: "/dashboard/sites/new",
            text: "Create Site",
            icon: <SimpleIcon name="pluscircle" size={16} />
          }}
        />
        
        <DashboardGrid
          isEmpty={sites.length === 0}
          emptyState={{
            title: "You don't have any sites created",
            description: "You currently don't have any Sites. Please create some so that you can see them right here.",
            href: "/dashboard/sites/new",
            buttonText: "Create Site"
          }}
        >
          {sites.map((site, index) => (
            <DashboardCard
              key={site.id}
              id={site.id}
              title={site.name}
              description={site.description || ""}
              imageUrl={site.siteImageCover || DEFAULT_IMAGE_URL}
              href={`/dashboard/sites/${site.id}`}
              buttonText="View Articles"
              buttonIcon={<SimpleIcon name="file" size={16} />}
              priority={index === 0}
              subdirectory={site.subdirectory}
            />
          ))}
        </DashboardGrid>
        
        {sites.length > 0 && (
          <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto mt-4 text-right">
            <Button variant="outline" asChild size="sm">
              <Link href="/dashboard/sites">View All Sites</Link>
            </Button>
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Recent Articles"
        />
        
        <DashboardGrid
          isEmpty={articles.length === 0}
          emptyState={{
            title: "You don't have any articles created",
            description: "You currently don't have any articles created. Please create some so that you can see them right here.",
            buttonText: "Create Article",
            href: "/dashboard/sites"
          }}
        >
          {articles.map((article, index) => (
            <DashboardCard
              key={article.id}
              id={article.id}
              title={article.title}
              description={article.smallDescription || ""}
              imageUrl={article.postCoverImage || DEFAULT_IMAGE_URL}
              href={`/dashboard/sites/${article.siteId}/${article.id}`}
              buttonText="Edit Article"
              buttonIcon={<SimpleIcon name="edit" size={16} />}
              priority={index === 0}
              createdAt={article.createdAt}
            />
          ))}
        </DashboardGrid>
      </section>
    </div>
  );
}