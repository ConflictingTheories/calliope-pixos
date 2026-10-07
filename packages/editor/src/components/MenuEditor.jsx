/**
 * MenuEditor — visual editor for in-game menus.
 *
 * Create and edit menus: main menu, pause menu, inventory, dialog boxes.
 * Menus are defined as JSON and registered with MenuManager.
 */

import { useState } from 'react';

const BLANK_MENU = {
  id: 'main-menu',
  title: 'Main Menu',
  items: [
    { id: 'new-game', label: 'New Game', action: 'new_game' },
    { id: 'continue', label: 'Continue', action: 'continue' },
    { id: 'settings', label: 'Settings', action: 'open_settings' },
  ],
};

const BLANK_ITEM = { id: '', label: '', action: '' };

export default function MenuEditor({ menu: initialMenu, onSave }) {
  const [menu, setMenu] = useState(initialMenu || BLANK_MENU);
  const [selectedItem, setSelectedItem] = useState(0);

  const updateMenu = updates => {
    setMenu({ ...menu, ...updates });
  };

  const updateItem = (index, updates) => {
    const items = [...menu.items];
    items[index] = { ...items[index], ...updates };
    updateMenu({ items });
  };

  const addItem = () => {
    updateMenu({ items: [...menu.items, { ...BLANK_ITEM }] });
    setSelectedItem(menu.items.length);
  };

  const removeItem = index => {
    const items = menu.items.filter((_, i) => i !== index);
    updateMenu({ items });
    setSelectedItem(Math.max(0, selectedItem - 1));
  };

  const moveItem = (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= menu.items.length) return;
    const items = [...menu.items];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateMenu({ items });
    setSelectedItem(newIndex);
  };

  return (
    <div className="menu-editor">
      <div className="menu-editor-header">
        <h2>Menu Editor</h2>
        <button className="btn btn-primary btn-small" onClick={() => onSave?.(menu)}>
          Save Menu
        </button>
      </div>

      <div className="menu-editor-body">
        {/* Menu properties */}
        <div className="menu-props">
          <h3>Menu</h3>
          <label>
            ID
            <input
              type="text"
              value={menu.id}
              onChange={e => updateMenu({ id: e.target.value })}
              className="input"
            />
          </label>
          <label>
            Title
            <input
              type="text"
              value={menu.title}
              onChange={e => updateMenu({ title: e.target.value })}
              className="input"
            />
          </label>
        </div>

        {/* Item list */}
        <div className="menu-items">
          <h3>
            Items
            <button className="btn btn-small btn-secondary" onClick={addItem}>
              + Add
            </button>
          </h3>
          {menu.items.map((item, i) => (
            <div
              key={i}
              className={`menu-item-row ${i === selectedItem ? 'selected' : ''}`}
              onClick={() => setSelectedItem(i)}
            >
              <span className="menu-item-label">{item.label || '(untitled)'}</span>
              <div className="menu-item-actions">
                <button
                  className="btn btn-small"
                  onClick={e => { e.stopPropagation(); moveItem(i, -1); }}
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  className="btn btn-small"
                  onClick={e => { e.stopPropagation(); moveItem(i, 1); }}
                  disabled={i === menu.items.length - 1}
                >
                  ↓
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={e => { e.stopPropagation(); removeItem(i); }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Item editor */}
        {menu.items[selectedItem] && (
          <div className="menu-item-editor">
            <h3>Item</h3>
            <label>
              ID
              <input
                type="text"
                value={menu.items[selectedItem].id}
                onChange={e => updateItem(selectedItem, { id: e.target.value })}
                className="input"
              />
            </label>
            <label>
              Label
              <input
                type="text"
                value={menu.items[selectedItem].label}
                onChange={e => updateItem(selectedItem, { label: e.target.value })}
                className="input"
              />
            </label>
            <label>
              Action
              <input
                type="text"
                value={menu.items[selectedItem].action}
                onChange={e => updateItem(selectedItem, { action: e.target.value })}
                className="input"
                placeholder="e.g. new_game, open_settings"
              />
            </label>
          </div>
        )}

        {/* Preview */}
        <div className="menu-preview">
          <h3>Preview</h3>
          <div className="menu-preview-box">
            <div className="menu-preview-title">{menu.title}</div>
            {menu.items.map((item, i) => (
              <div
                key={i}
                className={`menu-preview-item ${i === selectedItem ? 'selected' : ''}`}
              >
                {item.label || '(untitled)'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
