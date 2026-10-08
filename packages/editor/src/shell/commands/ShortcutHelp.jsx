/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ShortcutHelp
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2 / finding A3.1) Shortcut reference dialog.  The
 * command palette exists but its contents are undiscoverable;
 * this dialog lists every registered command with its shortcut,
 * generated from the same registries so it never goes stale.
 * Opened from the palette ("Keyboard shortcuts") or the ? key.
 */

import React, { useMemo } from 'react';
import { Modal, Input } from '../../ui';
import { commands } from './commands.js';
import './ShortcutHelp.css';

/** Pretty-print a chord: "ctrl+shift+z" -> "Ctrl + Shift + Z". */
export function prettyChord(chord) {
  return chord
    .split('+')
    .map(p =>
      p === 'ctrl' ? 'Ctrl'
      : p === 'meta' ? '⌘'
      : p === 'alt' ? 'Alt'
      : p === 'shift' ? 'Shift'
      : p === 'space' ? 'Space'
      : p.length === 1 ? p.toUpperCase()
      : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join(' + ');
}

export function ShortcutHelp({ open, onClose }) {
  const [query, setQuery] = React.useState('');

  const groups = useMemo(() => {
    const list = commands.list(query);
    const byGroup = new Map();
    for (const c of list) {
      if (!byGroup.has(c.group)) byGroup.set(c.group, []);
      byGroup.get(c.group).push(c);
    }
    return [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [query, open]);

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <Modal.Title>Keyboard shortcuts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="shortcut-help">
          <Input
            size="sm"
            placeholder="Filter commands…"
            value={query}
            onChange={setQuery}
            aria-label="Filter commands"
          />
          {groups.length === 0 ? (
            <p className="shortcut-help__empty">No commands match “{query}”.</p>
          ) : (
            groups.map(([group, cmds]) => (
              <section key={group} className="shortcut-help__group">
                <h4 className="shortcut-help__group-title">{group}</h4>
                <ul className="shortcut-help__list">
                  {cmds.map(c => (
                    <li key={c.id} className="shortcut-help__row">
                      <span className="shortcut-help__name">{c.title}</span>
                      {c.shortcut ? (
                        <kbd className="shortcut-help__keys">{prettyChord(c.shortcut)}</kbd>
                      ) : (
                        <span className="shortcut-help__no-keys">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
          <p className="shortcut-help__hint">
            Tip: press <kbd className="shortcut-help__keys">Ctrl + K</kbd> anywhere
            to open the command palette.
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ShortcutHelp;
