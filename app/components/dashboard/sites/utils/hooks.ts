"use client";

import { useRef } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<Args extends unknown[], R>(
  callback: (...args: Args) => R,
  delay: number
): (...args: Args) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args: Args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
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
