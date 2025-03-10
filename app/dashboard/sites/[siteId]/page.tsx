// This file will remain a server component

import { EmptyState } from "@/app/components/dashboard/EmptyState";
import prisma from "@/app/utils/db/prisma";
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
  ArrowLeft,
  Calendar,
  Globe,
  Edit,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from 'react';
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import { DraftButtons } from "@/app/components/dashboard/DraftButtons";
import { formatDistanceToNow } from "date-fns";

// Keep all database fetching and server-side code here
async function getData(userId: string, siteId: string) {
  try {
    const site = await prisma.site.findUnique({
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
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    if (!site) {
      console.error(`Site not found: ${siteId} for user: ${userId}`);
      return null;
    }

    return {
      site: {
        id: site.id,
        name: site.name,
        subdirectory: site.subdirectory,
        description: site.description,
        siteImageCover: site.siteImageCover,
      },
      posts: site.posts || [],
    };
  } catch (error) {
    console.error(`Error fetching site data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export default async function SiteIdRoute(props: {
  params: { siteId: string } | Promise<{ siteId: string }>
}) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return redirect("/api/auth/login");
    }

    // Await the params object before accessing its properties
    const params = await props.params;
    const siteId = params.siteId;

    // Validate siteId format
    if (!siteId || typeof siteId !== 'string' || siteId.trim() === '') {
      console.error('Invalid siteId provided');
      return redirect("/dashboard/sites");
    }

    const data = await getData(user.id, siteId);
    
    if (!data) {
      console.error(`No data returned for site: ${siteId}`);
      return redirect("/dashboard/sites");
    }

    return (
      <div className="space-y-8">
        {/* Page header with site info */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/dashboard/sites" className="flex items-center hover:text-foreground transition-colors">
              <ArrowLeft className="mr-1 size-3.5" />
              <span>Back to sites</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{data.site.name}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="mr-1.5 size-3.5" />
                <span className="font-mono">blogstack.io/{data.site.subdirectory}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/blog/${data.site.subdirectory}`} className="flex items-center">
                  <Book className="mr-1.5 size-4" />
                  <span>View Blog</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/sites/${siteId}/settings`} className="flex items-center">
                  <Settings className="mr-1.5 size-4" />
                  <span>Site Settings</span>
                </Link>
              </Button>
              <DraftButtons siteId={siteId} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          {data.posts.length === 0 ? (
            <EmptyState
              title="No articles yet"
              description="Start creating content for your blog by adding your first article."
              buttonText="Create New Article"
              href={`/dashboard/sites/${siteId}/create`}
              icon={<FileIcon className="size-10 text-muted-foreground" />}
            />
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Articles ({data.posts.length})</CardTitle>
                    <CardDescription>
                      Manage your published articles
                    </CardDescription>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/sites/${siteId}/create`} className="flex items-center">
                      <PlusCircle className="mr-1.5 size-4" />
                      <span>New Article</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  fill
                                  src={post.postCoverImage || DEFAULT_IMAGE_URL}
                                  alt={post.title}
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                  {post.title}
                                </span>
                                <span className="text-xs text-muted-foreground md:hidden">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs">Published</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/sites/${siteId}/editor/${post.id}`}
                                    className="flex items-center cursor-pointer"
                                  >
                                    <Edit className="mr-2 size-4" />
                                    Edit Article
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/blog/${data.site.subdirectory}/${post.id}`}
                                    className="flex items-center cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Book className="mr-2 size-4" />
                                    View Published
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/sites/${siteId}/editor/${post.id}/delete`}
                                    className="flex items-center cursor-pointer text-destructive"
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Article
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Unexpected error in SiteIdRoute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return a user-friendly error page
    return (
      <div className="space-y-8">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard/sites" className="flex items-center hover:text-foreground transition-colors">
            <ArrowLeft className="mr-1 size-3.5" />
            <span>Back to sites</span>
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <Trash2 className="size-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Site or Article Not Found</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            We couldn't find the site or article you're looking for. It may have been deleted or you might not have permission to access it.
          </p>
          <Button asChild>
            <Link href="/dashboard/sites">Return to Sites</Link>
          </Button>
        </div>
      </div>
    );
  }
}