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
}) {
  // Legacy prop-name aliases used by the extracted JSX below.
  const setCurrentTool = onSelectTool;
  const setSelectedTile = onSelectTile;
  const setCurrentHeight = onHeightChange;
  const setViewMode = onViewModeChange;
  const undo = onUndo;
  const redo = onRedo;
  const history = { length: historyLength };

  return (
<div
  style={{
    background: '#2d2d30',
    border: '1px solid #3e3e42',
    borderRadius: '4px',
    marginBottom: '20px',
    overflow: 'hidden',
  }}
>
  <div
    style={{
      background: '#37373d',
      padding: '10px',
      fontWeight: 'bold',
      borderBottom: '1px solid #3e3e42',
    }}
  >
    🎨 Tile Tools{' '}
    {editorMode !== 'tiles' && (
      <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>
        (Tile mode only)
      </span>
    )}
  </div>
  <div style={{ padding: '10px', opacity: editorMode === 'tiles' ? 1 : 0.5 }}>
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}
    >
      <Button
        block
        appearance="default"
        active={currentTool === 'paint'}
        disabled={editorMode !== 'tiles'}
        style={{
          background: currentTool === 'paint' ? '#1177bb' : '#0e639c',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
          fontSize: '13px',
        }}
        onClick={() => editorMode === 'tiles' && setCurrentTool('paint')}
        onMouseOver={e => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
        onMouseOut={e =>
          editorMode === 'tiles' &&
          (e.target.style.background = currentTool === 'paint' ? '#1177bb' : '#0e639c')
        }
      >
        🖌️ Paint Tool
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
          Click to paint • Shift+Drag to paint multiple
        </div>
      </Button>
      <Button
        block
        appearance="default"
        active={currentTool === 'erase'}
        disabled={editorMode !== 'tiles'}
        style={{
          background: currentTool === 'erase' ? '#1177bb' : '#0e639c',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
          fontSize: '13px',
        }}
        onClick={() => editorMode === 'tiles' && setCurrentTool('erase')}
        onMouseOver={e => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
        onMouseOut={e =>
          editorMode === 'tiles' &&
          (e.target.style.background = currentTool === 'erase' ? '#1177bb' : '#0e639c')
        }
      >
        🗑️ Erase Tool
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
          Click to erase • Right-click also erases
        </div>
      </Button>
      <Button
        block
        appearance="default"
        active={currentTool === 'pick'}
        disabled={editorMode !== 'tiles'}
        style={{
          background: currentTool === 'pick' ? '#1177bb' : '#0e639c',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
          fontSize: '13px',
        }}
        onClick={() => editorMode === 'tiles' && setCurrentTool('pick')}
        onMouseOver={e => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
        onMouseOut={e =>
          editorMode === 'tiles' &&
          (e.target.style.background = currentTool === 'pick' ? '#1177bb' : '#0e639c')
        }
      >
        🔍 Pick Tool
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
          Click a tile to select it
        </div>
      </Button>
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '5px',
          fontSize: '12px',
          color: '#cccccc',
        }}
      >
        Selected Tile:
      </label>
      <SelectPicker
        data={tileOptions}
        value={selectedTile}
        onChange={v => setSelectedTile(v)}
        cleanable={false}
        block
        style={{
          background: '#3c3c3c',
          color: '#d4d4d4',
          border: '1px solid #3e3e42',
          borderRadius: '3px',
          fontSize: '13px',
          width: '100%',
        }}
      />
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '5px',
          fontSize: '12px',
          color: '#cccccc',
        }}
      >
        Height:
      </label>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <Button
          appearance="default"
          size="sm"
          onClick={() => {
            setCurrentHeight(prev => Math.round((prev - 0.5) * 2) / 2);
          }}
          style={{
            background: '#3e3e42',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          −
        </Button>
        <InputNumber
          value={currentHeight}
          onChange={v => setCurrentHeight(v)}
          step={0.5}
          style={{
            flex: 1,
            background: '#3c3c3c',
            color: '#d4d4d4',
            border: '1px solid #3e3e42',
            borderRadius: '3px',
            fontSize: '13px',
            textAlign: 'center',
          }}
        />
        <Button
          appearance="default"
          size="sm"
          onClick={() => {
            setCurrentHeight(prev => Math.round((prev + 0.5) * 2) / 2);
          }}
          style={{
            background: '#3e3e42',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          +
        </Button>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Button
        block
        appearance="primary"
        onClick={handleSave}
        style={{
          background: '#0e639c',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
        onMouseOver={e => (e.target.style.background = '#1177bb')}
        onMouseOut={e => (e.target.style.background = '#0e639c')}
      >
        💾 Save Changes
      </Button>
      <Button
        block
        appearance="default"
        onClick={undo}
        disabled={historyIndex <= 0}
        style={{
          background: historyIndex <= 0 ? '#3e3e42' : '#0e639c',
          color: historyIndex <= 0 ? '#888' : 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
          fontSize: '13px',
        }}
        onMouseOver={e => {
          if (historyIndex > 0) e.target.style.background = '#1177bb';
        }}
        onMouseOut={e => {
          if (historyIndex > 0) e.target.style.background = '#0e639c';
        }}
      >
        ↶ Undo
      </Button>
      <Button
        block
        appearance="default"
        onClick={redo}
        disabled={historyIndex >= history.length - 1}
        style={{
          background: historyIndex >= history.length - 1 ? '#3e3e42' : '#0e639c',
          color: historyIndex >= history.length - 1 ? '#888' : 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '3px',
          cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
          fontSize: '13px',
        }}
        onMouseOver={e => {
          if (historyIndex < history.length - 1) e.target.style.background = '#1177bb';
        }}
        onMouseOut={e => {
          if (historyIndex < history.length - 1) e.target.style.background = '#0e639c';
        }}
      >
        ↷ Redo
      </Button>
    </div>

    <div style={{ marginTop: '15px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '5px',
          fontSize: '12px',
          color: '#cccccc',
        }}
      >
        View Projection:
      </label>
      <div style={{ display: 'flex', gap: '5px' }}>
        <Button
          appearance="default"
          active={viewMode === '2D'}
          style={{
            flex: 1,
            background: viewMode === '2D' ? '#1177bb' : '#3e3e42',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          onClick={() => setViewMode('2D')}
        >
          📐 2D
        </Button>
        <Button
          appearance="default"
          active={viewMode === '3D'}
          style={{
            flex: 1,
            background: viewMode === '3D' ? '#1177bb' : '#3e3e42',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
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
