/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – CommandRegistry
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-09) Named UI commands for the command palette.  Tools
 * register { id, title, shortcut, when, run, undoHint } — the
 * palette renders them, the keymap executes them.
 */

import { keymap, parseShortcut } from './keymap.js';

export class CommandRegistry {
  constructor() {
    /** @type {Map<string, Object>} */
    this.commands = new Map();
    /** @type {Map<string, Function>} command id -> keymap unregister */
    this.keyBindings = new Map();
  }

  /**
   * @param {{id:string, title:string, shortcut?:string, when?:Function,
   *          run:(ctx:any)=>any, undoHint?:string, group?:string}} def
   */
  register(def) {
    if (!def || typeof def.id !== 'string' || typeof def.run !== 'function') {
      throw new Error('CommandRegistry: command needs {id, run}');
    }
    if (this.commands.has(def.id)) {
      throw new Error(`CommandRegistry: duplicate command id "${def.id}"`);
    }
    this.commands.set(def.id, { group: 'general', ...def });
    if (def.shortcut) {
      const off = keymap.register(
        `cmd:${def.id}`,
        def.shortcut,
        event => {
          if (def.when && !def.when(event)) return false;
          def.run({ event, via: 'shortcut' });
          return true;
        }
      );
      this.keyBindings.set(def.id, off);
    }
    return () => this.unregister(def.id);
  }

  unregister(id) {
    this.commands.delete(id);
    const off = this.keyBindings.get(id);
    if (off) {
      off();
      this.keyBindings.delete(id);
    }
  }

  get(id) {
    return this.commands.get(id) || null;
  }

  /** @returns {boolean} true when the command ran */
  execute(id, ctx = {}) {
    const def = this.commands.get(id);
    if (!def) return false;
    if (def.when && !def.when(ctx)) return false;
    def.run({ ...ctx, via: ctx.via || 'palette' });
    return true;
  }

  /** Palette listing, optionally filtered. */
  list(filter = '') {
    const q = filter.trim().toLowerCase();
    const all = [...this.commands.values()].map(d => ({
      id: d.id,
      title: d.title,
      group: d.group,
      shortcut: d.shortcut ? parseShortcut(d.shortcut) : null,
      undoHint: d.undoHint || null,
      enabled: !d.when || d.when({}),
    }));
    if (!q) return all.sort((a, b) => a.title.localeCompare(b.title));
    return all
      .filter(c => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }
}

/** Shared singleton for the editor shell. */
export const commands = new CommandRegistry();
