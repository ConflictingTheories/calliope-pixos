/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – EditorPanel Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A resizable panel component for editor layouts.
 * Supports collapsing, resizing, and multiple layout positions.
 *
 * Usage:
 *   <EditorPanel
 *     title="Properties"
 *     position="right"
 *     defaultWidth={300}
 *     collapsible
 *     onResize={handleResize}
 *   >
 *     <PropertyEditor {...props} />
 *   </EditorPanel>
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../styles/editor-panel.css';

/**
 * @typedef {'left' | 'right' | 'top' | 'bottom'} PanelPosition
 */

/**
 * EditorPanel - Resizable panel for editor layouts
 *
 * @param {Object} props
 * @param {string} [props.title] - Panel title
 * @param {React.ReactNode} [props.icon] - Icon to show next to title
 * @param {PanelPosition} [props.position='left'] - Panel position
 * @param {number} [props.defaultWidth=280] - Default width (for left/right panels)
 * @param {number} [props.defaultHeight=200] - Default height (for top/bottom panels)
 * @param {number} [props.minSize=150] - Minimum size when resizing
 * @param {number} [props.maxSize=600] - Maximum size when resizing
 * @param {boolean} [props.resizable=true] - Whether panel can be resized
 * @param {boolean} [props.collapsible=true] - Whether panel can be collapsed
 * @param {boolean} [props.defaultCollapsed=false] - Initial collapsed state
 * @param {function} [props.onResize] - Callback when panel is resized
 * @param {function} [props.onCollapse] - Callback when panel is collapsed/expanded
 * @param {React.ReactNode} [props.headerActions] - Custom actions for header
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} [props.className] - Additional CSS classes
 */
function EditorPanel({
  title,
  icon,
  position = 'left',
  defaultWidth = 280,
  defaultHeight = 200,
  minSize = 150,
  maxSize = 600,
  resizable = true,
  collapsible = true,
  defaultCollapsed = false,
  onResize,
  onCollapse,
  headerActions,
  children,
  className = '',
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [size, setSize] = useState(
    position === 'top' || position === 'bottom' ? defaultHeight : defaultWidth
  );
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const isHorizontal = position === 'left' || position === 'right';

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback(
    e => {
      e.preventDefault();
      setIsResizing(true);
      startPosRef.current = isHorizontal ? e.clientX : e.clientY;
      startSizeRef.current = size;

      document.body.style.cursor = isHorizontal ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [isHorizontal, size]
  );

  // Handle mouse move during resize
  const handleResizeMove = useCallback(
    e => {
      if (!isResizing) return;

      const currentPos = isHorizontal ? e.clientX : e.clientY;
      let delta = currentPos - startPosRef.current;

      // Invert delta for right and bottom panels
      if (position === 'right' || position === 'bottom') {
        delta = -delta;
      }

      const newSize = Math.min(maxSize, Math.max(minSize, startSizeRef.current + delta));
      setSize(newSize);
      onResize?.(newSize);
    },
    [isResizing, isHorizontal, position, minSize, maxSize, onResize]
  );

  // Handle mouse up to end resize
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add/remove global mouse event listeners during resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  }, [isCollapsed, onCollapse]);

  // Keyboard support
  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCollapse();
      }
    },
    [toggleCollapse]
  );

  // Determine resize handle position
  const getResizeHandlePosition = () => {
    switch (position) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      default:
        return 'right';
    }
  };

  const panelStyle = {
    [isHorizontal ? 'width' : 'height']: isCollapsed ? 'auto' : `${size}px`,
    [isHorizontal ? 'minWidth' : 'minHeight']: isCollapsed ? 'auto' : `${minSize}px`,
    [isHorizontal ? 'maxWidth' : 'maxHeight']: isCollapsed ? 'auto' : `${maxSize}px`,
  };

  return (
    <div
      ref={panelRef}
      className={`editor-panel editor-panel--${position} ${isCollapsed ? 'editor-panel--collapsed' : ''} ${isResizing ? 'editor-panel--resizing' : ''} ${className}`}
      style={panelStyle}
      data-position={position}
    >
      {/* Header */}
      {title && (
        <div
          className="editor-panel__header"
          onClick={collapsible ? toggleCollapse : undefined}
          onKeyDown={collapsible ? handleKeyDown : undefined}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          aria-expanded={collapsible ? !isCollapsed : undefined}
        >
          <div className="editor-panel__header-left">
            {icon && <span className="editor-panel__icon">{icon}</span>}
            <span className="editor-panel__title">{title}</span>
          </div>
          <div className="editor-panel__header-right">
            {headerActions}
            {collapsible && (
              <span
                className={`editor-panel__collapse-icon ${isCollapsed ? 'editor-panel__collapse-icon--collapsed' : ''}`}
              >
                <ChevronIcon
                  direction={isCollapsed ? (isHorizontal ? position : position) : 'down'}
                />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && <div className="editor-panel__content">{children}</div>}

      {/* Resize Handle */}
      {resizable && !isCollapsed && (
        <div
          className={`editor-panel__resize-handle editor-panel__resize-handle--${getResizeHandlePosition()}`}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
          aria-valuenow={size}
          aria-valuemin={minSize}
          aria-valuemax={maxSize}
        />
      )}
    </div>
  );
}

// Simple chevron icon component
function ChevronIcon({ direction = 'down' }) {
  const rotations = {
    up: 180,
    down: 0,
    left: 90,
    right: -90,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
      style={{ transform: `rotate(${rotations[direction]}deg)`, transition: 'transform 0.2s ease' }}
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

export default EditorPanel;
export { EditorPanel };
