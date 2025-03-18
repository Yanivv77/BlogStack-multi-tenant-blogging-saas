"use client";

import { BubbleMenu } from "@tiptap/react";
import { useEditor } from "novel";

import type { MenuSwitchProps } from "../core/types";

/**
 * Bubble menu component that shows formatting options when text is selected
 */
export const MenuSwitch = ({ onOpenChange, children }: MenuSwitchProps) => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex overflow-hidden rounded border border-muted bg-background shadow-xl"
      tippyOptions={{
        placement: "top-start",
        onShow: () => {
          onOpenChange(true);
        },
        onHide: () => {
          onOpenChange(false);
        },
      }}
    >
      {children}
    </BubbleMenu>
  );
};

export default MenuSwitch;
