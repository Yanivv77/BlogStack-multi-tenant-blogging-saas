"use client";

import { DeletePost } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the props type
type DeleteFormProps = {
  siteId: string;
  articleId: string;
  articleTitle: string;
};

// Client component for the delete form
export function DeleteFormClient({
  siteId,
  articleId,
  articleTitle,
}: DeleteFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");

  const handleDelete = async (formData: FormData) => {
    // Check if the confirmation title matches
    if (confirmTitle !== articleTitle) {
      toast.error("Article title doesn't match. Please enter the exact title to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await DeletePost(formData);
      
      // Check if result is a redirect (original behavior)
      if (result && typeof result === 'object' && 'status' in result) {
        if (result.status === "success") {
          toast.success("Article deleted successfully");
          router.push(`/dashboard/sites/${siteId}`);
        } else if (result.status === "error" && Array.isArray(result.errors)) {
          result.errors.forEach(error => toast.error(error));
        }
      } else {
        // If it's not a status object, assume success (original redirect behavior)
        toast.success("Article deleted successfully");
        router.push(`/dashboard/sites/${siteId}`);
      }
    } catch (error) {
      toast.error("Failed to delete article");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Are you absolutely sure?</CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete the article 
            "<span className="font-semibold">{articleTitle}</span>" and
            remove all data from our server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-title">
                Please type <span className="font-semibold">{articleTitle}</span> to confirm
              </Label>
              <Input
                id="confirm-title"
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
                placeholder="Enter article title to confirm"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="w-full flex justify-between">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/sites/${siteId}`}>Cancel</Link>
          </Button>
          <form action={handleDelete}>
            <input type="hidden" name="articleId" value={articleId} />
            <input type="hidden" name="siteId" value={siteId} />
            <Button 
              type="submit"
              variant="destructive" 
              disabled={confirmTitle !== articleTitle || isDeleting}
              className="flex items-center"
            >
              {isDeleting ? "Deleting..." : "Delete Article"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
} 