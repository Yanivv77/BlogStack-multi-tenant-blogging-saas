"use client";

import { UploadImageForm } from "@/app/components/dashboard/forms/UploadImageForm";

type AppearanceTabProps = {
  siteId: string;
};

export function AppearanceTab({ siteId }: AppearanceTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Site Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your site looks to visitors
        </p>
      </div>
      
      <UploadImageForm siteId={siteId} />
    </div>
  );
} 