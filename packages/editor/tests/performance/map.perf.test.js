/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – map perf tests (P3-11)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 */

import { describe, it } from 'vitest';
import {
  parseMapDocument,
  attachSidecars,
  serializeMapDocument,
} from '../../src/map-editor/model/mapDocument.js';
import { MapViewport } from '../../src/map-editor/viewport/mapViewport.js';
import { pickCell } from '../../src/map-editor/picking/pick.js';
import { ChunkManager } from '../../src/map-editor/render/chunks/chunkManager.js';
import { expectWithinBudget } from './budgets.js';

const W = 128;
const H = 128;

function makeTrio() {
  const cells = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => ((x + y) % 4 === 0 ? 1 : 0))
  );
  const heights = Array.from({ length: H }, () => Array(W).fill(0));
  return {
    mapJson: JSON.stringify({ width: W, height: H, tileSize: 16 }),
    cellsJson: JSON.stringify(cells),
    heightsJson: JSON.stringify(heights),
  };
}

describe('map performance', () => {
  it('round-trips a 128x128 trio within budget', () => {
    const { mapJson, cellsJson, heightsJson } = makeTrio();
    expectWithinBudget('map.document.roundTrip', () => {
      const doc = attachSidecars(parseMapDocument(mapJson), { cellsJson, heightsJson });
      serializeMapDocument(doc);
    });
  });

  it('performs 10k O(1) picks within budget', () => {
    const viewport = new MapViewport({ width: 800, height: 600 });
    viewport.setZoom(2);
    expectWithinBudget('map.pick.10k', () => {
      for (let i = 0; i < 10000; i++) {
        pickCell(viewport, 100 + (i % 700), 100 + (i % 500), { width: W, height: H });
      }
    });
  });

  it('applies 10k dirty-cell chunk updates within budget', () => {
    const cm = new ChunkManager({
      buildMesh: () => ({ verts: 0 }),
      uploadMesh: () => {},
      releaseMesh: () => {},
    });
    expectWithinBudget('map.chunks.10kDirty', () => {
      for (let i = 0; i < 10000; i++) {
        cm.dirtyCell(i % W, (i * 7) % H);
      }
      cm.update({ x0: 0, y0: 0, x1: W * 16, y1: H * 16 }, 16);
    });
  });
});
