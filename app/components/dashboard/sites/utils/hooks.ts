"use client";

import { useRef } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return ((...args: unknown[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (typeof callback === "function") {
        (callback as Function)(...args);
      }
    }, delay);
  }) as unknown as T;
}

/**
 * Helper function to add hidden inputs to a form
 * @param form Form element to add inputs to
 * @param name Input name
 * @param value Input value
 */
export function addHiddenInput(form: HTMLFormElement, name: string, value: string) {
  // Remove any existing input with the same name
  const existingInput = form.querySelector(`input[name="${name}"]`);
  if (existingInput && existingInput.tagName !== "SELECT") {
    existingInput.remove();
  }

  // Create or update hidden input
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = name;
  hiddenInput.value = value;
  form.appendChild(hiddenInput);
}
