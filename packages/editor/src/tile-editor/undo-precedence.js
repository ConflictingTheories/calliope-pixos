/*
 * ---------------------------------------------------------------
 *         Pixospritz – Editor – Tile Editor – Undo precedence
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Decides whether the tile editor's local undo/redo bindings claim a
 * keystroke. The tile editor wins while keyboard focus is inside its
 * own DOM subtree — never inside a text field, so native input
 * undo/redo keeps working. Deliberately duck-typed (tagName /
 * isContentEditable / contains) to match the keymap's own guard style.
 */

/**
 * Priority for the tile editor's undo/redo bindings on the shared
 * keymap. Higher than the shell default (0), so tile-local undo wins
 * Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y over shell.undo / shell.redo while
 * the tile editor's panel has keyboard focus.
 */
export const TILE_BINDING_PRIORITY = 10;

/**
 * @param {{ contains: (node: any) => boolean } | null} root
 *   the tile editor's root DOM element (or null before mount)
 * @param {any} target  the keydown event's target
 * @returns {boolean} true when the tile editor should claim the keystroke
 */
export function isTileEditorFocused(root, target) {
  if (!root || !target || typeof root.contains !== 'function') return false;
  const tag = (target.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;
  return root.contains(target);
}
