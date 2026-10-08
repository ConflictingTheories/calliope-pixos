/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – MapToolbar
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-07) Map tool panel extracted from UnifiedMapEditor.jsx.
 * Connected via explicit props (selectors) so panel interaction
 * does not rerender the canvas: the canvas lives in the memoized
 * MapCanvas component.
 */

import React from 'react';
import { Button, SelectPicker, InputNumber } from '../../ui';
import './MapToolbar.css';

/**
 * @param {Object} props
 * @param {string} props.editorMode
 * @param {string} props.currentTool
 * @param {Function} props.onSelectTool
 * @param {string} props.selectedTile
 * @param {Function} props.onSelectTile
 * @param {Array} props.tileOptions
 * @param {number} props.currentHeight
 * @param {Function} props.onHeightChange
 * @param {Function} props.onUndo
 * @param {Function} props.onRedo
 * @param {boolean} props.canUndo
 * @param {boolean} props.canRedo
 * @param {number} props.historyIndex
 * @param {number} props.historyLength
 * @param {string} props.viewMode
 * @param {Function} props.onViewModeChange
 */
export function MapToolbar({
  editorMode,
  currentTool,
  onSelectTool,
  selectedTile,
  onSelectTile,
  tileOptions,
  currentHeight,
  onHeightChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  historyIndex,
  historyLength,
  viewMode,
  onViewModeChange,
  onSave,
}) {
  // Legacy prop-name aliases used by the extracted JSX below.
  const setCurrentTool = onSelectTool;
  const setSelectedTile = onSelectTile;
  const setCurrentHeight = onHeightChange;
  const setViewMode = onViewModeChange;
  const undo = onUndo;
  const redo = onRedo;
  const history = { length: historyLength };
  const handleSave = onSave;

  return (
<div className="map-toolbar">
  <div className="map-toolbar__header">
    🎨 Tile Tools{' '}
    {editorMode !== 'tiles' && (
      <span className="map-toolbar__header-hint">
        (Tile mode only)
      </span>
    )}
  </div>
  <div className={`map-toolbar__body${editorMode === 'tiles' ? '' : ' map-toolbar__body--dimmed'}`}>
    <div className="map-toolbar__tool-group">
      <Button
        block
        appearance="default"
        active={currentTool === 'paint'}
        disabled={editorMode !== 'tiles'}
        className="map-toolbar__tool-btn"
        onClick={() => editorMode === 'tiles' && setCurrentTool('paint')}
      >
        🖌️ Paint Tool
        <div className="map-toolbar__tool-hint">
          Click to paint • Shift+Drag to paint multiple
        </div>
      </Button>
      <Button
        block
        appearance="default"
        active={currentTool === 'erase'}
        disabled={editorMode !== 'tiles'}
        className="map-toolbar__tool-btn"
        onClick={() => editorMode === 'tiles' && setCurrentTool('erase')}
      >
        🗑️ Erase Tool
        <div className="map-toolbar__tool-hint">
          Click to erase • Right-click also erases
        </div>
      </Button>
      <Button
        block
        appearance="default"
        active={currentTool === 'pick'}
        disabled={editorMode !== 'tiles'}
        className="map-toolbar__tool-btn"
        onClick={() => editorMode === 'tiles' && setCurrentTool('pick')}
      >
        🔍 Pick Tool
        <div className="map-toolbar__tool-hint">
          Click a tile to select it
        </div>
      </Button>
    </div>

    <div className="map-toolbar__field">
      <label className="map-toolbar__label">
        Selected Tile:
      </label>
      <SelectPicker
        data={tileOptions}
        value={selectedTile}
        onChange={v => setSelectedTile(v)}
        cleanable={false}
        block
      />
    </div>

    <div className="map-toolbar__field">
      <label className="map-toolbar__label">
        Height:
      </label>
      <div className="map-toolbar__row">
        <Button
          appearance="default"
          size="sm"
          onClick={() => {
            setCurrentHeight(prev => Math.round((prev - 0.5) * 2) / 2);
          }}
        >
          −
        </Button>
        <InputNumber
          value={currentHeight}
          onChange={v => setCurrentHeight(v)}
          step={0.5}
        />
        <Button
          appearance="default"
          size="sm"
          onClick={() => {
            setCurrentHeight(prev => Math.round((prev + 0.5) * 2) / 2);
          }}
        >
          +
        </Button>
      </div>
    </div>

    <div className="map-toolbar__actions">
      <Button
        block
        appearance="primary"
        onClick={handleSave}
      >
        💾 Save Changes
      </Button>
      <Button
        block
        appearance="default"
        onClick={undo}
        disabled={historyIndex <= 0}
      >
        ↶ Undo
      </Button>
      <Button
        block
        appearance="default"
        onClick={redo}
        disabled={historyIndex >= history.length - 1}
      >
        ↷ Redo
      </Button>
    </div>

    <div className="map-toolbar__section">
      <label className="map-toolbar__label">
        View Projection:
      </label>
      <div className="map-toolbar__view-toggle">
        <Button
          appearance="default"
          active={viewMode === '2D'}
          onClick={() => setViewMode('2D')}
        >
          📐 2D
        </Button>
        <Button
          appearance="default"
          active={viewMode === '3D'}
          onClick={() => setViewMode('3D')}
        >
          🧊 3D
        </Button>
      </div>
    </div>
  </div>
</div>

  );
}

export default MapToolbar;
