"use client";

import { cn } from "@/lib/utils";

import type { StepIndicatorProps } from "../../utils/types";

/**
 * StepIndicator component for multi-step forms
 * Shows the current step and progress through the form
 */
export function StepIndicator({ steps, activeIndex, handleStepChange }: StepIndicatorProps) {
  return (
    <div className="border-b bg-background px-8 pb-6 pt-8" data-testid="step-indicator">
      <div className="mx-auto max-w-md">
        {/* Container for steps and progress bar */}
        <div className="relative">
          {/* Progress Bar Container */}
          <div className="absolute left-0 right-0 top-5 z-0 mx-5">
            <div className="relative h-[2px] bg-muted-foreground/30">
              <div
                className="absolute h-[2px] bg-primary transition-all duration-300"
                style={{
                  width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="relative z-10 flex justify-between">
            {steps.map((step, index) => {
              // Determine status of this step
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;
              const isFuture = index > activeIndex;

              return (
                <div key={step} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();

                      // Only allow going back or to current step directly
                      // Future steps require validation via Next button
                      if (!isFuture) {
                        handleStepChange(step);
                      }
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                      isFuture && "cursor-not-allowed opacity-70"
                    )}
                    aria-label={`Go to ${step} step`}
                    disabled={isFuture}
                    type="button" // Explicitly set type to button to prevent form submission
                    data-testid={`step-button-${step}`}
                  >
                    <span className="text-sm font-medium">{index + 1}</span>
                  </button>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "mt-3 text-xs font-medium capitalize",
                      isActive && "font-semibold text-primary",
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
}
