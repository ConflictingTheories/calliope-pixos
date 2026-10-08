/*
 * ---------------------------------------------------------------
 *                Pixospritz – Editor – Tile Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * The TileEditor allows composition of tiles from multiple geometry
 * pieces. Tiles are defined in tiles.json as named entries, where each
 * tile is an array of triplets: [geometry, texture, zOffset, ...]
 *
 * Example format:
 *   "FLOOR": ["FLAT_ALL", "FLOOR", 0],
 *   "N_WALL": ["WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY_B", 2]
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import { InputNumber, Button, Message, SelectPicker, Input } from '../ui';
import { keymap } from '../shell/commands/keymap.js';
import { useConfirm } from '../shared/hooks/useConfirm.jsx';
import { CommandHistory } from '../core/commands/history.js';
import { TILE_BINDING_PRIORITY, isTileEditorFocused } from './undo-precedence.js';

// Isometric tile preview with Z-up coordinate system (matching engine)
// X: East/West, Y: North/South, Z: Up/Down
function TilePreview({ components, geometryData, size = 180 }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear with dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'var(--color-bg-secondary)';
    ctx.lineWidth = 1;
    const gridSize = width / 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(width, i * gridSize);
      ctx.stroke();
    }

    if (!components || components.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No layers', width / 2, height / 2);
      return;
    }

    // Z-up isometric projection (matching engine)
    // Camera orbits around Z axis, looking down at ~30°
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const scale = size * 0.28;
    const cx = width / 2;
    const cy = height / 2 + 15;

    // Project 3D point to 2D with Z-up coordinate system
    const project = (x, y, z) => {
      // Rotate around Z axis (vertical)
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      // Isometric projection: X/Y on ground plane, Z is up
      const px = cx + (rx - ry) * scale * 0.7;
      const py = cy - z * scale * 0.8 + (rx + ry) * scale * 0.25;
      return [px, py, rx + ry]; // Include depth for sorting
    };

    // Draw ground plane reference
    ctx.strokeStyle = 'var(--color-border-default)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const corners = [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ];
    corners.forEach((c, i) => {
      const [px, py] = project(c[0], c[1], c[2]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Color palette for layers
    const layerColors = [
      'rgba(125, 211, 252, 0.4)', // cyan
      'rgba(167, 139, 250, 0.4)', // purple
      'rgba(74, 222, 128, 0.4)', // green
      'rgba(251, 191, 36, 0.4)', // amber
      'rgba(244, 114, 182, 0.4)', // pink
    ];

    // Draw each layer
    components.forEach((comp, idx) => {
      // Z offset is now applied to Z coordinate (up direction)
      const zOff = (comp.zOffset || 0) * 0.1;
      const color = layerColors[idx % layerColors.length];
      const strokeColor = color.replace('0.4)', '0.8)');

      // Get geometry data if available
      let vertices = null;
      if (geometryData && comp.geometry && geometryData[comp.geometry]) {
        vertices = geometryData[comp.geometry].vertices;
      }

      if (vertices && vertices.length > 0) {
        // Draw actual geometry with Z offset applied to Z coordinate
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;

        vertices.forEach(tri => {
          if (!tri || tri.length < 3) return;
          ctx.beginPath();
          // Apply zOff to Z coordinate (third component, the up direction)
          const [p0x, p0y] = project(tri[0][0], tri[0][1], tri[0][2] + zOff);
          ctx.moveTo(p0x, p0y);
          for (let i = 1; i < 3; i++) {
            const [px, py] = project(tri[i][0], tri[i][1], tri[i][2] + zOff);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      } else {
        // Draw placeholder tile shape on XY plane at Z = zOff
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;

        // Draw a simple flat square on the XY plane at height zOff
        ctx.beginPath();
        const [p1x, p1y] = project(0, 0, zOff);
        const [p2x, p2y] = project(1, 0, zOff);
        const [p3x, p3y] = project(1, 1, zOff);
        const [p4x, p4y] = project(0, 1, zOff);
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw layer label
      const [labelX, labelY] = project(0.5, 0.5, zOff + 0.2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.geometry || '?', labelX, labelY);
    });

    // Draw axes (Z-up coordinate system)
    ctx.lineWidth = 2;
    const [ox, oy] = project(0, 0, 0);

    // X axis (red) - East
    ctx.strokeStyle = 'var(--color-error)';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [ax, ay] = project(0.3, 0, 0);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // Y axis (green) - North
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [bx, by] = project(0, 0.3, 0);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Z axis (blue) - Up
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [zx, zy] = project(0, 0, 0.3);
    ctx.lineTo(zx, zy);
    ctx.stroke();

    // Draw info
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${components.length} layer(s)`, 6, height - 6);
    ctx.textAlign = 'right';
    ctx.fillText('Z-up', width - 6, height - 6);
  }, [components, geometryData, rotation, size]);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 0.015);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: '8px',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
      }}
    />
  );
}

/**
 * Parse a tile array into components (triplets of [geometry, texture, zOffset])
 * Some tiles may have an extra 4th value (flags)
 */
