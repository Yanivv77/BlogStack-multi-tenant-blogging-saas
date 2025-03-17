"use client";

import { useEffect, useState } from "react";

import { type EditorInstance, type JSONContent, useEditor } from "novel";
import { useDebouncedCallback } from "use-debounce";

import { loadEditorContent, saveEditorContent, saveHtmlContent } from "../utils/storage";

/**
 * Empty document with a single empty paragraph
 * Used as default content for the editor when no content is provided
 */
const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/**
 * Custom hook for managing editor state
 * Handles content loading, saving, and word count
 */
export function useEditorState(options: {
  onChange?: (value: JSONContent) => void;
  initialValue?: JSONContent;
  autosave?: boolean;
  highlightCodeFn?: (content: string) => string;
}) {
  const { onChange, initialValue, autosave = true, highlightCodeFn } = options;

  // Editor state
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [wordCount, setWordCount] = useState<number | undefined>();
  const { editor } = useEditor();

  /**
   * Debounced handler for editor updates
   * Saves content to localStorage and triggers onChange callback
   */
  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    if (!editor) return;

    const json = editor.getJSON();

    // Update word count
    if (editor.storage.characterCount) {
      setWordCount(editor.storage.characterCount.words());
    }

    // Save content if autosave is enabled
    if (autosave) {
      const html = editor.getHTML();
      const processedHtml = highlightCodeFn ? highlightCodeFn(html) : html;

      saveHtmlContent(processedHtml);
      saveEditorContent(json);
    }

    // Trigger onChange callback if provided
    if (onChange) {
      onChange(json);
    }

    setSaveStatus("Saved");
  }, 500);

  // Handle editor updates
  const handleUpdate = ({ editor }: { editor: EditorInstance }) => {
    if (!editor) return;

    debouncedUpdates(editor);
    setSaveStatus("Unsaved");
  };

  // Load initial content on mount
  useEffect(() => {
    console.log("useEditorState: Initializing with value:", initialValue);

    if (initialValue) {
      // If we have initialValue prop, use it directly
      setInitialContent(initialValue);
      console.log("useEditorState: Using provided initialValue");
    } else if (autosave) {
      // Otherwise try to load from storage if autosave is enabled
      const content = loadEditorContent();
      if (content) {
        setInitialContent(content);
        console.log("useEditorState: Loaded content from localStorage");
      } else {
        // If nothing in storage, use empty content
        setInitialContent(EMPTY_DOCUMENT);
        console.log("useEditorState: No content found, using empty doc");
      }
    } else {
      // If autosave disabled and no initialValue, use empty content
      setInitialContent(EMPTY_DOCUMENT);
      console.log("useEditorState: No initialValue provided, using empty doc");
    }
  }, [initialValue, autosave]);

  return {
    initialContent,
    saveStatus,
    wordCount,
    handleUpdate,
    editor,
  };
}
