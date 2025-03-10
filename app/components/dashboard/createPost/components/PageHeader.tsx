import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Create Article</h1>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onResetForm}
        >
          New Article
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={onSaveDraft}
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
} 