function parseTileComponents(arr) {
  const components = [];
  let i = 0;
  while (i < arr.length) {
    const geometry = arr[i];
    const texture = arr[i + 1];
    const zOffset = arr[i + 2] ?? 0;
    i += 3;
    // Check if next value is a number (flag) before another geometry name
    let flags = null;
    if (
      i < arr.length &&
      typeof arr[i] === 'number' &&
      (i + 1 >= arr.length || typeof arr[i + 1] !== 'string')
    ) {
      flags = arr[i];
      i++;
    }
    components.push({ geometry, texture, zOffset, flags });
  }
  return components;
}

/**
 * Convert components back to the flat array format
 */
function componentsToArray(components) {
  const arr = [];
  for (const comp of components) {
    arr.push(comp.geometry, comp.texture, comp.zOffset);
    if (comp.flags !== null && comp.flags !== undefined) {
      arr.push(comp.flags);
    }
  }
  return arr;
}

/**
 * Remap a multi-selection across a tile rename. Pure helper so the
 * selection never keeps the stale (deleted) old name after renaming.
 */
export function remapSelectionAfterRename(names, oldName, newName) {
  return names.map(n => (n === oldName ? newName : n));
}

/**
 * Coalesce rapid successive edits of the same tile field into a single
 * undo step: undo restores the value from before the first keystroke,
 * redo applies the latest value.
 */
export function coalesceTileEdit(prev, next) {
  return {
    label: next.label,
    coalesceKey: next.coalesceKey,
    coalesce: prev.coalesce,
    undo: prev.undo,
    redo: next.redo,
    bytes: (prev.bytes || 0) + (next.bytes || 0),
  };
}

