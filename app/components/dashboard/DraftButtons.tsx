"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

// Constants
const DRAFT_STORAGE_KEY = "article-form-draft";

/**
 * Client component that checks for drafts and renders appropriate buttons
 * This is extracted to its own file to keep it separate from server components
 */
export function DraftButtons({ siteId }: { siteId: string }) {
  const [hasDraft, setHasDraft] = useState(false);

  // Check if a draft exists on component mount
  useEffect(() => {
    try {
      // Get drafts from localStorage
      const draftData = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftData) {
        const draft = JSON.parse(draftData);
        // Check if draft belongs to current site
        if (draft && draft.siteId === siteId) {
          setHasDraft(true);
        }
      }
    } catch (e) {
      console.error("Error checking for drafts:", e);
    }
  }, [siteId]);

  return (
    <div className="flex gap-2">
      {hasDraft && (
        <Button asChild variant="secondary">
          <Link href={`/dashboard/sites/${siteId}/create`}>
            <SimpleIcon name="edit" size={16} className="mr-2" />
            Continue Draft
          </Link>
        </Button>
      )}
      <Button asChild>
        <Link href={`/dashboard/sites/${siteId}/create?new=true`}>
          <SimpleIcon name="plus" size={16} className="mr-2" />
          Create Article
        </Link>
      </Button>
    </div>
  );
}
