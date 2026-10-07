/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – KeymapRegistry
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-09) The single keyboard dispatcher for the editor.  Tools
 * register shortcuts here instead of attaching ad-hoc global
 * keydown listeners.  One listener is installed by the shell;
 * everything else is data.
 */

/**
 * Normalize a KeyboardEvent into a canonical chord string, e.g.
 * "ctrl+shift+z", "meta+s", "Escape", "delete".
 * @param {KeyboardEvent} event
 * @returns {string}
 */
export function chordOf(event) {
  const parts = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.metaKey) parts.push('meta');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  let key = event.key;
  if (key === ' ') key = 'space';
  if (key.length === 1) key = key.toLowerCase();
  parts.push(key);
  return parts.join('+');
}

/**
 * Parse a declared shortcut ("ctrl+s", "meta+shift+z", "Escape")
 * into a canonical chord string.
 * @param {string} shortcut
 * @returns {string}
 */
export function parseShortcut(shortcut) {
  return shortcut
    .split('+')
    .map(p => {
      const t = p.trim().toLowerCase();
      if (t === 'cmd' || t === 'command') return 'meta';
      if (t === ' ') return 'space';
      return t;
    })
    .join('+');
}

export class KeymapRegistry {
  constructor() {
    /** @type {Map<string, Array<{id:string, when?:Function, run:Function}>>} */
    this.bindings = new Map();
  }

  /**
   * @param {string} id        stable binding id, e.g. 'map.brush'
   * @param {string} shortcut  e.g. 'ctrl+s', 'b', 'Escape'
   * @param {Function} run     handler(event) -> boolean|void
   * @param {{when?: (event: KeyboardEvent) => boolean}} [options]
   */
  register(id, shortcut, run, options = {}) {
    const chord = parseShortcut(shortcut);
    if (!this.bindings.has(chord)) this.bindings.set(chord, []);
    this.bindings.get(chord).push({ id, run, when: options.when });
    return () => this.unregister(id, chord);
  }

  unregister(id, chord) {
    const list = this.bindings.get(chord);
    if (!list) return;
    const i = list.findIndex(b => b.id === id);
    if (i >= 0) list.splice(i, 1);
    if (list.length === 0) this.bindings.delete(chord);
  }

  /**
   * The ONE keydown handler the shell installs.  Returns true when a
   * binding consumed the event.
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    // Never hijack typing inside inputs/textareas/contentEditable.
    const t = event.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
      if (event.key !== 'Escape') return false;
    }
    const chord = chordOf(event);
    const list = this.bindings.get(chord);
    if (!list) return false;
    for (const b of list) {
      if (b.when && !b.when(event)) continue;
      const consumed = b.run(event);
      if (consumed !== false) {
        event.preventDefault();
        return true;
      }
    }
    return false;
  }

  /** Human-readable list for the palette/help UI. */
  describe() {
    const out = [];
    for (const [chord, list] of this.bindings) {
      for (const b of list) out.push({ id: b.id, chord });
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }
}

/** Shared singleton for the editor shell. */
export const keymap = new KeymapRegistry();
