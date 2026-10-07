/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – CommandPalette
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-09) Filterable command palette (Ctrl/Cmd+K).  Renders
 * commands from the CommandRegistry; execution goes through the
 * registry so shortcuts and palette stay in sync.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { commands } from './commands.js';
import { Input } from '../../ui';
import './command-palette.css';

export function CommandPalette({ open, onClose, registry = commands }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => registry.list(query), [query, registry, open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open ]);

  if (!open) return null;

  const runAt = index => {
    const item = items[index];
    if (!item || item.enabled === false) return;
    registry.execute(item.id);
    onClose();
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="px-command-palette-overlay" onMouseDown={onClose} role="dialog" aria-label="Command palette">
      <div className="px-command-palette" onMouseDown={e => e.stopPropagation()}>
        <Input
          ref={inputRef}
          className="px-command-palette-input"
          placeholder="Type a command…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          aria-label="Filter commands"
        />
        <ul className="px-command-palette-list">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={`px-command-palette-item${i === activeIndex ? ' active' : ''}${item.enabled === false ? ' disabled' : ''}`}
              onMouseDown={e => {
                e.preventDefault();
                runAt(i);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="px-command-palette-title">{item.title}</span>
              {item.shortcut && <kbd className="px-command-palette-shortcut">{item.shortcut}</kbd>}
            </li>
          ))}
          {items.length === 0 && <li className="px-command-palette-empty">No matching commands</li>}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
