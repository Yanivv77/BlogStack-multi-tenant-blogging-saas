import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { JSONContent } from "novel";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { RenderArticle } from "@/app/components/blog/post/RenderArticle";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import prisma from "@/app/utils/db/prisma";

// Keep all database fetching and server-side code here
async function getData(slug: string, siteName: string) {
  try {
    const data = await prisma.post.findUnique({
      where: {
        slug: slug,
      },
      select: {
        articleContent: true,
        title: true,
        smallDescription: true,
        contentImages: true,
        postCoverImage: true,
        createdAt: true,
      },
    });

    if (!data) {
      console.error(`Article not found: ${slug}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching article data: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

export default async function SlugRoute({ params }: { params: { slug: string; name: string } }) {
  try {
    const { slug, name } = params;

    // Validate required parameters
    if (!slug || !name) {
      console.error("Missing required URL parameters");
      return notFound();
    }

    const data = await getData(slug, name);

    if (!data) {
      return notFound();
    }

    return (
      <>
        <div className="flex items-center gap-x-3 pb-5 pt-10">
          <Button size="icon" variant="outline" asChild>
            <Link href={`/blog/${name}`}>
              <SimpleIcon name="arrowleft" size={16} />
            </Link>
          </Button>
          <h1 className="text-xl font-medium">Go Back</h1>
        </div>

        <div className="mb-10 flex flex-col items-center justify-center">
          <div className="m-auto w-full text-center md:w-7/12">
            <p className="m-auto my-5 w-10/12 text-sm font-light text-muted-foreground md:text-base">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
              }).format(data.createdAt)}
            </p>
            <h1 className="mb-5 text-3xl font-bold tracking-tight md:text-6xl">{data.title}</h1>
            <p className="m-auto line-clamp-3 w-10/12 text-muted-foreground">{data.smallDescription}</p>
          </div>
        </div>

        <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-[450px] md:w-5/6 md:rounded-2xl lg:w-2/3">
          <Image
            src={data.postCoverImage || DEFAULT_IMAGE_URL}
            alt={data.title}
            width={1200}
            height={630}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <RenderArticle json={data.articleContent as JSONContent} />
      </>
    );
  } catch (error) {
    console.error(`Unexpected error in SlugRoute: ${error instanceof Error ? error.message : "Unknown error"}`);

    // Return a user-friendly error page
    return (
      <div className="space-y-8">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/blog" className="flex items-center transition-colors hover:text-foreground">
            <SimpleIcon name="arrowleft" size={14} className="mr-1" />
            <span>Back to blogs</span>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <SimpleIcon name="alerttriangle" size={32} className="text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Article Not Found</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            We couldn't find the article you're looking for. It may have been deleted or moved.
          </p>
          <Button asChild>
            <Link href="/blog">Return to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }
}