function TileEditor({ content, onSave, geometryContent, textureList = [] }) {
  // tiles: Object with named keys
  const [tiles, setTiles] = useState({});
  const [tileNames, setTileNames] = useState([]);
  const [selectedTileName, setSelectedTileName] = useState(null);
  const [selectedTileNames, setSelectedTileNames] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const [geometryNames, setGeometryNames] = useState([]);
  const [geometryData, setGeometryData] = useState(null);
  const [error, setError] = useState(null);
  const [newTileName, setNewTileName] = useState('');
  const [renamingTile, setRenamingTile] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  const { confirm, ConfirmDialog } = useConfirm();

  // Root DOM node, used by the undo/redo precedence guard so the tile
  // editor only claims Ctrl+Z while focus is inside its own subtree.
  const rootRef = useRef(null);

  // Undo/redo for tile operations. Each entry carries its own
  // operation-specific inverse (the P2-05 command pattern from
  // core/commands/history.js); the stack is byte-capped by CommandHistory.
  const historyRef = useRef(null);
  if (!historyRef.current) historyRef.current = new CommandHistory();
  const [, bumpHistory] = useState(0);
  useEffect(() => historyRef.current.onChange(() => bumpHistory(t => t + 1)), []);

  const pushHistory = useCallback((label, undoFn, redoFn, extra = {}) => {
    historyRef.current.push({ label, undo: undoFn, redo: redoFn, ...extra }, { apply: false });
  }, []);
  const undo = useCallback(() => {
    // Return the boolean: an empty tile history yields false so the
    // keymap falls through to shell-level undo instead of swallowing it.
    return historyRef.current.undo();
  }, []);
  const redo = useCallback(() => {
    return historyRef.current.redo();
  }, []);
  const canUndo = historyRef.current.canUndo;
  const canRedo = historyRef.current.canRedo;

  // Selection snapshot helpers. Selection lives outside `tiles`, so every
  // history entry captures and restores it explicitly.
  const captureSelection = useCallback(
    () => ({ name: selectedTileName, names: [...selectedTileNames] }),
    [selectedTileName, selectedTileNames]
  );
  const applySelection = useCallback(sel => {
    setSelectedTileName(sel.name);
    setSelectedTileNames(sel.names);
  }, []);

  // Parse incoming tile content
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        // tiles.json is a flat object with named tiles
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          setTiles(obj);
          const names = Object.keys(obj);
          setTileNames(names);
          if (names.length > 0 && !selectedTileName) {
            setSelectedTileName(names[0]);
            setSelectedTileNames([names[0]]);
          }
          // A newly loaded document starts with a fresh undo history.
          historyRef.current.clear();
        }
        setError(null);
      } catch (err) {
        console.warn('Failed to parse tiles JSON', err);
        setError('Invalid tiles.json format');
      }
    }
  }, [content]);

  // Parse geometry content to get geometry names and data
  useEffect(() => {
    if (geometryContent) {
      try {
        const obj = JSON.parse(geometryContent);
        if (obj && typeof obj === 'object') {
          setGeometryNames(Object.keys(obj));
          setGeometryData(obj);
        }
      } catch (err) {
        console.warn('Failed to parse geometry JSON', err);
      }
    }
  }, [geometryContent]);

  // Get current tile's components
  const selectedTileArray = selectedTileName ? tiles[selectedTileName] : null;
  const components = selectedTileArray ? parseTileComponents(selectedTileArray) : [];

  // Update a component (layer edit). Undoable; rapid edits of the same
  // field coalesce into one undo step via coalesceTileEdit.
  const updateComponent = useCallback(
    (compIdx, field, value) => {
      if (!selectedTileName) return;
      const before = tiles[selectedTileName];
      if (!before) return;

      const newComponents = parseTileComponents(before);
      newComponents[compIdx] = { ...newComponents[compIdx], [field]: value };
      const after = componentsToArray(newComponents);
      const apply = arr =>
        setTiles(prev => ({
          ...prev,
          [selectedTileName]: arr,
        }));

      apply(after);
      pushHistory(
        `Edit ${selectedTileName} layer ${compIdx + 1} ${field}`,
        () => apply(before),
        () => apply(after),
        {
          coalesceKey: `tile:${selectedTileName}:layer:${compIdx}:${field}`,
          coalesce: coalesceTileEdit,
        }
      );
    },
    [selectedTileName, tiles, pushHistory]
  );

  // Add a component (undoable)
  const addComponent = useCallback(() => {
    if (!selectedTileName) return;
    const before = tiles[selectedTileName];
    if (!before) return;

    const newComponents = [
      ...parseTileComponents(before),
      {
        geometry: geometryNames[0] || 'FLAT_ALL',
        texture: 'FLOOR',
        zOffset: 0,
        flags: null,
      },
    ];
    const after = componentsToArray(newComponents);
    const apply = arr =>
      setTiles(prev => ({
        ...prev,
        [selectedTileName]: arr,
      }));

    apply(after);
    pushHistory(`Add layer to ${selectedTileName}`, () => apply(before), () => apply(after));
  }, [selectedTileName, tiles, geometryNames, pushHistory]);

  // Remove a component (undoable)
  const removeComponent = useCallback(
    compIdx => {
      if (!selectedTileName) return;
      const before = tiles[selectedTileName];
      if (!before) return;

      const after = componentsToArray(parseTileComponents(before).filter((_, i) => i !== compIdx));
      const apply = arr =>
        setTiles(prev => ({
          ...prev,
          [selectedTileName]: arr,
        }));

      apply(after);
      pushHistory(
        `Remove layer ${compIdx + 1} from ${selectedTileName}`,
        () => apply(before),
        () => apply(after)
      );
    },
    [selectedTileName, tiles, pushHistory]
  );

  // Add a new tile (undoable)
  const addTile = useCallback(() => {
    const name = newTileName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!name) return;
    if (tiles[name]) {
      setError(`Tile "${name}" already exists`);
      return;
    }

    const tileArr = ['FLAT_ALL', 'FLOOR', 0];
    const selBefore = captureSelection();
    const selAfter = { name, names: [name] };
    const applyAdd = () => {
      setTiles(prev => ({ ...prev, [name]: tileArr }));
      setTileNames(prev => (prev.includes(name) ? prev : [...prev, name]));
      applySelection(selAfter);
    };
    const applyRemove = () => {
      setTiles(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      setTileNames(prev => prev.filter(n => n !== name));
      applySelection(selBefore);
    };

    applyAdd();
    setNewTileName('');
    setError(null);
    pushHistory(`Add tile "${name}"`, applyRemove, applyAdd);
  }, [newTileName, tiles, captureSelection, applySelection, pushHistory]);

  // Delete a tile (confirmed, undoable)
  const deleteTile = useCallback(
    async name => {
      if (!tiles[name]) return;
      const ok = await confirm(`Delete tile "${name}"?`);
      if (!ok) return;

      const deleted = tiles[name];
      const index = tileNames.indexOf(name);
      const selBefore = captureSelection();
      const remainingNames = tileNames.filter(n => n !== name);
      const selAfter =
        selBefore.name === name
          ? { name: remainingNames[0] ?? null, names: remainingNames[0] ? [remainingNames[0]] : [] }
          : selBefore;

      const applyDelete = () => {
        setTiles(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
        setTileNames(prev => prev.filter(n => n !== name));
        applySelection(selAfter);
      };
      const applyRestore = () => {
        setTiles(prev => ({ ...prev, [name]: deleted }));
        setTileNames(prev => {
          const next = prev.filter(n => n !== name);
          next.splice(Math.min(index, next.length), 0, name);
          return next;
        });
        applySelection(selBefore);
      };

      applyDelete();
      pushHistory(`Delete tile "${name}"`, applyRestore, applyDelete);
    },
    [tiles, tileNames, captureSelection, applySelection, confirm, pushHistory]
  );

  // Universal selection: click = single, ctrl/cmd+click = toggle, shift+click = range
  const handleTileClick = useCallback(
    (name, index, event) => {
      const isToggle = event.ctrlKey || event.metaKey;
      const isRange = event.shiftKey;
      if (isRange && lastSelectedIndex >= 0) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const range = tileNames.slice(start, end + 1);
        setSelectedTileNames(range);
        setSelectedTileName(range[0] || null);
      } else if (isToggle) {
        setSelectedTileNames(prev => {
          const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
          setSelectedTileName(next[0] || null);
          return next;
        });
        setLastSelectedIndex(index);
      } else {
        setSelectedTileNames([name]);
        setSelectedTileName(name);
        setLastSelectedIndex(index);
      }
    },
    [tileNames, lastSelectedIndex]
  );

  // Delete all selected tiles (confirmed, undoable)
  const deleteSelected = useCallback(async () => {
    if (selectedTileNames.length === 0) return;
    const names = [...selectedTileNames];
    const ok = await confirm(
      names.length === 1 ? `Delete tile "${names[0]}"?` : `Delete ${names.length} selected tiles?`
    );
    if (!ok) return;

    const deleted = {};
    const indices = {};
    names.forEach(n => {
      deleted[n] = tiles[n];
      indices[n] = tileNames.indexOf(n);
    });
    const selBefore = captureSelection();
    const remaining = tileNames.filter(n => !names.includes(n));
    const selAfter = { name: remaining[0] ?? null, names: remaining[0] ? [remaining[0]] : [] };

    const applyDelete = () => {
      setTiles(prev => {
        const next = { ...prev };
        names.forEach(n => delete next[n]);
        return next;
      });
      setTileNames(prev => prev.filter(n => !names.includes(n)));
      applySelection(selAfter);
    };
    const applyRestore = () => {
      setTiles(prev => ({ ...prev, ...deleted }));
      setTileNames(prev => {
        const next = prev.filter(n => !names.includes(n));
        // Re-insert at the original positions (ascending) so order is preserved.
        names
          .slice()
          .sort((a, b) => indices[a] - indices[b])
          .forEach(n => next.splice(Math.min(indices[n], next.length), 0, n));
        return next;
      });
      applySelection(selBefore);
    };

    applyDelete();
    pushHistory(
      `Delete ${names.length} tile${names.length === 1 ? '' : 's'}`,
      applyRestore,
      applyDelete
    );
  }, [tiles, tileNames, selectedTileNames, captureSelection, applySelection, confirm, pushHistory]);

  // Register keyboard shortcuts with the central keymap
  useEffect(() => {
    const offDelete = keymap.register('tile.delete', 'Delete', () => {
      deleteSelected();
      return true;
    }, {
      when: e => {
        const t = e.target;
        return !(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable);
      }
    });
    const offBackspace = keymap.register('tile.delete2', 'Backspace', () => {
      deleteSelected();
      return true;
    }, {
      when: e => {
        const t = e.target;
        return !(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable);
      }
    });
    return () => { offDelete(); offBackspace(); };
  }, [deleteSelected]);

  // Undo/redo shortcuts. These carry a higher keymap priority than the
  // shell's shell.undo/shell.redo, so the tile editor's local undo wins
  // while keyboard focus is inside this tile editor's DOM subtree. Focus
  // inside text inputs is excluded (native field undo preserved; the
  // keymap's own input guard also backstops this).
  useEffect(() => {
    const focused = e => isTileEditorFocused(rootRef.current, e.target);
    const opts = { when: focused, priority: TILE_BINDING_PRIORITY };
    const offUndo = keymap.register('tile.undo', 'ctrl+z', () => undo(), opts);
    const offRedo = keymap.register('tile.redo', 'ctrl+shift+z', () => redo(), opts);
    const offRedoAlt = keymap.register('tile.redo-alt', 'ctrl+y', () => redo(), opts);
    return () => { offUndo(); offRedo(); offRedoAlt(); };
  }, [undo, redo]);

  // Rename a tile (undoable). The multi-selection is remapped to the new
  // name so it never keeps the stale old name (ghost selection).
  const renameTile = useCallback(
    oldName => {
      const newName = renameValue.trim().toUpperCase().replace(/\s+/g, '_');
      if (!newName || newName === oldName) {
        setRenamingTile(null);
        return;
      }
      if (tiles[newName]) {
        setError(`Tile "${newName}" already exists`);
        return;
      }

      const selBefore = captureSelection();
      const selAfter = {
        name: selBefore.name === oldName ? newName : selBefore.name,
        names: remapSelectionAfterRename(selBefore.names, oldName, newName),
      };
      const applyRename = (from, to) => {
        setTiles(prev => {
          const next = { ...prev };
          next[to] = next[from];
          delete next[from];
          return next;
        });
        setTileNames(prev => prev.map(n => (n === from ? to : n)));
      };

      applyRename(oldName, newName);
      applySelection(selAfter);
      setRenamingTile(null);
      setRenameValue('');
      setError(null);
      pushHistory(
        `Rename "${oldName}" to "${newName}"`,
        () => {
          applyRename(newName, oldName);
          applySelection(selBefore);
        },
        () => {
          applyRename(oldName, newName);
          applySelection(selAfter);
        }
      );
    },
    [tiles, renameValue, captureSelection, applySelection, pushHistory]
  );

  // Duplicate a tile (undoable)
  const duplicateTile = useCallback(
    name => {
      let newName = `${name}_COPY`;
      let counter = 1;
      while (tiles[newName]) {
        newName = `${name}_COPY_${counter++}`;
      }

      const copy = [...tiles[name]];
      const selBefore = captureSelection();
      const applyAdd = () => {
        setTiles(prev => ({ ...prev, [newName]: copy }));
        setTileNames(prev => (prev.includes(newName) ? prev : [...prev, newName]));
        setSelectedTileName(newName);
      };
      const applyRemove = () => {
        setTiles(prev => {
          const next = { ...prev };
          delete next[newName];
          return next;
        });
        setTileNames(prev => prev.filter(n => n !== newName));
        applySelection(selBefore);
      };

      applyAdd();
      pushHistory(`Duplicate tile "${name}"`, applyRemove, applyAdd);
    },
    [tiles, captureSelection, applySelection, pushHistory]
  );

  // Save handler
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(tiles);
    } else {
    }
  }, [tiles, onSave]);

  // Geometry picker options
  const geometryOptions = geometryNames.map(name => ({
    label: name,
    value: name,
  }));

  // Texture options from textureList
  const textureOptions = textureList.map(name => ({
    label: name,
    value: name,
  }));

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: 'var(--color-bg-primary)',
      }}
    >
      <ConfirmDialog />
      {/* Left panel - Tile list */}
      <div
        style={{
          width: '240px',
          minWidth: '240px',
          borderRight: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--color-bg-secondary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
            🧩 Tiles ({Object.keys(tiles).length})
          </h4>
          {/* Search */}
          <Input
            size="xs"
            placeholder="🔍 Search tiles..."
            value={searchFilter}
            onChange={setSearchFilter}
            style={{ marginBottom: '8px' }}
          />
          {/* Add new */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Input
              value={newTileName}
              onChange={setNewTileName}
              placeholder="NEW_TILE"
              size="xs"
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && addTile()}
            />
            <Button appearance="primary" size="xs" onClick={addTile}>
              +
            </Button>
          </div>
        </div>

        {/* Tile list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {tileNames
            .filter(n => !searchFilter || n.toLowerCase().includes(searchFilter.toLowerCase()))
            .map(name => {
              const tileArr = tiles[name];
              const compCount = parseTileComponents(tileArr || []).length;
              const fullIndex = tileNames.indexOf(name);
              const isSelected = selectedTileNames.includes(name);

              return (
                <div
                  key={name}
                  onClick={e => handleTileClick(name, fullIndex, e)}
                  style={{
                    padding: '10px',
                    marginBottom: '4px',
                    background: isSelected
                      ? 'var(--color-border-default)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(125,211,252,0.5)' : 'transparent'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {renamingTile === name ? (
                      <Input
                        value={renameValue}
                        onChange={setRenameValue}
                        size="xs"
                        autoFocus
                        onBlur={() => renameTile(name)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameTile(name);
                          if (e.key === 'Escape') setRenamingTile(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '120px' }}
                      />
                    ) : (
                      <div
                        onDoubleClick={e => {
                          e.stopPropagation();
                          setRenamingTile(name);
                          setRenameValue(name);
                        }}
                        style={{ flex: 1 }}
                      >
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 500 }}>
                          {name}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                          {compCount} layer{compCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        size="xs"
                        onClick={e => {
                          e.stopPropagation();
                          duplicateTile(name);
                        }}
                        title="Duplicate"
                      >
                        ⧉
                      </Button>
                      <Button
                        size="xs"
                        appearance="danger"
                        onClick={e => {
                          e.stopPropagation();
                          deleteTile(name);
                        }}
                        title="Delete"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          {tileNames.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '12px',
              }}
            >
              No tiles defined.
            </div>
          )}
        </div>

        {/* Undo/redo + save */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <Button
              size="xs"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{ flex: 1 }}
            >
              ↩ Undo
            </Button>
            <Button
              size="xs"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              style={{ flex: 1 }}
            >
              ↪ Redo
            </Button>
          </div>
          <Button appearance="primary" block onClick={handleSave}>
            💾 Save Tiles
          </Button>
        </div>
      </div>

      {/* Main panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {error && (
          <div style={{ padding: '8px 12px', flexShrink: 0 }}>
            <Message type="error" description={error} closable onClose={() => setError(null)} />
          </div>
        )}

        {selectedTileName && selectedTileArray ? (
          <>
            {/* Header with preview */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                flexShrink: 0,
                background: 'rgba(0,0,0,0.15)',
              }}
            >
              {/* Preview */}
              <TilePreview components={components} geometryData={geometryData} />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)', fontSize: '18px' }}>
                  {selectedTileName}
                  {selectedTileNames.length > 1 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                      +{selectedTileNames.length - 1} more
                    </span>
                  )}
                  <Button
                    size="xs"
                    onClick={() => {
                      if (!showJson) {
                        setJsonText(JSON.stringify({ [selectedTileName]: tiles[selectedTileName] }, null, 2));
                        setJsonError(null);
                      }
                      setShowJson(!showJson);
                    }}
                    style={{ marginLeft: '12px' }}
                  >
                    {showJson ? 'Visual' : 'JSON'}
                  </Button>
                </h4>
                <div
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    marginBottom: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  [{selectedTileArray.map(v => (typeof v === 'string' ? `"${v}"` : v)).join(', ')}]
                </div>
                <Button
                  appearance="ghost"
                  size="sm"
                  onClick={addComponent}
                  style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-default)' }}
                >
                  + Add Layer
                </Button>
                {!geometryContent && (
                  <div style={{ color: 'var(--color-warning)', fontSize: '10px', marginTop: '10px' }}>
                    ⚠ Load geometry.json from same folder for better preview & dropdowns
                  </div>
                )}
              </div>
            </div>

            {/* Layers section */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
              {showJson ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                  <textarea
                    value={jsonText}
                    onChange={e => {
                      setJsonText(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonError(null);
                      } catch (err) {
                        setJsonError('Invalid JSON: ' + err.message);
                      }
                    }}
                    style={{
                      flex: 1,
                      minHeight: '300px',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '6px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      resize: 'vertical',
                    }}
                    spellCheck={false}
                  />
                  {jsonError && (
                    <div style={{ color: 'var(--color-error)', fontSize: '12px' }}>{jsonError}</div>
                  )}
                  <Button
                    appearance="primary"
                    onClick={() => {
                      try {
                        const obj = JSON.parse(jsonText);
                        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
                          throw new Error('JSON must be an object of named tiles');
                        }
                        const names = Object.keys(obj);
                        if (names.length === 0) throw new Error('Empty object');
                        // Apply ALL pasted tiles, not just the first one. Pasted
                        // keys overwrite existing ones so re-applying the same
                        // JSON is idempotent.
                        const beforeTiles = tiles;
                        const beforeNames = tileNames;
                        const selBefore = captureSelection();
                        const newTiles = { ...tiles, ...obj };
                        // Keep the name list in sync without duplicate entries
                        const seenNames = new Set(tileNames);
                        const afterNames = [...tileNames, ...names.filter(n => !seenNames.has(n))];
                        setTiles(newTiles);
                        setTileNames(afterNames);
                        // Never leave selection pointing at a nonexistent tile:
                        // keep the current selection if it still exists,
                        // otherwise select the first pasted tile.
                        let selAfter = selBefore;
                        if (!selectedTileName || !(selectedTileName in newTiles)) {
                          selAfter = { name: names[0], names: [names[0]] };
                          applySelection(selAfter);
                        }
                        setJsonError(null);
                        setShowJson(false);
                        pushHistory(
                          'Apply JSON paste',
                          () => {
                            setTiles(beforeTiles);
                            setTileNames(beforeNames);
                            applySelection(selBefore);
                          },
                          () => {
                            setTiles(newTiles);
                            setTileNames(afterNames);
                            applySelection(selAfter);
                          }
                        );
                      } catch (err) {
                        setJsonError('Cannot apply: ' + err.message);
                      }
                    }}
                    disabled={!!jsonError}
                  >
                    Apply JSON
                  </Button>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {components.map((comp, compIdx) => (
                  <div
                    key={compIdx}
                    style={{
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Layer {compIdx + 1}
                      </span>
                      <Button
                        size="xs"
                        appearance="danger"
                        onClick={() => removeComponent(compIdx)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {/* Geometry selector */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '4px',
                            fontWeight: 500,
                          }}
                        >
                          Geometry
                        </label>
                        {geometryNames.length > 0 ? (
                          <SelectPicker
                            data={geometryOptions}
                            value={comp.geometry}
                            onChange={val => updateComponent(compIdx, 'geometry', val)}
                            size="sm"
                            block
                            placeholder="Select geometry..."
                            cleanable={false}
                            searchable
                          />
                        ) : (
                          <Input
                            value={comp.geometry || ''}
                            onChange={val => updateComponent(compIdx, 'geometry', val)}
                            size="sm"
                            placeholder="FLAT_ALL"
                          />
                        )}
                      </div>

                      {/* Texture input */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '4px',
                            fontWeight: 500,
                          }}
                        >
                          Texture
                        </label>
                        {textureList.length > 0 ? (
                          <SelectPicker
                            data={textureOptions}
                            value={comp.texture}
                            onChange={val => updateComponent(compIdx, 'texture', val)}
                            size="sm"
                            block
                            placeholder="Select texture..."
                            searchable
                          />
                        ) : (
                          <Input
                            value={comp.texture || ''}
                            onChange={val => updateComponent(compIdx, 'texture', val)}
                            size="sm"
                            placeholder="FLOOR"
                          />
                        )}
                      </div>

                      {/* Z Offset */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '4px',
                            fontWeight: 500,
                          }}
                        >
                          Z Offset
                        </label>
                        <InputNumber
                          value={comp.zOffset ?? 0}
                          onChange={val => updateComponent(compIdx, 'zOffset', val)}
                          size="sm"
                          step={0.5}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* Flags (optional) */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '4px',
                            fontWeight: 500,
                          }}
                        >
                          Flags (optional)
                        </label>
                        <InputNumber
                          value={comp.flags ?? ''}
                          onChange={val =>
                            updateComponent(compIdx, 'flags', val === '' ? null : val)
                          }
                          size="sm"
                          style={{ width: '100%' }}
                          placeholder="—"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {components.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px 20px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '12px',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: '8px',
                    }}
                  >
                    No layers defined for this tile.
                    <br />
                    Click "+ Add Layer" to add geometry components.
                  </div>
                )}
              </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🧩</div>
              Select a tile from the list
              <br />
              or create a new one to begin editing.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default collect(TileEditor);
