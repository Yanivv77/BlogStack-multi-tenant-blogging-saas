import type { ReactNode } from "react";

import { EmptyState } from "./EmptyState";

interface DashboardGridProps {
  children: ReactNode;
  emptyState?: {
    title: string;
    description: string;
    buttonText: string;
    href: string;
  };
  isEmpty?: boolean;
  className?: string;
}

export function DashboardGrid({ children, emptyState, isEmpty = false, className = "" }: DashboardGridProps) {
  if (isEmpty && emptyState) {
    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        buttonText={emptyState.buttonText}
        href={emptyState.href}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-2">
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>{children}</div>
    </div>
  );
}
