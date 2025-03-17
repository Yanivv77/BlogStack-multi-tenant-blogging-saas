"use client";

import type { DangerTabProps } from "@/app/components/dashboard/sites/utils/types";

import { SiteDeleteForm } from "../components/SiteDeleteForm";

/**
 * Tab component for dangerous site operations like deletion
 */
export function SiteDangerTab({ siteId, site }: DangerTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">Destructive actions that cannot be undone</p>
      </div>

      <div className="grid gap-6">
        <SiteDeleteForm siteId={siteId} siteName={site?.siteName || ""} />
      </div>
    </div>
  );
}
