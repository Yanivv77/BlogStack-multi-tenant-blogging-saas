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
        {/* Container for steps and progress bar */}
        <div className="relative">
          {/* Progress Bar Container */}
          <div className="absolute top-5 left-0 right-0 mx-5 z-0">
            <div className="relative h-[2px] bg-muted-foreground/30">
              <div 
                className="absolute h-[2px] bg-primary transition-all duration-300" 
                style={{ 
                  width: `${(activeIndex / (steps.length - 1)) * 100}%` 
                }}
              />
            </div>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              // Determine status of this step
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;
              const isFuture = index > activeIndex;
              
              return (
                <div key={step} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <button
                    onClick={() => {
                      // Only allow going back or to current step directly
                      // Future steps require validation via Next button
                      if (!isFuture) {
                        handleTabChange(step);
                      }
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-background",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                      isFuture && "cursor-not-allowed opacity-70"
                    )}
                    aria-label={`Go to ${step} step`}
                    disabled={isFuture}
                  >
                    {isCompleted ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <span 
                    className={cn(
                      "mt-3 text-xs font-medium capitalize",
                      isActive && "text-primary font-semibold",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground",
                      isFuture && "opacity-70"
                    )}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}); 