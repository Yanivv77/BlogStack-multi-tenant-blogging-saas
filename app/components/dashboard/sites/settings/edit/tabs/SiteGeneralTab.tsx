"use client";

import type { GeneralTabProps } from "@/app/components/dashboard/sites/utils/types";

import { SiteEditForm } from "../components/SiteEditForm";

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
