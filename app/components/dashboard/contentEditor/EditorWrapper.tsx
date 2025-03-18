"use client";

import { useState } from "react";

import hljs from "highlight.js";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  ImageResizer,
} from "novel";

import { Separator } from "@/components/ui/separator";

import { defaultExtensions } from "./core/extensions";
import { slashCommand, suggestionItems } from "./core/slash-command";
import type { EditorProps } from "./core/types";
import { useEditorState } from "./hooks/useEditorState";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import { MenuSwitch } from "./ui/MenuSwitch";
import { uploadFn } from "./utils/image-upload";

// Combine all extensions
const extensions = [...defaultExtensions, slashCommand];

interface EditorView {
  state: {
    schema: {
      nodes: {
        image: {
          create: (attrs: { src: string; alt: string }) => unknown;
        };
      };
    };
    tr: {
      replaceSelectionWith: (node: unknown) => unknown;
      insert: (pos: number, node: unknown) => unknown;
    };
  };
  dispatch: (tr: unknown) => void;
  posAtCoords: (coords: { left: number; top: number }) => { pos: number } | null;
}

/**
 * Custom image paste handler that works with our uploadFn
 */
const customImagePaste = (view: unknown, event: ClipboardEvent) => {
  if (!event.clipboardData) return false;

  const items = Array.from(event.clipboardData.items);
  const imageItem = items.find((item) => item.type.startsWith("image"));

  if (!imageItem) return false;

  const file = imageItem.getAsFile();
  if (!file) return false;

  event.preventDefault();

  // Handle the image upload asynchronously
  uploadFn(file)
    .then((imageUrl) => {
      const { schema } = (view as EditorView).state;
      const node = schema.nodes.image.create({ src: imageUrl, alt: file.name });
      const transaction = (view as EditorView).state.tr.replaceSelectionWith(node);
      (view as EditorView).dispatch(transaction);
    })
    .catch((error) => {
      console.error("Error pasting image:", error);
    });

  // Return true to indicate we've handled the event
  return true;
};

/**
 * Custom image drop handler that works with our uploadFn
 */
const customImageDrop = (view: unknown, event: DragEvent, moved: boolean) => {
  if (moved) return false;

  if (!event.dataTransfer) return false;

  const hasFiles = event.dataTransfer.files.length > 0;
  if (!hasFiles) return false;

  const images = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));

  if (images.length === 0) return false;

  event.preventDefault();

  // Get the position where the image is being dropped
  const coordinates = (view as EditorView).posAtCoords({ left: event.clientX, top: event.clientY });
  if (!coordinates) return false;

  // Process each dropped image asynchronously
  images.forEach((file) => {
    uploadFn(file)
      .then((imageUrl) => {
        const { schema } = (view as EditorView).state;
        const node = schema.nodes.image.create({ src: imageUrl, alt: file.name });
        const transaction = (view as EditorView).state.tr.insert(coordinates.pos, node);
        (view as EditorView).dispatch(transaction);
      })
      .catch((error) => {
        console.error("Error dropping image:", error);
      });
  });

  // Return true to indicate we've handled the event
  return true;
};

/**
 * Applies syntax highlighting to code blocks in HTML content
 */
const highlightCodeblocks = (content: string): string => {
  const doc = new DOMParser().parseFromString(content, "text/html");
  doc.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el as HTMLElement);
  });
  return new XMLSerializer().serializeToString(doc);
};

/**
 * Advanced rich text editor component with Tailwind styling
 * Supports image uploads, formatting, and command menu
 */
const EditorWrapper = ({ onChange, initialValue }: EditorProps) => {
  // Menu state
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(true);

  // Use our custom hook for editor state management
  const { initialContent, saveStatus, wordCount, handleUpdate } = useEditorState({
    onChange: (content) => {
      // Pass the content to the parent component for draft saving
      if (onChange) {
        onChange(content);
        console.info("Editor content changed, reporting to parent");
      }
    },
    // Only pass initialValue if it's defined and not null
    initialValue: initialValue || undefined,
    highlightCodeFn: highlightCodeblocks,
  });

  // Show loading indicator while waiting for content
  if (!initialContent) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center border-muted bg-background">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Status indicators */}

      {/* Editor header with commands help */}
      <div className="mb-0 flex items-center gap-2 rounded-t-lg border border-muted bg-background p-6">
        <div className="hidden items-center gap-2 text-sm text-muted-foreground [@media(min-width:1200px)]:flex">
          <span className="rounded bg-muted px-2 py-1 font-mono">/</span>
          <span>Type to open command menu</span>
          <span className="mx-2">•</span>
          <span className="rounded bg-muted px-2 py-1">Select text</span>
          <span>to show formatting options</span>
        </div>
        <div className="absolute right-5 top-5 z-10 flex gap-2">
          {wordCount && (
            <div className="rounded-lg px-2 py-1 text-sm text-muted-foreground">
              {wordCount} Words - {saveStatus}
            </div>
          )}
        </div>
      </div>

      {/* Editor root */}
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full border-muted bg-background sm:rounded-b-lg sm:border sm:border-t-0 sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => customImagePaste(view, event),
            handleDrop: (view, event, _slice, moved) => customImageDrop(view, event, moved),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={handleUpdate}
          slotAfter={<ImageResizer />}
          immediatelyRender={false}
        >
          {/* Command menu */}
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => (typeof item.command === "function" ? item.command(val) : null)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Formatting menu */}
          <MenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" className="h-6" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" className="h-6" />
            <MathSelector />
            <Separator orientation="vertical" className="h-6" />
            <TextButtons />
            <Separator orientation="vertical" className="h-6" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </MenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default EditorWrapper;
