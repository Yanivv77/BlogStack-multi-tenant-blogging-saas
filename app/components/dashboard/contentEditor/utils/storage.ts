import { JSONContent } from "novel";

/**
 * Storage constants
 */
const STORAGE_KEYS = {
  HTML_CONTENT: 'html-content',
  EDITOR_CONTENT: 'novel-content',
  FORM_DRAFT: 'article-form-draft'
};

/**
 * Interface for form draft data
 */
export interface FormDraft {
  title?: string;
  slug?: string;
  smallDescription?: string;
  coverImage?: string | null;
  siteId?: string;
  articleContent?: any; // For rich text editor content
  lastUpdated?: number;
}

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
 * Save form draft data to localStorage
 * @param data Form draft data to save
 */
export const saveFormDraft = (data: FormDraft): void => {
  // Merge with existing data to prevent losing fields
  const existingData = loadFormDraft();
  const mergedData = {
    ...existingData,
    ...data,
    lastUpdated: Date.now()
  };
  
  window.localStorage.setItem(
    STORAGE_KEYS.FORM_DRAFT,
    JSON.stringify(mergedData)
  );
};

/**
 * Load form draft data from localStorage
 * @returns The form draft data or null if not found
 */
export const loadFormDraft = (): FormDraft | null => {
  const data = window.localStorage.getItem(STORAGE_KEYS.FORM_DRAFT);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing form draft data from localStorage', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if a form draft exists and is not empty
 * @returns True if a form draft exists with any data
 */
export const hasFormDraft = (): boolean => {
  const draft = loadFormDraft();
  return draft !== null && Object.keys(draft).some(key => 
    key !== 'lastUpdated' && draft[key as keyof FormDraft] !== undefined && 
    draft[key as keyof FormDraft] !== null && draft[key as keyof FormDraft] !== ''
  );
};

/**
 * Clear all editor content from localStorage
 */
export const clearEditorStorage = (): void => {
  window.localStorage.removeItem(STORAGE_KEYS.HTML_CONTENT);
  window.localStorage.removeItem(STORAGE_KEYS.EDITOR_CONTENT);
};

/**
 * Clear form draft from localStorage
 */
export const clearFormDraft = (): void => {
  window.localStorage.removeItem(STORAGE_KEYS.FORM_DRAFT);
};

/**
 * Clear all stored data (editor content and form draft)
 */
export const clearAllStorage = (): void => {
  clearEditorStorage();
  clearFormDraft();
}; 