/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – MapModeTabs
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-07) Editor-mode tab strip extracted from
 * UnifiedMapEditor.jsx.  Connected via explicit props.
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.editorMode
 * @param {Function} props.onSelectMode
 */
export function MapModeTabs({ editorMode, onSelectMode }) {
  const setEditorMode = onSelectMode;

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
    🎯 Editor Mode
  </div>
  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <button
      style={{
        background: editorMode === 'tiles' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('tiles')}
    >
      <div>🟦 Tile Mode</div>
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
        Click to paint/erase • {cells.length} x {cells[0]?.length || 0} cells
      </div>
    </button>
    <button
      style={{
        background: editorMode === 'sprites' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('sprites')}
    >
      <div>🎭 Sprite Mode</div>
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
        Click to place • {sprites.length} sprites
      </div>
    </button>
    <button
      style={{
        background: editorMode === 'objects' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('objects')}
    >
      <div>📦 Object Mode</div>
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
        Click to place • {objects.length} objects
      </div>
    </button>
    <button
      style={{
        background: editorMode === 'attributes' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('attributes')}
    >
      <div>📝 Attribute Mode</div>
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
        Click a cell to edit walkable/events
      </div>
    </button>
    <button
      style={{
        background: editorMode === 'animatedTiles' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('animatedTiles')}
    >
      <div>✨ Animated Tile Mode</div>
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
        Click to place • {animatedTiles.length} animated tiles
      </div>
    </button>
    <button
      style={{
        background: editorMode === 'triggers' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('triggers')}
    >
      ⚡ Triggers & Scripts
    </button>
    <button
      style={{
        background: editorMode === 'lights' ? '#1177bb' : '#3e3e42',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
      onClick={() => setEditorMode('lights')}
    >
      💡 Lights ({lights.length})
    </button>
  </div>
</div>

  );
}

export default MapModeTabs;
