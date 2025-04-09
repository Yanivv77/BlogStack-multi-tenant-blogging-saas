"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { cn } from "@/lib/utils";

interface iAppProps {
  text: string;
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
  disabled?: boolean;
}

export function SubmitButton({ text, className, variant, disabled }: iAppProps) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className={cn("w-fit", className)} variant={variant}>
          <SimpleIcon name="loader" size={16} className="mr-2 animate-spin" /> Please Wait
        </Button>
      ) : (
        <Button 
          className={cn("w-fit", className)} 
          variant={variant} 
          type="submit" 
          disabled={disabled}
        >
          {text}
        </Button>
      )}
    </>
  );
}
