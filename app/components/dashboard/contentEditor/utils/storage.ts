import { JSONContent } from "novel";

/**
 * Storage constants
 */
const STORAGE_KEYS = {
  HTML_CONTENT: 'html-content',
  EDITOR_CONTENT: 'novel-content'
};

/**
 * Save HTML content to localStorage
 */
export const saveHtmlContent = (html: string): void => {
  window.localStorage.setItem(STORAGE_KEYS.HTML_CONTENT, html);
};

/**
 * Save editor JSON content to localStorage
 */
export const saveEditorContent = (content: JSONContent): void => {
  window.localStorage.setItem(
    STORAGE_KEYS.EDITOR_CONTENT, 
    JSON.stringify(content)
  );
};

/**
 * Load editor content from localStorage
 * @returns The editor content or null if not found
 */
export const loadEditorContent = (): JSONContent | null => {
  const content = window.localStorage.getItem(STORAGE_KEYS.EDITOR_CONTENT);
  if (content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing editor content from localStorage', error);
      return null;
    }
  }
  return null;
};

/**
 * Clear all editor content from localStorage
 */
export const clearEditorStorage = (): void => {
  window.localStorage.removeItem(STORAGE_KEYS.HTML_CONTENT);
  window.localStorage.removeItem(STORAGE_KEYS.EDITOR_CONTENT);
}; 