/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Keyboard Shortcuts Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Global keyboard shortcuts management for the editor.
 * Provides a declarative way to register and handle keyboard shortcuts.
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Default keyboard shortcuts for the editor
 */
export const DEFAULT_SHORTCUTS = {
  // Global shortcuts
  'help': { key: '?', shift: false, ctrl: false, meta: false, description: 'Open help panel' },
  'save': { key: 's', ctrl: true, meta: true, description: 'Save project' },
  'undo': { key: 'z', ctrl: true, meta: true, description: 'Undo' },
  'redo': { key: 'z', ctrl: true, meta: true, shift: true, description: 'Redo' },
  'redoAlt': { key: 'y', ctrl: true, meta: true, description: 'Redo (alternative)' },
  'new': { key: 'n', ctrl: true, meta: true, description: 'New project' },
  'open': { key: 'o', ctrl: true, meta: true, description: 'Open project' },
  'export': { key: 'e', ctrl: true, meta: true, description: 'Export project' },
  'preview': { key: 'p', ctrl: true, meta: true, description: 'Preview game' },
  'escape': { key: 'Escape', description: 'Close modal / Cancel' },
  'delete': { key: 'Delete', description: 'Delete selected' },
  'backspace': { key: 'Backspace', description: 'Delete selected (alt)' },
  'selectAll': { key: 'a', ctrl: true, meta: true, description: 'Select all' },
  'duplicate': { key: 'd', ctrl: true, meta: true, description: 'Duplicate selected' },
  'zoomIn': { key: '=', description: 'Zoom in' },
  'zoomInAlt': { key: '+', description: 'Zoom in (numpad)' },
  'zoomOut': { key: '-', description: 'Zoom out' },
  'zoomReset': { key: '0', ctrl: true, meta: true, description: 'Reset zoom' },
  
  // Tool shortcuts (1-9)
  'tool1': { key: '1', description: 'Select tool 1' },
  'tool2': { key: '2', description: 'Select tool 2' },
  'tool3': { key: '3', description: 'Select tool 3' },
  'tool4': { key: '4', description: 'Select tool 4' },
  'tool5': { key: '5', description: 'Select tool 5' },
  'tool6': { key: '6', description: 'Select tool 6' },
  'tool7': { key: '7', description: 'Select tool 7' },
  'tool8': { key: '8', description: 'Select tool 8' },
  'tool9': { key: '9', description: 'Select tool 9' },
};

/**
 * Check if an event matches a shortcut definition
 */
function matchesShortcut(event, shortcut) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  // Check key (case insensitive)
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase() && 
      event.key !== shortcut.key) {
    return false;
  }
  
  // Check modifiers
  const requiresCtrl = shortcut.ctrl || false;
  const requiresMeta = shortcut.meta || false;
  const requiresShift = shortcut.shift || false;
  const requiresAlt = shortcut.alt || false;
  
  // On Mac, prefer meta (Cmd) over ctrl
  // On Windows/Linux, prefer ctrl
  const modifierPressed = isMac 
    ? (requiresMeta || requiresCtrl) ? event.metaKey : !event.metaKey && !event.ctrlKey
    : (requiresCtrl || requiresMeta) ? event.ctrlKey : !event.ctrlKey && !event.metaKey;
  
  if ((requiresCtrl || requiresMeta) && !modifierPressed) return false;
  if (requiresShift !== event.shiftKey) return false;
  if (requiresAlt !== event.altKey) return false;
  
  return true;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

/**
 * Hook for registering keyboard shortcuts
 * 
 * @param {Object} handlers - Object mapping action names to handler functions
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether shortcuts are enabled (default: true)
 * @param {boolean} options.ignoreInputs - Skip shortcuts when focused on inputs (default: true)
 * @param {Object} options.customShortcuts - Override default shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   save: () => saveProject(),
 *   undo: () => handleUndo(),
 *   redo: () => handleRedo(),
 *   help: () => setShowHelp(true),
 * });
 */
export function useKeyboardShortcuts(handlers = {}, options = {}) {
  const {
    enabled = true,
    ignoreInputs = true,
    customShortcuts = {},
  } = options;

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const shortcuts = { ...DEFAULT_SHORTCUTS, ...customShortcuts };

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    // Skip if focused on input and ignoreInputs is true
    if (ignoreInputs && isInputElement(event.target)) {
      // Exception: still handle Escape
      if (event.key !== 'Escape') return;
    }

    // Find matching shortcut
    for (const [action, shortcut] of Object.entries(shortcuts)) {
      if (matchesShortcut(event, shortcut) && handlersRef.current[action]) {
        event.preventDefault();
        event.stopPropagation();
        handlersRef.current[action](event);
        return;
      }
    }
  }, [enabled, ignoreInputs]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

/**
 * Simple hook for a single keyboard shortcut
 */
export function useShortcut(shortcut, handler, options = {}) {
  const { enabled = true, ignoreInputs = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (ignoreInputs && isInputElement(event.target)) return;
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, handler, enabled, ignoreInputs]);
}

/**
 * Get display string for a shortcut
 */
export function getShortcutDisplay(shortcut) {
  const isMac = typeof navigator !== 'undefined' && 
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const parts = [];
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  
  // Format key name
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  else if (key === 'Escape') key = 'Esc';
  else if (key.length === 1) key = key.toUpperCase();
  
  parts.push(key);
  
  return parts.join(isMac ? '' : '+');
}

export default useKeyboardShortcuts;
