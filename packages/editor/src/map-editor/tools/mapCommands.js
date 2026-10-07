/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – Map commands
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-06) Map tools (paint, erase, fill, height, object edits)
 * emit transactional EditorCommands instead of mutating state
 * directly.  Every command records per-cell before-values for
 * exact undo and reports its dirty range for the chunk manager
 * (P3-04).
 *
 * Commands operate through a cell-accessor interface so they stay
 * independent of React and of the concrete map document shape:
 *
 *   cells: {
 *     get(x, y, layer) -> value,
 *     set(x, y, layer, value) -> void,
 *     path: string              // document path for the CommandBus
 *   }
 */

/**
 * Build a paint/erase command from a resolved cell list.
 * Each entry: {x, y, layer, before, after}.
 */
export function paintCellsCommand(cells, { label = 'paint' } = {}) {
  const list = cells.filter(c => c.before !== c.after);
  const xs = list.map(c => c.x);
  const ys = list.map(c => c.y);
  const dirtyRange =
    list.length === 0
      ? null
      : { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };

  return {
    name: 'map.paintCells',
    documents: [], // filled by bindToDocument
    label,
    dirtyRange,
    cellCount: list.length,
    bytes: list.length * 40,
    do: ({ services }) => {
      const cells = services.get('cells');
      for (const c of list) cells.set(c.x, c.y, c.layer ?? 0, c.after);
    },
    undo: ({ services }) => {
      const cells = services.get('cells');
      for (const c of list) cells.set(c.x, c.y, c.layer ?? 0, c.before);
    },
    /** Bind the document path once the store document is known. */
    bindToDocument(path) {
      return { ...this, documents: [path] };
    },
  };
}

/** Erase is paint-with-empty, kept as a named command for the palette. */
export function eraseCellsCommand(cells, options = {}) {
  const cmd = paintCellsCommand(
    cells.map(c => ({ ...c, after: 0 })),
    { ...options, label: options.label || 'erase' }
  );
  return { ...cmd, name: 'map.eraseCells' };
}

/**
 * Flood fill from (x, y): computes the region with the FloodFill
 * algorithm over `get`, then delegates to paintCellsCommand.
 */
export function fillCommand(startX, startY, layer, value, get, { width, height, label = 'fill' } = {}) {
  const target = get(startX, startY, layer);
  if (target === value) return null; // no-op
  const seen = new Set();
  const stack = [[startX, startY]];
  const region = [];
  const key = (x, y) => `${x},${y}`;
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const k = key(x, y);
    if (seen.has(k)) continue;
    seen.add(k);
    if (get(x, y, layer) !== target) continue;
    region.push({ x, y, layer, before: target, after: value });
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  if (region.length === 0) return null;
  const cmd = paintCellsCommand(region, { label });
  return { ...cmd, name: 'map.fill' };
}

/**
 * Height edit command (per-cell numeric delta with inverse).
 */
export function heightCommand(cells, { label = 'height' } = {}) {
  const cmd = paintCellsCommand(cells, { label });
  return { ...cmd, name: 'map.height' };
}

/**
 * Adapt a legacy tool (BaseTool subclass returning {cells:[...]})
 * into a command emitter: run the tool's onStart/onMove/onEnd over a
 * stroke, accumulate with createStrokeAccumulator semantics, and
 * produce ONE command.
 *
 * @param {Object} tool            legacy tool instance
 * @param {Array<{x,y}>} stroke    pointer positions (grid cells)
 * @param {Object} mapData         current map data (for tool callbacks)
 * @param {Object} options         tool options (layer, selectedTile…)
 * @param {(x:number,y:number,layer:number)=>*} getBefore
 */
export function toolStrokeToCommand(tool, stroke, mapData, options, getBefore) {
  const merged = new Map();
  const layer = options.layer ?? 0;
  const applyPoint = (x, y, phase) => {
    const fn = phase === 'start' ? tool.onStart.bind(tool) : phase === 'end' ? tool.onEnd.bind(tool) : tool.onMove.bind(tool);
    const result = fn(x, y, mapData, options);
    const cells = result && result.cells ? result.cells : [];
    for (const c of cells) {
      const k = `${layer}:${c.x},${c.y}`;
      const prev = merged.get(k);
      merged.set(k, {
        x: c.x,
        y: c.y,
        layer,
        before: prev ? prev.before : getBefore(c.x, c.y, layer),
        after: c.tile !== undefined ? c.tile : c.value,
      });
    }
  };
  stroke.forEach((p, i) => applyPoint(p.x, p.y, i === 0 ? 'start' : 'move'));
  if (stroke.length > 0) {
    const last = stroke[stroke.length - 1];
    applyPoint(last.x, last.y, 'end');
  }
  const list = [...merged.values()].filter(c => c.after !== undefined && c.before !== c.after);
  if (list.length === 0) return null;
  const cmd = paintCellsCommand(list, { label: `${tool.name} stroke` });
  return { ...cmd, name: `map.tool.${tool.name}` };
}
