/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – mapDocument tests (P3-01)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Golden maps round-trip; malformed cells produce typed issues.
 */

import { describe, it, expect } from 'vitest';
import {
  emptyMap,
  parseMapDocument,
  attachSidecars,
  normalizeMapDocument,
  validateMapDocument,
  serializeMapDocument,
} from '../mapDocument.js';

const GOLDEN = {
  tileset: 'dungeon',
  width: 3,
  height: 2,
  sprites: [{ id: 'hero', x: 1, y: 1 }],
  objects: [],
  cells: [
    [1, 2, 3],
    [4, 5, 6],
  ],
  heights: [
    [0, 0, 1],
    [0, 1, 1],
  ],
};

describe('mapDocument', () => {
  it('round-trips a golden map through the three-file layout', () => {
    const doc = parseMapDocument(JSON.stringify(GOLDEN));
    expect(validateMapDocument(doc)).toEqual([]);
    const files = serializeMapDocument(doc);
    expect(Object.keys(files).sort()).toEqual(['attributes', 'cells.json', 'heights.json', 'map.json']);

    // Reassemble as the app shell does and compare.
    const reassembled = attachSidecars(parseMapDocument(files['map.json']), {
      cellsJson: files['cells.json'],
      heightsJson: files['heights.json'],
    });
    expect(reassembled.cells).toEqual(GOLDEN.cells);
    expect(reassembled.heights).toEqual(GOLDEN.heights);
    expect(reassembled.meta.tileset).toBe('dungeon');
    expect(reassembled.meta.sprites).toHaveLength(1);
  });

  it('accepts the legacy bare-array form', () => {
    const doc = parseMapDocument([[1, 2], [3, 4]]);
    expect(doc.cells).toEqual([[1, 2], [3, 4]]);
    expect(doc.meta.width).toBe(2);
  });

  it('normalizes ragged rows to rectangular grids', () => {
    const doc = normalizeMapDocument({ ...emptyMap(), cells: [[1, 2, 3], [4]] });
    expect(doc.cells[1]).toEqual([4, 0, 0]);
  });

  it('reports typed issues for malformed cells without throwing', () => {
    const doc = parseMapDocument(JSON.stringify({ cells: [[1, undefined], 'nope'] }));
    const issues = validateMapDocument(doc);
    expect(issues.some(i => i.code === 'malformed-row')).toBe(true);
    // Note: functions can't survive JSON.stringify (become null), so pass the object directly
    const badCell = parseMapDocument({ cells: [[() => {}]] });
    expect(validateMapDocument(badCell).some(i => i.code === 'malformed-cell')).toBe(true);
  });

  it('flags invalid JSON as a typed parse issue', () => {
    const doc = parseMapDocument('{oops');
    expect(validateMapDocument(doc).some(i => i.code === 'parse-error')).toBe(true);
  });

  it('warns on heights/cells dimension mismatch', () => {
    const doc = parseMapDocument(JSON.stringify({ cells: [[1, 2]], heights: [[1]] }));
    // normalizeMapDocument repairs heights; construct mismatch post-normalization
    doc.heights = [[1, 2, 3]];
    expect(validateMapDocument(doc).some(i => i.code === 'heights-mismatch')).toBe(true);
  });

  it('attaches sidecars and reports corrupt ones', () => {
    const doc = attachSidecars(parseMapDocument('{"tileset":"t"}'), { cellsJson: '[[9]]', heightsJson: 'nope' });
    expect(doc.cells).toEqual([[9]]);
    expect(validateMapDocument(doc).every(i => i.severity !== 'error')).toBe(true);
    expect(doc.meta.heightsParseError).toBe('invalid heights.json');
  });
});
