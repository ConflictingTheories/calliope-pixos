/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – ContextMenu Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A right-click context menu component.
 * 
 * Usage:
 *   const { showMenu, hideMenu, ContextMenu: Menu } = useContextMenu();
 *   
 *   <div onContextMenu={(e) => showMenu(e, menuItems)}>
 *     Right click me
 *   </div>
 *   <Menu />
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/context-menu.css';

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Unique item ID
 * @property {string} label - Display label
 * @property {React.ReactNode} [icon] - Icon element
 * @property {string} [shortcut] - Keyboard shortcut display
 * @property {function} [onClick] - Click handler
 * @property {boolean} [disabled] - Whether item is disabled
 * @property {boolean} [separator] - If true, render as separator
 * @property {MenuItem[]} [submenu] - Nested submenu items
 */

/**
 * ContextMenu - Right-click menu component
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether menu is visible
 * @param {number} props.x - X position
 * @param {number} props.y - Y position
 * @param {MenuItem[]} props.items - Menu items
 * @param {function} props.onClose - Callback to close menu
 * @param {string} [props.className] - Additional CSS classes
 */
function ContextMenu({
  visible,
  x,
  y,
  items = [],
  onClose,
  className = ''
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const padding = 8;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + rect.width > window.innerWidth - padding) {
      adjustedX = window.innerWidth - rect.width - padding;
    }

    // Adjust vertical position
    if (y + rect.height > window.innerHeight - padding) {
      adjustedY = window.innerHeight - rect.height - padding;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [visible, x, y]);

  // Close on click outside
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // Handle item click
  const handleItemClick = useCallback((item, e) => {
    e.stopPropagation();
    if (item.disabled || item.separator) return;
    
    item.onClick?.();
    if (!item.submenu) {
      onClose?.();
    }
  }, [onClose]);

  // Handle submenu hover
  const handleSubmenuHover = useCallback((itemId) => {
    setActiveSubmenu(itemId);
  }, []);

  if (!visible) return null;

  const menuContent = (
    <div
      ref={menuRef}
      className={`context-menu ${className}`}
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={item.id || index} className="context-menu__separator" />;
        }

        const hasSubmenu = item.submenu && item.submenu.length > 0;

        return (
          <div
            key={item.id || index}
            className={`context-menu__item ${item.disabled ? 'context-menu__item--disabled' : ''} ${hasSubmenu ? 'context-menu__item--has-submenu' : ''}`}
            onClick={(e) => handleItemClick(item, e)}
            onMouseEnter={() => hasSubmenu && handleSubmenuHover(item.id)}
            onMouseLeave={() => hasSubmenu && handleSubmenuHover(null)}
            role="menuitem"
            aria-disabled={item.disabled}
          >
            {item.icon && <span className="context-menu__icon">{item.icon}</span>}
            <span className="context-menu__label">{item.label}</span>
            {item.shortcut && <span className="context-menu__shortcut">{item.shortcut}</span>}
            {hasSubmenu && <span className="context-menu__arrow"><ChevronRightIcon /></span>}
            
            {/* Submenu */}
            {hasSubmenu && activeSubmenu === item.id && (
              <div className="context-menu__submenu">
                {item.submenu.map((subItem, subIndex) => {
                  if (subItem.separator) {
                    return <div key={subItem.id || subIndex} className="context-menu__separator" />;
                  }

                  return (
                    <div
                      key={subItem.id || subIndex}
                      className={`context-menu__item ${subItem.disabled ? 'context-menu__item--disabled' : ''}`}
                      onClick={(e) => handleItemClick(subItem, e)}
                      role="menuitem"
                      aria-disabled={subItem.disabled}
                    >
                      {subItem.icon && <span className="context-menu__icon">{subItem.icon}</span>}
                      <span className="context-menu__label">{subItem.label}</span>
                      {subItem.shortcut && <span className="context-menu__shortcut">{subItem.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return createPortal(menuContent, document.body);
}

// Chevron right icon for submenus
function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  );
}

/**
 * useContextMenu - Hook to manage context menu state
 * 
 * @returns {{
 *   visible: boolean,
 *   position: {x: number, y: number},
 *   items: MenuItem[],
 *   showMenu: (event: MouseEvent, items: MenuItem[]) => void,
 *   hideMenu: () => void,
 *   ContextMenuComponent: React.FC
 * }}
 */
export function useContextMenu() {
  const [state, setState] = useState({
    visible: false,
    x: 0,
    y: 0,
    items: []
  });

  const showMenu = useCallback((event, items) => {
    event.preventDefault();
    event.stopPropagation();
    setState({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items
    });
  }, []);

  const hideMenu = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const ContextMenuComponent = useCallback(() => (
    <ContextMenu
      visible={state.visible}
      x={state.x}
      y={state.y}
      items={state.items}
      onClose={hideMenu}
    />
  ), [state, hideMenu]);

  return {
    visible: state.visible,
    position: { x: state.x, y: state.y },
    items: state.items,
    showMenu,
    hideMenu,
    ContextMenuComponent
  };
}

export default ContextMenu;
export { ContextMenu };
