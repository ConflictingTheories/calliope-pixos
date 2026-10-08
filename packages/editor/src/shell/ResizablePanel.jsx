/*
 * ---------------------------------------------------------------
 *                  PixoSpritz – Editor – ResizablePanel
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Generic resizable panel wrapper. Renders children in a fixed-width
 * flex child with a drag handle on one edge. Width persists to
 * localStorage so the layout survives reloads.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ResizablePanel.css';

/**
 * Resizable panel with drag handle.
 * @param {Object} props
 * @param {string} props.id - Unique panel ID (localStorage key: `px-panel-width:<id>`)
 * @param {number} props.initialWidth - Default width in px
 * @param {number} props.minWidth - Minimum width in px
 * @param {number} props.maxWidth - Maximum width in px
 * @param {React.ReactNode} props.children - Panel content
 * @param {Function} [props.onResize] - Called with new width after drag ends
 * @param {'right'|'left'} [props.handleSide] - Which edge the handle sits on (default 'right')
 * @param {string} [props.className] - Extra class names
 */
export function ResizablePanel({
  id,
  initialWidth = 220,
  minWidth = 160,
  maxWidth = 400,
  children,
  onResize,
  handleSide = 'right',
  className = '',
}) {
  const storageKey = `px-panel-width:${id}`;

  const [width, setWidth] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? parseInt(saved, 10) : NaN;
      if (!Number.isNaN(parsed)) {
        return Math.min(Math.max(parsed, minWidth), maxWidth);
      }
    } catch {
      // localStorage unavailable — fall through to initialWidth
    }
    return initialWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, startWidth: 0 });

  const handleMouseDown = useCallback(
    e => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);
    },
    [width]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      setIsDragging(false);
      const finalWidth = dragState.currentWidth ?? width;
      try {
        window.localStorage.setItem(storageKey, String(finalWidth));
      } catch {
        // ignore storage failures
      }
      if (onResize) onResize(finalWidth);
    };

    // Track latest width for persistence without stale closure
    const syncWidth = e => {
      const dx = e.clientX - dragState.current.startX;
      const delta = handleSide === 'right' ? dx : -dx;
      const next = Math.min(
        Math.max(dragState.current.startWidth + delta, minWidth),
        maxWidth
      );
      dragState.currentWidth = next;
      setWidth(next);
    };

    document.addEventListener('mousemove', syncWidth);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    return () => {
      document.removeEventListener('mousemove', syncWidth);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Persist on unmount as a safety net
  useEffect(() => {
    return () => {
      try {
        window.localStorage.setItem(storageKey, String(width));
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`resizable-panel ${className}`.trim()}
      style={{ width, minWidth, maxWidth, flexShrink: 0 }}
      data-panel-id={id}
    >
      <div className="resizable-panel__content">{children}</div>
      <div
        className={`resizable-panel__handle resizable-panel__handle--${handleSide}${isDragging ? ' is-dragging' : ''}`}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  );
}

export default ResizablePanel;
