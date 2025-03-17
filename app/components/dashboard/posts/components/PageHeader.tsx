import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

interface PageHeaderProps {
  siteId: string;
  onResetForm: () => void;
  onSaveDraft: () => void;
}

export function PageHeader({ siteId, onResetForm, onSaveDraft }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button asChild size="icon" variant="outline" className="mr-3">
          <Link href={`/dashboard/sites/${siteId}`}>
            <SimpleIcon name="arrowleft" size={16} />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Create Article</h1>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onResetForm}>
          New Article
        </Button>
        <Button size="sm" variant="secondary" onClick={onSaveDraft}>
          Save Draft
        </Button>
      </div>
    </div>
  );
}
