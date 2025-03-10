import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    href: string;
    text: string;
    icon?: ReactNode;
  };
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  action,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-6 ${className}`}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {action && (
          <Button asChild className="w-full sm:w-auto" size="sm">
            <Link href={action.href} className="flex items-center gap-2">
              {action.icon}
              <span>{action.text}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 