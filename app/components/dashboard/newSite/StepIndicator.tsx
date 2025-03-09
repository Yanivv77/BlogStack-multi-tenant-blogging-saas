"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";

interface StepIndicatorProps {
  steps: string[];
  activeIndex: number;
  handleTabChange: (value: string) => void;
}

export const StepIndicator = memo(function StepIndicator({ 
  steps, 
  activeIndex, 
  handleTabChange 
}: StepIndicatorProps) {
  return (
    <div className="bg-background border-b px-8 pt-8 pb-6">
      <div className="max-w-md mx-auto">
        {/* Step Indicators with Progress Bar */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            // Determine status of this step
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            const isFuture = index > activeIndex;
            
            return (
              <div key={step} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="relative">
                  <button
                    onClick={() => {
                      // Only allow going back or to current step directly
                      // Future steps require validation via Next button
                      if (!isFuture) {
                        handleTabChange(step);
                      }
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary/20 text-primary",
                      !isActive && !isCompleted && "border-muted-foreground/30 bg-background text-muted-foreground",
                      isFuture && "cursor-not-allowed opacity-70"
                    )}
                    aria-label={`Go to ${step} step`}
                    disabled={isFuture}
                  >
                    <span className="text-sm font-medium">{index + 1}</span>
                  </button>
                </div>
                
                {/* Step Label */}
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium capitalize",
                    isActive && "text-primary font-semibold",
                    !isActive && "text-muted-foreground",
                    isFuture && "opacity-70"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
          
          {/* Progress Bar */}
          <div className="absolute left-0 right-0 flex justify-center">
            <div className="w-full max-w-[240px] h-[2px] bg-muted-foreground/30 -mt-5 mx-auto">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}); 