import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

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

export function SectionHeader({ title, description, action, className = "" }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
      <div
        className={`mb-6 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center ${className}`}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
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
