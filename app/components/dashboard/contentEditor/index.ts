/**
 * Content Editor Module
 * 
 * This module provides a rich text editor with advanced features like
 * image uploads, formatting options, and slash commands.
 */

// Main editor components
export { default as EditorWrapper } from './EditorWrapper';

// Core types and functionality
export * from './core/types';
export { defaultExtensions } from './core/extensions';
export { slashCommand, suggestionItems } from './core/slash-command';

// UI components
export { MenuSwitch } from './ui/MenuSwitch';
export { ToolbarButton } from './ui/ToolbarButton';
export { SeoRecommendations } from './ui/SeoRecommendations';

// Hooks
export { useEditorState } from './hooks/useEditorState';

// Selectors
export { ColorSelector } from './selectors/color-selector';
export { LinkSelector } from './selectors/link-selector';
export { MathSelector } from './selectors/math-selector';
export { NodeSelector } from './selectors/node-selector';
export { TextButtons } from './selectors/text-buttons';

// Utilities
export { 
  uploadFn,
  getUploadedImages,
  addExistingImages,
  clearUploadedImages 
} from './utils/image-upload';

export {
  saveHtmlContent,
  saveEditorContent,
  loadEditorContent,
  clearEditorStorage,
  saveFormDraft,
  loadFormDraft,
  hasFormDraft,
  clearFormDraft,
  clearAllStorage,
  type FormDraft
} from './utils/storage'; 