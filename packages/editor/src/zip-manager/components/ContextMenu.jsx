import './styles/ContextMenu.css';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Context Menu Component
 * Provides right-click menu functionality for file entries
 */
function ContextMenu({
  visible,
  x,
  y,
  entry,
  highlightedEntries,
  disabledCopy,
  disabledCut,
  disabledPaste,
  disabledExtract,
  disabledRename,
  disabledDelete,
  onClose,
  onOpen,
  onCopy,
  onCut,
  onPaste,
  onExtract,
  onRename,
  onDelete,
  onDownload,
  messages,
}) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // Adjust position to keep menu in viewport
  const getAdjustedPosition = useCallback(() => {
    if (!menuRef.current) return { left: x, top: y };
    
    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }
    
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }
    
    return { left: Math.max(10, adjustedX), top: Math.max(10, adjustedY) };
  }, [x, y]);

  if (!visible) return null;

  const position = getAdjustedPosition();
  const multipleSelected = highlightedEntries && highlightedEntries.length > 1;
  const isDirectory = entry?.directory;
  const selectionLabel = multipleSelected 
    ? `${highlightedEntries.length} items selected` 
    : (entry?.name || 'No selection');

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ left: position.left, top: position.top }}
      role="menu"
      aria-label="Context menu"
    >
      <div className="context-menu__header">
        <span className="context-menu__selection">{selectionLabel}</span>
      </div>
      
      <div className="context-menu__divider" />
      
      {/* Primary Actions */}
      <button 
        className="context-menu__item"
        onClick={() => { onOpen(); onClose(); }}
        disabled={!entry || multipleSelected}
        role="menuitem"
      >
        <span className="context-menu__icon">📂</span>
        <span className="context-menu__label">{isDirectory ? 'Open Folder' : 'Open File'}</span>
        <span className="context-menu__shortcut">Enter</span>
      </button>

      {!isDirectory && (
        <button 
          className="context-menu__item"
          onClick={() => { onDownload(); onClose(); }}
          disabled={!entry || disabledExtract}
          role="menuitem"
        >
          <span className="context-menu__icon">💾</span>
          <span className="context-menu__label">Download</span>
        </button>
      )}
      
      <div className="context-menu__divider" />
      
      {/* Edit Actions */}
      <button 
        className="context-menu__item"
        onClick={() => { onCopy(); onClose(); }}
        disabled={disabledCopy}
        role="menuitem"
      >
        <span className="context-menu__icon">📋</span>
        <span className="context-menu__label">Copy</span>
        <span className="context-menu__shortcut">⌘C</span>
      </button>
      
      <button 
        className="context-menu__item"
        onClick={() => { onCut(); onClose(); }}
        disabled={disabledCut}
        role="menuitem"
      >
        <span className="context-menu__icon">✂️</span>
        <span className="context-menu__label">Cut</span>
        <span className="context-menu__shortcut">⌘X</span>
      </button>
      
      <button 
        className="context-menu__item"
        onClick={() => { onPaste(); onClose(); }}
        disabled={disabledPaste}
        role="menuitem"
      >
        <span className="context-menu__icon">📄</span>
        <span className="context-menu__label">Paste</span>
        <span className="context-menu__shortcut">⌘V</span>
      </button>
      
      <div className="context-menu__divider" />
      
      {/* File Management */}
      <button 
        className="context-menu__item"
        onClick={() => { onRename(); onClose(); }}
        disabled={disabledRename}
        role="menuitem"
      >
        <span className="context-menu__icon">✏️</span>
        <span className="context-menu__label">Rename</span>
        <span className="context-menu__shortcut">F2</span>
      </button>
      
      <button 
        className="context-menu__item context-menu__item--danger"
        onClick={() => { onDelete(); onClose(); }}
        disabled={disabledDelete}
        role="menuitem"
      >
        <span className="context-menu__icon">🗑️</span>
        <span className="context-menu__label">Delete</span>
        <span className="context-menu__shortcut">⌫</span>
      </button>
    </div>
  );
}

export default ContextMenu;
