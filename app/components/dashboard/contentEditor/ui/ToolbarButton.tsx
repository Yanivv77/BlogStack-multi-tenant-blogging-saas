"use client";

import { ToolbarButtonProps } from "../core/types";

/**
 * Reusable button component for editor toolbar
 * Renders a button with hover effects and an icon
 */
export const ToolbarButton = ({ 
  icon, 
  title, 
  onClick 
}: ToolbarButtonProps) => (
  <button 
    onClick={onClick}
    className="p-2 rounded hover:bg-muted transition-colors" 
    title={title}
    type="button"
    aria-label={title}
  >
    {icon}
  </button>
); 