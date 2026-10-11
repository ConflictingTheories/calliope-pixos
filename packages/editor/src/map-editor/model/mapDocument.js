/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – Map document adapter
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-01) The map document model, extracted from
 * UnifiedMapEditor.jsx.  Parsing, normalization, serialization and
 * semantic checks live here — framework-free and testable.  The
 * adapter handles the editor's three-file map layout:
 *   map.json     metadata (tileset, sprites, objects, lights, …)
 *   cells.json   2D tile grid
 *   heights.json 2D height grid (optional)
 * as well as the legacy single-blob form ({cells, ...meta}).
 */

/**
 * @typedef {Object} MapDocument
 * @property {Object} meta
 * @property {Array<Array<*>>} cells
 * @property {Array<Array<number>>} heights
 * @property {Array} attributes
 */

export function emptyMap(width = 16, height = 16) {
  return {
    meta: { width, height, tileset: null, sprites: [], objects: [], lights: [], animatedTiles: [] },
    cells: Array.from({ length: height }, () => Array(width).fill(0)),
    heights: Array.from({ length: height }, () => Array(width).fill(0)),
    attributes: [],
  };
}

/**
 * Parse the `content` prop shapes accepted by UnifiedMapEditor into a
 * normalized MapDocument.  Never throws for malformed input — issues
 * are reported via validate().
 * @param {string|Object|Array} content
 * @returns {MapDocument}
 */
export function parseMapDocument(content) {
  const doc = emptyMap();
  if (content == null) return doc;

  let data = content;
  if (typeof content === 'string') {
    try {
      data = JSON.parse(content);
    } catch {
      doc.meta.parseError = 'invalid JSON';
      return doc;
    }
  }

  if (Array.isArray(data)) {
    doc.cells = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.cells)) doc.cells = data.cells;
    if (Array.isArray(data.heights)) doc.heights = data.heights;
    if (Array.isArray(data.attributes)) doc.attributes = data.attributes;
    const { cells, heights, attributes, ...meta } = data;
    doc.meta = { ...doc.meta, ...meta };
  }

  return normalizeMapDocument(doc);
}

/**
 * Attach the sidecar files (cells.json / heights.json) produced by
 * the app-level save path.
 */
export function attachSidecars(doc, { cellsJson, heightsJson } = {}) {
  if (typeof cellsJson === 'string') {
    try {
      const cells = JSON.parse(cellsJson);
      if (Array.isArray(cells)) doc.cells = cells;
    } catch {
      doc.meta.cellsParseError = 'invalid cells.json';
    }
  }
  if (typeof heightsJson === 'string') {
    try {
      const heights = JSON.parse(heightsJson);
      if (Array.isArray(heights)) doc.heights = heights;
    } catch {
      doc.meta.heightsParseError = 'invalid heights.json';
    }
  }
  return normalizeMapDocument(doc);
}

/** Ensure rectangular grids and coherent dimensions. */
export function normalizeMapDocument(doc) {
  const height = doc.cells.length;
  const width = height > 0 ? Math.max(...doc.cells.map(r => (Array.isArray(r) ? r.length : 0))) : 0;
  doc.cells = doc.cells.map(row => {
    // Preserve non-array rows so validateMapDocument can flag malformed-row
    if (!Array.isArray(row)) return row;
    const r = row.slice();
    while (r.length < width) r.push(0);
    return r.slice(0, width);
  });
  if (doc.heights.length !== height) {
    doc.heights = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => doc.heights[y]?.[x] ?? 0)
    );
  }
  doc.meta.width = width;
  doc.meta.height = height;
  if (!Array.isArray(doc.meta.sprites)) doc.meta.sprites = [];
  if (!Array.isArray(doc.meta.objects)) doc.meta.objects = [];
  if (!Array.isArray(doc.meta.lights)) doc.meta.lights = [];
  if (!Array.isArray(doc.meta.animatedTiles)) doc.meta.animatedTiles = [];
  return doc;
}

/**
 * Typed semantic checks.  Malformed cells produce typed issues
 * instead of exceptions.
 * @returns {Array<{severity:string, code:string, message:string, at?:string}>}
 */
export function validateMapDocument(doc) {
  const issues = [];
  if (doc.meta.parseError) {
    issues.push({ severity: 'error', code: 'parse-error', message: doc.meta.parseError });
  }
  const { width, height } = doc.meta;
  doc.cells.forEach((row, y) => {
    if (!Array.isArray(row)) {
      issues.push({ severity: 'error', code: 'malformed-row', message: `row ${y} is not an array`, at: `cells[${y}]` });
      return;
    }
    if (row.length !== width) {
      issues.push({ severity: 'warning', code: 'ragged-row', message: `row ${y} has ${row.length} cells, expected ${width}`, at: `cells[${y}]` });
    }
    row.forEach((cell, x) => {
      if (cell !== null && typeof cell !== 'number' && typeof cell !== 'string' && typeof cell !== 'object') {
        issues.push({ severity: 'error', code: 'malformed-cell', message: `cell (${x},${y}) has unsupported type`, at: `cells[${y}][${x}]` });
      }
    });
  });
  if (doc.heights.length && (doc.heights.length !== height || doc.heights.some(r => r.length !== width))) {
    issues.push({ severity: 'warning', code: 'heights-mismatch', message: 'heights grid dimensions differ from cells' });
  }
  return issues;
}

/** Split into the three-file save layout used by the app shell. */
export function serializeMapDocument(doc) {
  const { cells, heights, attributes, meta } = normalizeMapDocument({ ...doc, meta: { ...doc.meta } });
  const metaOut = { ...meta };
  delete metaOut.parseError;
  delete metaOut.cellsParseError;
  delete metaOut.heightsParseError;
  return {
    'map.json': `${JSON.stringify(metaOut, null, 2)}\n`,
    'cells.json': `${JSON.stringify(cells)}\n`,
    'heights.json': `${JSON.stringify(heights)}\n`,
    attributes,
  };
}

/** DocumentRegistry adapter descriptor for kind 'map'. */
export const mapDocumentAdapter = {
  kind: 'map',
  load: raw => parseMapDocument(typeof raw === 'string' ? raw : new TextDecoder().decode(raw)),
  migrate: doc => normalizeMapDocument(doc),
  validate: validateMapDocument,
  serialize: doc => serializeMapDocument(doc)['map.json'],
};
