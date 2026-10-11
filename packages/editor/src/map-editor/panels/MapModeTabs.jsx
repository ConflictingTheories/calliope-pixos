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
import { Button } from '../../ui';
import './MapModeTabs.css';

/**
 * @param {Object} props
 * @param {string} props.editorMode
 * @param {Function} props.onSelectMode
 */
export function MapModeTabs({ editorMode, onSelectMode, cells = [], sprites = [], objects = [], animatedTiles = [], lights = [] }) {
  const setEditorMode = onSelectMode;

  return (
<div className="map-mode-tabs">
  <div className="map-mode-tabs__header">
    🎯 Editor Mode
  </div>
  <div className="map-mode-tabs__list">
    <Button block appearance="default" active={editorMode === 'tiles'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('tiles')}
    >
      <div>🟦 Tile Mode</div>
      <div className="map-mode-tabs__btn-hint">
        Click to paint/erase • {cells.length} x {cells[0]?.length || 0} cells
      </div>
    </Button>
    <Button block appearance="default" active={editorMode === 'sprites'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('sprites')}
    >
      <div>🎭 Sprite Mode</div>
      <div className="map-mode-tabs__btn-hint">
        Click to place • {sprites.length} sprites
      </div>
    </Button>
    <Button block appearance="default" active={editorMode === 'objects'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('objects')}
    >
      <div>📦 Object Mode</div>
      <div className="map-mode-tabs__btn-hint">
        Click to place • {objects.length} objects
      </div>
    </Button>
    <Button block appearance="default" active={editorMode === 'attributes'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('attributes')}
    >
      <div>📝 Attribute Mode</div>
      <div className="map-mode-tabs__btn-hint">
        Click a cell to edit walkable/events
      </div>
    </Button>
    <Button block appearance="default" active={editorMode === 'animatedTiles'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('animatedTiles')}
    >
      <div>✨ Animated Tile Mode</div>
      <div className="map-mode-tabs__btn-hint">
        Click to place • {animatedTiles.length} animated tiles
      </div>
    </Button>
    <Button block appearance="default" active={editorMode === 'triggers'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('triggers')}
    >
      ⚡ Triggers & Scripts
    </Button>
    <Button block appearance="default" active={editorMode === 'lights'}
      className="map-mode-tabs__btn"
      onClick={() => setEditorMode('lights')}
    >
      💡 Lights ({lights.length})
    </Button>
  </div>
</div>

  );
}

export default MapModeTabs;
