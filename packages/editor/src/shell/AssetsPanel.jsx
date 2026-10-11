/*
 * ---------------------------------------------------------------
 *                     PixoSpritz – Editor – AssetsPanel
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Collapsible assets panel: grouped file list with Add/Import/Delete
 * actions and per-asset export sync indicators. Green dot = in sync
 * with last export, amber = modified since export.
 */

import React, { useState } from 'react';
import './AssetsPanel.css';

/**
 * Assets panel with grouped file list.
 * @param {Object} props
 * @param {Array} props.groups - [{ title, items: [{ id, name, icon, sync }] }]
 * @param {string} props.selectedId - Currently selected asset ID
 * @param {Function} props.onSelect - Called with asset ID when clicked
 * @param {Function} props.onAdd - Add new asset
 * @param {Function} props.onImport - Import files
 * @param {Function} props.onDelete - Delete selected asset
 * @param {Function} props.onClose - Close panel
 * @param {Function} props.onDropFiles - Called with FileList when files are dropped
 */
export function AssetsPanel({
  groups = [],
  selectedId,
  onSelect,
  onAdd,
  onImport,
  onDelete,
  onClose,
  onDropFiles,
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (onDropFiles && e.dataTransfer?.files?.length) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`assets-panel${dragOver ? ' is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="assets-panel__header">
        <span>Assets</span>
        <button
          className="assets-panel__close"
          onClick={onClose}
          title="Close panel"
        >
          ✕
        </button>
      </div>
      <div className="assets-panel__actions">
        <button onClick={onAdd} title="Add new asset">+ Add</button>
        <button onClick={onImport} title="Import files">⤵ Import</button>
        <button onClick={onDelete} title="Delete selected" className="is-danger">
          🗑 Del
        </button>
      </div>
      <div className="assets-panel__list">
        {groups.map(group => (
          <div key={group.title} className="assets-panel__group">
            <div className="assets-panel__group-title">
              {group.title} ({group.items.length})
            </div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`assets-panel__item${selectedId === item.id ? ' is-selected' : ''}`}
                onClick={() => onSelect(item.id)}
                onDoubleClick={() => item.onRename && item.onRename(item.id)}
                title={item.sync === 'ok' ? 'In sync with export' : 'Modified since export'}
              >
                <span className="assets-panel__item-icon">{item.icon}</span>
                <span className="assets-panel__item-name">{item.name}</span>
                <span
                  className={`assets-panel__sync is-${item.sync || 'ok'}`}
                  title={item.sync === 'ok' ? 'In sync' : 'Modified'}
                >
                  ●
                </span>
              </div>
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="assets-panel__empty">
            No assets yet.<br />
            Drop a .zip/.spritz file here,
            <br />
            or click + Add or Import to begin.
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetsPanel;
