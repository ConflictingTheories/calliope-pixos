/*
 * ---------------------------------------------------------------
 *             PixoSpritz – Editor – MapCanvas
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-07) Memoized map canvas.  Panel interactions (toolbar,
 * tabs, dialogs) change parent state constantly; the WebGL canvas
 * must not rerender for those.  React.memo with a targeted
 * comparator re-renders only when canvas-relevant inputs change:
 * viewMode, the cells/heights identity, the error banner, or the
 * camera seed.  Handler props are expected to be stable
 * (useCallback) in the parent.
 */

import React from 'react';
import WebGL3DCanvas from '../../shared/WebGL3DCanvas.jsx';

function propsEqual(prev, next) {
  return (
    prev.viewMode === next.viewMode &&
    prev.cells === next.cells &&
    prev.heights === next.heights &&
    prev.error === next.error &&
    prev.cameraSeed === next.cameraSeed &&
    prev.onRender === next.onRender &&
    prev.onInit === next.onInit &&
    prev.onCellClick === next.onCellClick &&
    prev.onCellHover === next.onCellHover
  );
}

export const MapCanvas = React.memo(
  function MapCanvas({
    onRender,
    onInit,
    onCellClick,
    onCellHover,
    viewMode,
    error,
    cells,
    heights,
    cameraSeed,
  }) {
    return (
      <div style={{ flex: 1, position: 'relative', background: '#1e1e1e' }}>
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              background: '#5a1d1d',
              border: '1px solid #be1100',
              borderRadius: '3px',
              padding: '10px',
              zIndex: 100,
              fontSize: '13px',
              color: '#f48771',
            }}
          >
            {error}
          </div>
        )}
        <WebGL3DCanvas
          onRender={onRender}
          onInit={onInit}
          onCellClick={onCellClick}
          onCellHover={onCellHover}
          viewMode={viewMode}
          showControls={false}
          initialCamera={cameraSeed}
        />
      </div>
    );
  },
  propsEqual
);

export default MapCanvas;
