/**
 * ShortcutHelp — keyboard shortcut overlay.
 *
 * Press ? (or Ctrl+/) to see all shortcuts.
 * Uses KeymapRegistry.describe() for the live list.
 */

import { useState, useEffect } from 'react';
import { keymap } from '../shell/commands/keymap.js';

function formatChord(chord) {
  return chord
    .split('+')
    .map(p => {
      if (p === 'ctrl') return 'Ctrl';
      if (p === 'meta') return '⌘';
      if (p === 'alt') return 'Alt';
      if (p === 'shift') return 'Shift';
      if (p === 'space') return 'Space';
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(' + ');
}

function formatId(id) {
  return id
    .split('.')
    .map(part => part
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
    )
    .join(' → ');
}

export default function ShortcutHelp({ onClose }) {
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    setShortcuts(keymap.describe());
  }, []);

  // Group by category (first part of id)
  const groups = {};
  for (const s of shortcuts) {
    const category = s.id.split('.')[0] || 'General';
    if (!groups[category]) groups[category] = [];
    groups[category].push(s);
  }

  return (
    <div className="shortcut-help-overlay" onClick={onClose}>
      <div className="shortcut-help" onClick={e => e.stopPropagation()}>
        <div className="shortcut-help-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="btn btn-small btn-secondary" onClick={onClose}>
            Close (Esc)
          </button>
        </div>
        <div className="shortcut-help-body">
          {Object.keys(groups).sort().map(category => (
            <div key={category} className="shortcut-group">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              {groups[category].map(s => (
                <div key={s.id} className="shortcut-row">
                  <span className="shortcut-id">{formatId(s.id)}</span>
                  <kbd className="shortcut-chord">{formatChord(s.chord)}</kbd>
                </div>
              ))}
            </div>
          ))}
          {shortcuts.length === 0 && (
            <div className="empty-state">No shortcuts registered.</div>
          )}
        </div>
      </div>
    </div>
  );
}
