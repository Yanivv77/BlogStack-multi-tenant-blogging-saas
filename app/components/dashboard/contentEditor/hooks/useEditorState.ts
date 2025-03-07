"use client";

import { useState, useEffect } from "react";
import { type JSONContent, type EditorInstance, useEditor } from "novel";
import { useDebouncedCallback } from "use-debounce";
import { saveHtmlContent, saveEditorContent, loadEditorContent } from "../utils/storage";

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
    debouncedUpdates(editor);
    setSaveStatus("Unsaved");
  };

  // Load initial content on mount
  useEffect(() => {
    if (initialValue) {
      setInitialContent(initialValue);
    } else if (autosave) {
      const content = loadEditorContent();
      if (content) setInitialContent(content);
    }
  }, [initialValue, autosave]);

  return {
    initialContent,
    saveStatus,
    wordCount,
    handleUpdate,
    editor
  };
} 