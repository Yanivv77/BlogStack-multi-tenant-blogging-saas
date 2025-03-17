"use client";

import type { ToolbarButtonProps } from "../core/types";

/**
 * Reusable button component for editor toolbar
 * Renders a button with hover effects and an icon
 */
export const ToolbarButton = ({ icon, title, onClick }: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    className="rounded p-2 transition-colors hover:bg-muted"
    title={title}
    type="button"
    aria-label={title}
  >
    {icon}
  </button>
);
