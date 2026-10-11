/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useClipboard Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A hook for managing clipboard operations in editors.
 * Supports copy, cut, paste with serialization.
 *
 * Usage:
 *   const { copy, cut, paste, hasContent, canPaste } = useClipboard({
 *     serialize: (items) => JSON.stringify(items),
 *     deserialize: (data) => JSON.parse(data)
 *   });
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * @typedef {Object} ClipboardOptions
 * @property {function} [serialize] - Function to serialize items for clipboard
 * @property {function} [deserialize] - Function to deserialize clipboard data
 * @property {string} [mimeType='application/pixospritz'] - Custom MIME type for clipboard
 * @property {function} [onCopy] - Callback after copy
 * @property {function} [onCut] - Callback after cut
 * @property {function} [onPaste] - Callback after paste
 */

// Internal clipboard for same-session operations
let internalClipboard = null;

/**
 * useClipboard - Hook for clipboard operations
 *
 * @template T
 * @param {ClipboardOptions} [options={}]
 * @returns {{
 *   copy: (items: T | T[]) => Promise<void>,
 *   cut: (items: T | T[]) => Promise<void>,
 *   paste: () => Promise<T | T[] | null>,
 *   hasContent: boolean,
 *   canPaste: boolean,
 *   clear: () => void,
 *   getContent: () => T | T[] | null
 * }}
 */
export function useClipboard(options = {}) {
  const {
    serialize = items => JSON.stringify(items),
    deserialize = data => JSON.parse(data),
    onCopy = null,
    onCut = null,
    onPaste = null,
  } = options;

  const [hasContent, setHasContent] = useState(false);
  const [lastOperation, setLastOperation] = useState(null); // 'copy' | 'cut'

  // Check if clipboard API is available
  const hasClipboardAPI = typeof navigator !== 'undefined' && navigator.clipboard;

  // Update hasContent when internal clipboard changes
  useEffect(() => {
    setHasContent(internalClipboard !== null);
  }, []);

  /**
   * Copy items to clipboard
   */
  const copy = useCallback(
    async items => {
      try {
        const data = serialize(items);

        // Store in internal clipboard
        internalClipboard = { data, items, operation: 'copy' };
        setHasContent(true);
        setLastOperation('copy');

        // Try to use system clipboard
        if (hasClipboardAPI) {
          try {
            await navigator.clipboard.writeText(data);
          } catch {
            // System clipboard may fail due to permissions, fall back to internal
          }
        }

        onCopy?.(items);
      } catch {
        // Clipboard copy failed silently
      }
    },
    [serialize, hasClipboardAPI, onCopy]
  );

  /**
   * Cut items to clipboard (copy + mark for removal)
   */
  const cut = useCallback(
    async items => {
      try {
        const data = serialize(items);

        // Store in internal clipboard
        internalClipboard = { data, items, operation: 'cut' };
        setHasContent(true);
        setLastOperation('cut');

        // Try to use system clipboard
        if (hasClipboardAPI) {
          try {
            await navigator.clipboard.writeText(data);
          } catch {
            // System clipboard may fail due to permissions, fall back to internal
          }
        }

        onCut?.(items);
      } catch {
        // Clipboard cut failed silently
      }
    },
    [serialize, hasClipboardAPI, onCut]
  );

  /**
   * Paste items from clipboard
   */
  const paste = useCallback(async () => {
    try {
      let items = null;

      // First try internal clipboard (more reliable)
      if (internalClipboard) {
        items = internalClipboard.items;

        // Clear clipboard if it was a cut operation
        if (internalClipboard.operation === 'cut') {
          internalClipboard = null;
          setHasContent(false);
          setLastOperation(null);
        }
      }
      // Fall back to system clipboard
      else if (hasClipboardAPI) {
        try {
          const text = await navigator.clipboard.readText();
          items = deserialize(text);
        } catch {
          // System clipboard read failed, no data to paste
        }
      }

      if (items) {
        onPaste?.(items);
      }

      return items;
    } catch {
      // Clipboard paste failed
      return null;
    }
  }, [hasClipboardAPI, deserialize, onPaste]);

  /**
   * Clear clipboard
   */
  const clear = useCallback(() => {
    internalClipboard = null;
    setHasContent(false);
    setLastOperation(null);
  }, []);

  /**
   * Get clipboard content without consuming it
   */
  const getContent = useCallback(() => {
    return internalClipboard?.items ?? null;
  }, []);

  /**
   * Check if paste is possible
   */
  const canPaste = hasContent;

  /**
   * Check if last operation was cut
   */
  const wasCut = lastOperation === 'cut';

  return {
    copy,
    cut,
    paste,
    hasContent,
    canPaste,
    wasCut,
    clear,
    getContent,
  };
}

/**
 * useClipboardShortcuts - Hook to set up clipboard keyboard shortcuts
 *
 * @param {Object} options
 * @param {function} options.getSelected - Function to get selected items
 * @param {function} options.onPaste - Handler for pasted items
 * @param {function} [options.onCut] - Handler after cut (to delete items)
 * @param {boolean} [options.enabled=true] - Whether shortcuts are enabled
 */
export function useClipboardShortcuts({ getSelected, onPaste, onCut, enabled = true }) {
  const clipboard = useClipboard();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = e => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modKey) return;

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          const copyItems = getSelected();
          if (copyItems && (Array.isArray(copyItems) ? copyItems.length > 0 : true)) {
            clipboard.copy(copyItems);
          }
          break;

        case 'x':
          e.preventDefault();
          const cutItems = getSelected();
          if (cutItems && (Array.isArray(cutItems) ? cutItems.length > 0 : true)) {
            clipboard.cut(cutItems);
            onCut?.(cutItems);
          }
          break;

        case 'v':
          e.preventDefault();
          clipboard.paste().then(items => {
            if (items) {
              onPaste(items);
            }
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, getSelected, onPaste, onCut, clipboard]);

  return clipboard;
}

export default useClipboard;
