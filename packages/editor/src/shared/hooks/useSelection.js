/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useSelection Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A hook for managing multi-select state in editors.
 * Supports single and multi-selection with keyboard modifiers.
 * 
 * Usage:
 *   const {
 *     selected,
 *     isSelected,
 *     select,
 *     toggle,
 *     selectRange,
 *     clear,
 *     selectAll
 *   } = useSelection({ items, getKey });
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * @typedef {Object} SelectionOptions
 * @property {Array} [items=[]] - Array of selectable items
 * @property {function} [getKey] - Function to get unique key from item (default: item.id or index)
 * @property {boolean} [allowMultiple=true] - Allow multiple selection
 * @property {function} [onChange] - Callback when selection changes
 */

/**
 * useSelection - Hook for managing selection state
 * 
 * @template T
 * @param {SelectionOptions} [options={}]
 * @returns {{
 *   selected: Set<string|number>,
 *   selectedItems: T[],
 *   isSelected: (key: string|number) => boolean,
 *   select: (key: string|number, additive?: boolean) => void,
 *   toggle: (key: string|number) => void,
 *   selectRange: (startKey: string|number, endKey: string|number) => void,
 *   clear: () => void,
 *   selectAll: () => void,
 *   count: number,
 *   isEmpty: boolean,
 *   first: string|number|null,
 *   last: string|number|null
 * }}
 */
export function useSelection(options = {}) {
  const {
    items = [],
    getKey = (item, index) => item?.id ?? index,
    allowMultiple = true,
    onChange = null
  } = options;

  const [selected, setSelected] = useState(new Set());
  const [lastSelected, setLastSelected] = useState(null);

  // Get all item keys
  const itemKeys = useMemo(() => {
    return items.map((item, index) => getKey(item, index));
  }, [items, getKey]);

  // Key to index map for range selection
  const keyToIndex = useMemo(() => {
    const map = new Map();
    itemKeys.forEach((key, index) => map.set(key, index));
    return map;
  }, [itemKeys]);

  // Check if a key is selected
  const isSelected = useCallback((key) => {
    return selected.has(key);
  }, [selected]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter((item, index) => selected.has(getKey(item, index)));
  }, [items, selected, getKey]);

  // Update selection and notify
  const updateSelection = useCallback((newSelected, newLastSelected = lastSelected) => {
    setSelected(newSelected);
    setLastSelected(newLastSelected);
    onChange?.(newSelected, selectedItems);
  }, [onChange, lastSelected, selectedItems]);

  // Select a single item (or add to selection if additive)
  const select = useCallback((key, additive = false) => {
    if (!additive || !allowMultiple) {
      // Single selection
      const newSelected = new Set([key]);
      updateSelection(newSelected, key);
    } else {
      // Add to existing selection
      const newSelected = new Set(selected);
      newSelected.add(key);
      updateSelection(newSelected, key);
    }
  }, [allowMultiple, selected, updateSelection]);

  // Toggle selection of an item
  const toggle = useCallback((key) => {
    const newSelected = new Set(selected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    updateSelection(newSelected, key);
  }, [selected, updateSelection]);

  // Select a range of items (for shift-click)
  const selectRange = useCallback((startKey, endKey) => {
    if (!allowMultiple) {
      select(endKey);
      return;
    }

    const startIndex = keyToIndex.get(startKey);
    const endIndex = keyToIndex.get(endKey);

    if (startIndex === undefined || endIndex === undefined) {
      select(endKey);
      return;
    }

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    const newSelected = new Set(selected);
    for (let i = minIndex; i <= maxIndex; i++) {
      newSelected.add(itemKeys[i]);
    }

    updateSelection(newSelected, endKey);
  }, [allowMultiple, keyToIndex, itemKeys, selected, select, updateSelection]);

  // Handle click with keyboard modifiers
  const handleSelect = useCallback((key, event) => {
    if (event?.shiftKey && lastSelected !== null && allowMultiple) {
      selectRange(lastSelected, key);
    } else if ((event?.ctrlKey || event?.metaKey) && allowMultiple) {
      toggle(key);
    } else {
      select(key);
    }
  }, [lastSelected, allowMultiple, selectRange, toggle, select]);

  // Clear all selections
  const clear = useCallback(() => {
    updateSelection(new Set(), null);
  }, [updateSelection]);

  // Select all items
  const selectAll = useCallback(() => {
    if (!allowMultiple && itemKeys.length > 0) {
      select(itemKeys[0]);
      return;
    }
    updateSelection(new Set(itemKeys), itemKeys[itemKeys.length - 1]);
  }, [allowMultiple, itemKeys, select, updateSelection]);

  // Deselect specific items
  const deselect = useCallback((keys) => {
    const keysToRemove = Array.isArray(keys) ? keys : [keys];
    const newSelected = new Set(selected);
    keysToRemove.forEach(key => newSelected.delete(key));
    updateSelection(newSelected);
  }, [selected, updateSelection]);

  // Set selection directly
  const setSelection = useCallback((keys) => {
    const newSelected = new Set(Array.isArray(keys) ? keys : [keys]);
    updateSelection(newSelected, keys[keys.length - 1] ?? null);
  }, [updateSelection]);

  // Move selection (for keyboard navigation)
  const moveSelection = useCallback((direction) => {
    if (itemKeys.length === 0) return;

    let currentIndex = 0;
    if (lastSelected !== null) {
      currentIndex = keyToIndex.get(lastSelected) ?? 0;
    }

    let newIndex;
    switch (direction) {
    case 'up':
    case 'left':
      newIndex = Math.max(0, currentIndex - 1);
      break;
    case 'down':
    case 'right':
      newIndex = Math.min(itemKeys.length - 1, currentIndex + 1);
      break;
    case 'first':
      newIndex = 0;
      break;
    case 'last':
      newIndex = itemKeys.length - 1;
      break;
    default:
      return;
    }

    select(itemKeys[newIndex]);
  }, [itemKeys, lastSelected, keyToIndex, select]);

  return {
    // State
    selected,
    selectedItems,
    count: selected.size,
    isEmpty: selected.size === 0,
    first: selected.size > 0 ? Array.from(selected)[0] : null,
    last: lastSelected,

    // Methods
    isSelected,
    select,
    toggle,
    selectRange,
    handleSelect,
    clear,
    selectAll,
    deselect,
    setSelection,
    moveSelection
  };
}

export default useSelection;
