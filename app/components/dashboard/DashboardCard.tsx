import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ReactNode } from "react";

export interface DashboardCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt?: Date;
  href: string;
  buttonText: string;
  buttonIcon?: ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  subdirectory?: string;
  priority?: boolean;
  className?: string;
}

export function DashboardCard({
  id,
  title,
  description,
  imageUrl,
  createdAt,
  href,
  buttonText,
  buttonIcon,
  badge,
  subdirectory,
  priority = false,
  className = "",
}: DashboardCardProps) {
  return (
    <Card className={`overflow-hidden flex flex-col h-full transition-all hover:shadow-md ${className}`}>
      <div className="relative w-full h-[160px]">
        <Image
          src={imageUrl}
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
        {badge && (
          <div className="absolute inset-0  from-black/60 to-transparent">
            <div className="absolute bottom-3 left-3">
              <Badge 
                variant={badge.variant || "secondary"} 
                className={badge.variant === undefined ? "bg-black/50 text-white border-none" : ""}
              >
                {badge.text}
              </Badge>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="truncate text-lg">{title}</CardTitle>
        {subdirectory && (
          <div className="flex items-center text-xs text-muted-foreground">
            <SimpleIcon name="globe" size={12} className="mr-1" />
            <span className="font-mono">blogstack.io/{subdirectory}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        {description && (
          <CardDescription className="line-clamp-2 text-sm">
            {description}
          </CardDescription>
        )}
        {createdAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Button asChild variant="default" className="w-full" size="sm">
          <Link href={href} className="flex items-center justify-center gap-2">
            {buttonIcon}
            <span>{buttonText}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 