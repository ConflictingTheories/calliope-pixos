/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import { useState, useEffect, useRef } from 'react';

/**
 * SceneTest: load a scene and play it, like Unity's Play mode.
 *
 * - Takes a map ID and optional mode
 * - Creates an isolated engine instance
 * - Runs the game loop
 * - Exit returns to editor
 */

export default function SceneTest({ mapId, mode, zip, onClose, onError }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatus('loading');

        // Dynamic import to avoid bundling engine in editor chunk
        const { createEngine } = await import('pixospritz-core/engine/index.js');

        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not available');

        // Create isolated engine instance
        const engine = createEngine({ canvas });
        engineRef.current = engine;

        // Load the map from zip
        const mapPath = `maps/${mapId}/map.json`;
        const mapFile = zip.file(mapPath);
        if (!mapFile) throw new Error(`Map not found: ${mapPath}`);

        const mapJson = JSON.parse(await mapFile.async('string'));

        // Load cells
        const cellsPath = `maps/${mapId}/cells.json`;
        const cellsFile = zip.file(cellsPath);
        const cellsJson = cellsFile ? JSON.parse(await cellsFile.async('string')) : null;

        setStatus('starting');

        // Initialize world with this map
        await engine.world.loadZoneFromZip(mapJson, cellsJson, zip);

        // Set mode if specified
        const targetMode = mode || mapJson.mode || 'explore';
        await engine.world.modeManager.setMode(targetMode);

        // Create avatar
        engine.world.avatarManager.createAvatar();
        engine.world.avatarManager.placeInMap(mapId);

        if (cancelled) {
          engine.destroy();
          return;
        }

        setStatus('running');
        engine.start();

      } catch (e) {
        console.error('SceneTest failed:', e);
        setError(e.message);
        setStatus('error');
        onError?.(e);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (engineRef.current) {
        try {
          engineRef.current.destroy();
        } catch (e) {
          console.warn('SceneTest cleanup failed:', e);
        }
        engineRef.current = null;
      }
    };
  }, [mapId, mode, zip]);

  return (
    <div className="ps-scene-test">
      <div className="ps-scene-test-header">
        <span className="ps-scene-test-title">
          Testing: {mapId}
          {status === 'running' && <span className="ps-badge ps-badge-live">● LIVE</span>}
          {status === 'loading' && <span className="ps-badge">Loading…</span>}
        </span>
        <button className="ps-btn ps-btn-secondary" onClick={onClose}>
          ⏹ Stop
        </button>
      </div>

      <div className="ps-scene-test-body">
        {status === 'error' ? (
          <div className="ps-scene-test-error">
            <h3>Failed to start scene</h3>
            <p>{error}</p>
            <button className="ps-btn ps-btn-secondary" onClick={onClose}>
              Back to Editor
            </button>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="ps-scene-test-canvas"
            width={960}
            height={600}
          />
        )}
      </div>

      {status === 'running' && (
        <div className="ps-scene-test-hint">
          Playing <strong>{mapId}</strong> in <strong>{mode || 'default'}</strong> mode.
          Press <strong>Esc</strong> or click Stop to return to the editor.
        </div>
      )}
    </div>
  );
}
