"use client";

import { DeleteSiteClient } from "./DeleteSiteClient";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type DeleteBlogTabProps = {
  siteId: string;
  siteName: string;
};

export function DeleteBlogTab({ siteId, siteName }: DeleteBlogTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Delete Blog</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your blog and all its content
        </p>
      </div>
      
      <Card className="border-red-500 bg-red-500/10">
        <CardContent className="pt-6 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-500">Warning</h4>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete your blog and all of its content.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <DeleteSiteClient siteId={siteId} siteName={siteName} />
    </div>
  );
} 