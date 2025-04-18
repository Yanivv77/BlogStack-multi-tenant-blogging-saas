"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DeleteSiteProps } from "@/app/components/dashboard/sites/utils/types";
import { DeleteSite } from "@/app/serverActions/site/deleteSite";

/**
 * Form component for site deletion with confirmation
 */
export function SiteDeleteForm({ siteId, siteName }: DeleteSiteProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const handleDelete = async (formData: FormData) => {
    // Check if the confirmation name matches
    if (confirmName !== siteName) {
      toast.error("Site name doesn't match. Please enter the exact name to confirm deletion.");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await DeleteSite(formData);

      if (result.success) {
        toast.success("Site deleted successfully");
        // Redirect to the sites dashboard
        setTimeout(() => {
          router.push("/dashboard/sites");
        }, 1000);
      } else if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Failed to delete site. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-500 bg-red-500/10">
      <CardHeader>
        <CardTitle className="text-red-500">Danger Zone</CardTitle>
        <CardDescription>
          This will permanently delete your site "<span className="font-semibold">{siteName}</span>" and all articles
          associated with it. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-red-500">
              Please type <span className="font-semibold">{siteName}</span> to confirm deletion
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Enter site name to confirm"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <form action={handleDelete}>
          <input type="hidden" name="siteId" value={siteId} />
          <Button
            type="submit"
            variant="destructive"
            disabled={confirmName !== siteName || isDeleting}
            className="flex items-center"
          >
            {isDeleting ? "Deleting..." : "Delete Site and All Content"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
