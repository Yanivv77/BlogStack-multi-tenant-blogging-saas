"use client";

import { SiteEditForm } from "../components/SiteEditForm";
import { GeneralTabProps } from "@/app/components/dashboard/sites/utils/types";

/**
 * Tab component for general site settings
 */
export function SiteGeneralTab({ site }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <SiteEditForm site={site} />
    </div>
  );
} 