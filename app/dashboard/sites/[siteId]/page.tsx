// This file will remain a server component

import { EmptyState } from "@/app/components/dashboard/EmptyState";
import prisma from "@/app/utils/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  Book,
  FileIcon,
  MoreHorizontal,
  PlusCircle,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from 'react';
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants";
import { DraftButtons } from "@/app/components/dashboard/DraftButtons";

// Keep all database fetching and server-side code here
async function getData(userId: string, siteId: string) {
  /* const data = await prisma.post.findMany({
    where: {
      id: siteId,
      userId: userId,
    },
    select: {
      image: true,
      title: true,
      createdAt: true,
      id: true,
      Site: {
        select: {
          subdirectory: true,
        },
      },
    },
  }); */

  const data = await prisma.site.findUnique({
    where: {
      id: siteId,
      userId: userId,
    },
    include: {
      posts: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          postCoverImage: true,
        },
      },
    },
  });

  return {
    posts: data?.posts || [],
    subdirectory: data?.subdirectory || "",
  };
}

export default async function SiteIdRoute(props: {
  params: { siteId: string }
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  // Await the params object before accessing its properties
  const params = await props.params;
  const siteId = params.siteId;

  const data = await getData(user.id, siteId);

  return (
    <>
      <div className="flex w-full justify-end gap-x-4">
        <Button asChild variant="secondary">
          <Link href={`/blog/${data?.subdirectory}`}>
            <Book className="size-4 mr-2" />
            View Blog
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/dashboard/sites/${siteId}/settings`}>
            <Settings className="size-4 mr-2" />
            Settings
          </Link>
        </Button>
        {/* Use the client component for draft-aware buttons */}
        <DraftButtons siteId={siteId} />
      </div>

      {data?.posts === undefined || data.posts.length === 0 ? (
        <div className="flex h-[50vh] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">
              You dont have any Articles created
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You currently dont have any articles. please create some so that you can see them right here
            </p>
            {/* Use the client component for draft-aware buttons */}
            <DraftButtons siteId={siteId} />
          </div>
        </div>
      ) : (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
              <CardDescription>
                Manage your Articles in a simple and intuitive interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.posts?.map((post: {
                    id: string;
                    title: string;
                    createdAt: Date;
                    postCoverImage: string | null;
                  }) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="relative w-12 h-12">
                          <Image
                            fill
                            src={post.postCoverImage || DEFAULT_IMAGE_URL}
                            alt="Cover Image"
                            className="rounded-md object-cover"
                            sizes="48px"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>
                        <Badge>Published</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-4 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              Article Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/sites/${siteId}/${post.id}`}
                              >
                                Edit Article
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              
                              className="text-red-600"
                            >
                               <Link
                                href={`/dashboard/sites/${params.siteId}/${post.id}/delete`}
                              >
                                Delete
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}