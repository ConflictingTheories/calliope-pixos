/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Shared Hooks
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Export all shared hooks for use across editors.
 */

// History management
export { useHistory, createHistoryKeyHandler } from './useHistory.js';

// Keyboard shortcuts
export {
  useKeyboardShortcuts,
  useShortcut,
  getShortcutDisplay,
  DEFAULT_SHORTCUTS,
} from './useKeyboardShortcuts.js';

// Keyboard context (uses KeyboardManager service)
export {
  useKeyboardContext,
  useShortcutConfig,
  useDisableShortcuts,
  useActiveContexts,
  ContextPriority,
} from './useKeyboardContext.js';

// Selection management
export { useSelection } from './useSelection.js';

// Clipboard operations
export { useClipboard, useClipboardShortcuts } from './useClipboard.js';

// Project context
export { useProject, ProjectProvider, AssetTypes } from './useProject.js';

// Asset library
export { useAssetLibrary } from './useAssetLibrary.js';

// Editor settings
export {
  useSettings,
  SettingsProvider,
  useSetting,
  SettingCategories,
  DEFAULT_SETTINGS,
} from './useSettings.js';
