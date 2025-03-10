import prisma from "@/app/utils/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { FileIcon, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import { DashboardCard } from "@/app/components/dashboard/DashboardCard";
import { DashboardGrid } from "@/app/components/dashboard/DashboardGrid";
import { SectionHeader } from "@/app/components/dashboard/SectionHeader";


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

// Function to fetch all posts across all user sites
async function getAllUserPosts(userId: string) {
  const data = await prisma.post.findMany({
    where: {
      Site: {
        userId: userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      postCoverImage: true,
      slug: true,
      createdAt: true,
      views: true,
      likes: true,
      siteId: true,
      Site: {
        select: {
          name: true,
          subdirectory: true,
        },
      },
    },
  });

  return data;
}

// Function to fetch posts for a specific site
async function getSitePosts(siteId: string, userId: string) {
  const data = await prisma.post.findMany({
    where: {
      siteId: siteId,
      Site: {
        userId: userId, // Security check to ensure user owns this site
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      postCoverImage: true,
      slug: true,
      createdAt: true,
      views: true,
      likes: true,
    },
  });

  return data;
}

// Function to fetch a single post with full details
async function getPostDetails(postId: string, userId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      Site: {
        userId: userId, // Security check to ensure user owns the site containing this post
      },
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      articleContent: true,
      postCoverImage: true,
      contentImages: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      likes: true,
      siteId: true,
      Site: {
        select: {
          name: true,
          subdirectory: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("Article not found");
  }

  return post;
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