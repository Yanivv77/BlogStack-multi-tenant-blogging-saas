import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import Link from "next/link";
import { ReactNode } from "react";

interface iAppProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  icon?: ReactNode;
}

export function EmptyState({
  buttonText,
  description,
  href,
  title,
  icon,
}: iAppProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        {icon || <SimpleIcon name="file" size={40} className="text-primary" />}
      </div>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mb-8 mt-2 text-center text-sm leading-tight text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>

      <Button asChild>
        <Link href={href}>
          <SimpleIcon name="plus" size={16} className="mr-2" /> {buttonText}
        </Link>
      </Button>
    </div>
  );
}