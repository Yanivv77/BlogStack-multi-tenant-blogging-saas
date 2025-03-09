import prisma from "@/app/utils/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/app/components/dashboard/ThemeToggle";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants";


async function getData(subDir: string) {
  const data = await prisma.site.findUnique({
    where: {
      subdirectory: subDir,
    },
    select: {
      name: true,
      description: true,
      logoImage: true,
      siteImageCover: true,
      language: true,
      email: true,
      githubUrl: true,
      linkedinUrl: true,
      portfolioUrl: true,
      posts: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          smallDescription: true,
          slug: true,
          postCoverImage: true,
          createdAt: true,
          views: true,
          likes: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        // Limit the number of posts to improve initial load time
        take: 12,
      },
    },
  });

  if (!data) {
    return notFound();
  }
  
  return data;
}

// PostCard component for better component-level optimization
function PostCard({ post, blogName }: { 
  post: { 
    id: string; 
    title: string; 
    smallDescription: string; 
    slug: string; 
    postCoverImage: string | null; 
    views: number; 
    likes: number; 
  }; 
  blogName: string;
}) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-[200px] w-full">
        <Image
          src={post.postCoverImage ?? DEFAULT_IMAGE_URL}
          alt={post.title}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="truncate">{post.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {post.smallDescription}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1" title={`${post.views} views`}>
            <SimpleIcon name="eye" size={16} />
            {post.views}
          </span>
          <span className="flex items-center gap-1" title={`${post.likes} likes`}>
            <SimpleIcon name="heart" size={16} />
            {post.likes}
          </span>
        </div>
        <Button asChild size="sm" className="flex gap-1 items-center">
          <Link href={`/blog/${blogName}/${post.slug}`}>
            Read more
            <SimpleIcon name="arrowright" size={16} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function BlogIndexPage({
  params,
}: {
  params: { name: string };
}) {
  const data = await getData(params.name);
  
  // Determine if social links section should be shown
  const hasSocialLinks = Boolean(
    data.email || data.githubUrl || data.linkedinUrl || data.portfolioUrl
  );

  return (
    <div className="container mx-auto px-4 pb-10">
      <nav className="grid grid-cols-3 my-10">
        <div className="col-span-1" />
        <div className="flex items-center gap-x-4 justify-center">
          <Image 
            src={data.logoImage || ""} 
            alt={`${data.name} logo`} 
            width={40} 
            height={40} 
            className="rounded-sm"
            priority
          />
          <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        </div>

        <div className="col-span-1 flex w-full justify-end">
          <ThemeToggle />
        </div>
      </nav>

      {/* Site description section */}
      {data.description && (
        <div className="mb-10 text-center">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.description}</p>
          
          {/* Social links - only show section if at least one social link exists */}
          {hasSocialLinks && (
            <div className="flex justify-center gap-4 mt-4">
              {data.email && (
                <a 
                  href={`mailto:${data.email}`} 
                  aria-label="Contact via Email" 
                  className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-muted"
                >
                  <SimpleIcon name="mail" size={20} />
                </a>
              )}
              {data.githubUrl && (
                <a 
                  href={data.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Visit GitHub Profile" 
                  className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-muted"
                >
                  <SimpleIcon name="github" size={20} />
                </a>
              )}
              {data.linkedinUrl && (
                <a 
                  href={data.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Visit LinkedIn Profile" 
                  className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-muted"
                >
                  <SimpleIcon name="linkedin" size={20} />
                </a>
              )}
              {data.portfolioUrl && (
                <a 
                  href={data.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Visit Portfolio Website" 
                  className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-muted"
                >
                  <SimpleIcon name="globe" size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {data.posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No posts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {data.posts.map((post) => (
            <PostCard key={post.id} post={post} blogName={params.name} />
          ))}
        </div>
      )}
    </div>
  );
}