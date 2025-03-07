import { JSONContent } from "novel";

/**
 * Editor component props
 */
export interface EditorProps {
  onChange?: (value: JSONContent) => void;
  initialValue?: JSONContent;
}

/**
 * Toolbar button props
 */
export interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

/**
 * Menu switch props
 */
export interface MenuSwitchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Selector component props
 */
export interface SelectorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} 