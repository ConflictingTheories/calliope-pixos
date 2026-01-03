/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – LayerPanel Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A layer hierarchy panel for managing layers in editors.
 * Supports drag-and-drop reordering, visibility toggle, and locking.
 * 
 * Usage:
 *   <LayerPanel
 *     layers={layers}
 *     selectedLayerId={selectedId}
 *     onSelect={handleSelect}
 *     onReorder={handleReorder}
 *     onVisibilityToggle={handleVisibility}
 *     onLockToggle={handleLock}
 *     onAdd={handleAdd}
 *     onDelete={handleDelete}
 *   />
 */

import React, { useState, useCallback, useRef } from 'react';
import '../styles/layer-panel.css';

/**
 * @typedef {Object} Layer
 * @property {string|number} id - Unique layer identifier
 * @property {string} name - Layer display name
 * @property {boolean} [visible=true] - Whether layer is visible
 * @property {boolean} [locked=false] - Whether layer is locked
 * @property {string} [icon] - Optional icon component or emoji
 * @property {string} [color] - Optional color indicator
 * @property {number} [opacity=1] - Layer opacity (0-1)
 */

/**
 * LayerPanel - Layer hierarchy management component
 * 
 * @param {Object} props
 * @param {string} [props.title='Layers'] - Panel title
 * @param {Layer[]} props.layers - Array of layer objects
 * @param {string|number} [props.selectedLayerId] - Currently selected layer ID
 * @param {function} props.onSelect - Callback when layer is selected
 * @param {function} [props.onReorder] - Callback when layers are reordered (newOrder)
 * @param {function} [props.onVisibilityToggle] - Callback when visibility is toggled (id, visible)
 * @param {function} [props.onLockToggle] - Callback when lock is toggled (id, locked)
 * @param {function} [props.onOpacityChange] - Callback when opacity changes (id, opacity)
 * @param {function} [props.onRename] - Callback when layer is renamed (id, newName)
 * @param {function} [props.onAdd] - Callback to add new layer
 * @param {function} [props.onDelete] - Callback to delete layer (id)
 * @param {function} [props.onDuplicate] - Callback to duplicate layer (id)
 * @param {boolean} [props.allowReorder=true] - Enable drag-and-drop reordering
 * @param {string} [props.className] - Additional CSS classes
 */
function LayerPanel({
  title = 'Layers',
  layers = [],
  selectedLayerId,
  onSelect,
  onReorder,
  onVisibilityToggle,
  onLockToggle,
  onOpacityChange,
  onRename,
  onAdd,
  onDelete,
  onDuplicate,
  allowReorder = true,
  className = ''
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const dragNodeRef = useRef(null);

  // Handle drag start
  const handleDragStart = useCallback((e, layer) => {
    if (!allowReorder) return;
    setDraggedId(layer.id);
    dragNodeRef.current = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layer.id);

    // Add dragging class after a tick to avoid it being included in drag image
    setTimeout(() => {
      e.target.classList.add('layer-item--dragging');
    }, 0);
  }, [allowReorder]);

  // Handle drag over
  const handleDragOver = useCallback((e, layer) => {
    e.preventDefault();
    if (!allowReorder || layer.id === draggedId) return;
    setDragOverId(layer.id);
  }, [allowReorder, draggedId]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, targetLayer) => {
    e.preventDefault();
    if (!allowReorder || !draggedId || draggedId === targetLayer.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = layers.findIndex(l => l.id === draggedId);
    const targetIndex = layers.findIndex(l => l.id === targetLayer.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...layers];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, removed);
      onReorder?.(newOrder);
    }

    setDraggedId(null);
    setDragOverId(null);
  }, [allowReorder, draggedId, layers, onReorder]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('layer-item--dragging');
    }
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  // Start editing layer name
  const startEditing = useCallback((layer) => {
    setEditingId(layer.id);
    setEditingName(layer.name);
  }, []);

  // Save edited name
  const saveEditing = useCallback(() => {
    if (editingId && editingName.trim()) {
      onRename?.(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, onRename]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingName('');
  }, []);

  // Handle name input keydown
  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }, [saveEditing, cancelEditing]);

  return (
    <div className={`layer-panel ${className}`}>
      {/* Header */}
      <div className="layer-panel__header">
        <span className="layer-panel__title">{title}</span>
        <div className="layer-panel__actions">
          {onAdd && (
            <button
              className="layer-panel__action"
              onClick={onAdd}
              title="Add Layer"
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="layer-panel__list">
        {layers.length === 0 ? (
          <div className="layer-panel__empty">No layers</div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`layer-item ${selectedLayerId === layer.id ? 'layer-item--selected' : ''} ${dragOverId === layer.id ? 'layer-item--drag-over' : ''}`}
              draggable={allowReorder && !layer.locked}
              onDragStart={(e) => handleDragStart(e, layer)}
              onDragOver={(e) => handleDragOver(e, layer)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, layer)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelect?.(layer.id)}
              onDoubleClick={() => onRename && startEditing(layer)}
            >
              {/* Drag Handle */}
              {allowReorder && (
                <span className="layer-item__drag-handle">
                  <DragHandleIcon />
                </span>
              )}

              {/* Visibility Toggle */}
              {onVisibilityToggle && (
                <button
                  className={`layer-item__visibility ${layer.visible !== false ? 'layer-item__visibility--visible' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVisibilityToggle(layer.id, layer.visible === false);
                  }}
                  title={layer.visible !== false ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible !== false ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              )}

              {/* Color Indicator */}
              {layer.color && (
                <span
                  className="layer-item__color"
                  style={{ backgroundColor: layer.color }}
                />
              )}

              {/* Layer Name */}
              <div className="layer-item__name">
                {editingId === layer.id ? (
                  <input
                    type="text"
                    className="layer-item__name-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="layer-item__name-text">{layer.name}</span>
                )}
              </div>

              {/* Lock Toggle */}
              {onLockToggle && (
                <button
                  className={`layer-item__lock ${layer.locked ? 'layer-item__lock--locked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockToggle(layer.id, !layer.locked);
                  }}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <LockIcon /> : <UnlockIcon />}
                </button>
              )}

              {/* Delete Button */}
              {onDelete && (
                <button
                  className="layer-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(layer.id);
                  }}
                  title="Delete Layer"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Icon components
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

export default LayerPanel;
export { LayerPanel };
