import prisma from "@/app/utils/db/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { FileIcon, PlusCircle, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/app/components/dashboard/EmptyState";
import { DEFAULT_IMAGE_URL } from "@/app/utils/constants/images";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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
  const data = await getData(user.id);
  
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Sites</h1>
          <p className="text-muted-foreground mt-1">
            Manage and create new blog sites
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/sites/new" className="flex items-center gap-2">
            <PlusCircle className="size-4" />
            <span>Create New Site</span>
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="py-4">
        {data === undefined || data.length === 0 ? (
          <EmptyState
            title="No sites created yet"
            description="Create your first blog site to start publishing content and sharing your ideas with the world."
            buttonText="Create Your First Site"
            href="/dashboard/sites/new"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((site) => (
              <Card key={site.id} className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
                <div className="relative w-full h-[180px]">
                  <Image
                    src={site.siteImageCover || DEFAULT_IMAGE_URL}
                    alt={site.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={site.id === data[0].id}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 text-white border-none">
                      {site.language || "English"}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="truncate">{site.name}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Globe className="mr-1 size-3" />
                    <span className="font-mono">blogstack.io/{site.subdirectory}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2 flex-grow">
                  <CardDescription className="line-clamp-2">
                    {site.description}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}
                  </p>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/dashboard/sites/${site.id}`} className="flex items-center justify-center gap-2">
                      <FileIcon className="size-4" />
                      <span>Manage Articles</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}