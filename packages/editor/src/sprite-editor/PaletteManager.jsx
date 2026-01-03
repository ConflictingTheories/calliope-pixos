/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – PaletteManager Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Palette management for sprite editing. Supports:
 * - Custom color palettes with create/edit/delete
 * - Preset palettes (GameBoy, NES, etc.)
 * - Color swatch panel for quick access
 * - Import/export palette files (GPL, JSON)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Button, ButtonGroup, Input, Modal, SelectPicker } from 'rsuite';
import './palette-manager.css';

// Preset palettes for pixel art
const PRESET_PALETTES = {
  gameboy: {
    name: 'GameBoy',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
  },
  nes: {
    name: 'NES',
    colors: ['#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#0000bc', '#d8b8f8', '#9878f8', '#6844fc']
  },
  pico8: {
    name: 'PICO-8',
    colors: ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']
  },
  cga: {
    name: 'CGA',
    colors: ['#000000', '#555555', '#aaaaaa', '#ffffff', '#0000aa', '#5555ff', '#00aa00', '#55ff55', '#00aaaa', '#55ffff', '#aa0000', '#ff5555', '#aa00aa', '#ff55ff', '#aa5500', '#ffff55']
  },
  sweetie16: {
    name: 'Sweetie-16',
    colors: ['#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179', '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57']
  },
  endesga32: {
    name: 'ENDESGA-32',
    colors: ['#be4a2f', '#d77643', '#ead4aa', '#e4a672', '#b86f50', '#733e39', '#3e2731', '#a22633', '#e43b44', '#f77622', '#feae34', '#fee761', '#63c74d', '#3e8948', '#265c42', '#193c3e', '#124e89', '#0099db', '#2ce8f5', '#ffffff', '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466', '#262b44', '#181425', '#ff0044', '#68386c', '#b55088', '#f6757a', '#e8b796', '#c28569']
  },
  grayscale: {
    name: 'Grayscale',
    colors: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff']
  }
};

/**
 * PaletteManager - Component for managing color palettes
 * 
 * @param {Object} props
 * @param {string[]} props.palette - Current palette colors
 * @param {function} props.onPaletteChange - Callback when palette changes
 * @param {string} props.selectedColor - Currently selected color
 * @param {function} props.onColorSelect - Callback when color is selected
 * @param {function} props.onColorAdd - Callback to add color to palette
 * @param {function} props.onColorRemove - Callback to remove color from palette
 */
function PaletteManager({
  palette = [],
  onPaletteChange,
  selectedColor = '#000000',
  onColorSelect,
  onColorAdd,
  onColorRemove,
  className = ''
}) {
  const [showNewPaletteModal, setShowNewPaletteModal] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [editingColorValue, setEditingColorValue] = useState('');

  // Preset palette options for SelectPicker
  const presetOptions = useMemo(() => 
    Object.entries(PRESET_PALETTES).map(([key, val]) => ({
      label: val.name,
      value: key
    })),
    []
  );

  // Load a preset palette
  const loadPreset = useCallback((presetKey) => {
    if (PRESET_PALETTES[presetKey]) {
      onPaletteChange?.(PRESET_PALETTES[presetKey].colors);
    }
  }, [onPaletteChange]);

  // Add current color to palette
  const handleAddColor = useCallback(() => {
    if (!palette.includes(selectedColor)) {
      onPaletteChange?.([...palette, selectedColor]);
    }
  }, [palette, selectedColor, onPaletteChange]);

  // Remove color from palette by index
  const handleRemoveColor = useCallback((index) => {
    const newPalette = [...palette];
    newPalette.splice(index, 1);
    onPaletteChange?.(newPalette);
  }, [palette, onPaletteChange]);

  // Start editing a color
  const startEditColor = useCallback((index) => {
    setEditingColorIndex(index);
    setEditingColorValue(palette[index]);
  }, [palette]);

  // Finish editing a color
  const finishEditColor = useCallback(() => {
    if (editingColorIndex !== null && /^#[0-9A-Fa-f]{6}$/.test(editingColorValue)) {
      const newPalette = [...palette];
      newPalette[editingColorIndex] = editingColorValue.toLowerCase();
      onPaletteChange?.(newPalette);
    }
    setEditingColorIndex(null);
    setEditingColorValue('');
  }, [editingColorIndex, editingColorValue, palette, onPaletteChange]);

  // Clear palette
  const clearPalette = useCallback(() => {
    onPaletteChange?.([]);
  }, [onPaletteChange]);

  // Export palette as JSON
  const exportPalette = useCallback(() => {
    const data = JSON.stringify({ name: 'Custom Palette', colors: palette }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [palette]);

  // Import palette from file
  const importPalette = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.gpl';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const text = await file.text();
      
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          if (Array.isArray(data.colors)) {
            onPaletteChange?.(data.colors);
          } else if (Array.isArray(data)) {
            onPaletteChange?.(data);
          }
        } else if (file.name.endsWith('.gpl')) {
          // Parse GIMP Palette format
          const colors = [];
          const lines = text.split('\n');
          for (const line of lines) {
            const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)/);
            if (match) {
              const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
              const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
              const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
              colors.push(`#${r}${g}${b}`);
            }
          }
          if (colors.length > 0) {
            onPaletteChange?.(colors);
          }
        }
      } catch (err) {
        console.error('Failed to import palette:', err);
      }
    };
    input.click();
  }, [onPaletteChange]);

  return (
    <div className={`palette-manager ${className}`}>
      {/* Palette Header */}
      <div className="palette-manager__header">
        <span className="palette-manager__title">Palette</span>
        <div className="palette-manager__actions">
          <SelectPicker
            data={presetOptions}
            placeholder="Presets"
            size="xs"
            onChange={loadPreset}
            searchable={false}
            cleanable={false}
            style={{ width: 100 }}
          />
          <ButtonGroup size="xs">
            <Button onClick={importPalette} title="Import">📥</Button>
            <Button onClick={exportPalette} title="Export" disabled={palette.length === 0}>📤</Button>
            <Button onClick={clearPalette} title="Clear" disabled={palette.length === 0}>🗑️</Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="palette-manager__swatches">
        {palette.map((color, index) => (
          <div
            key={`${color}-${index}`}
            className={`palette-manager__swatch ${selectedColor === color ? 'palette-manager__swatch--selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect?.(color)}
            onDoubleClick={() => startEditColor(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleRemoveColor(index);
            }}
            title={`${color}\nDouble-click to edit\nRight-click to remove`}
          >
            {editingColorIndex === index && (
              <input
                type="text"
                className="palette-manager__swatch-input"
                value={editingColorValue}
                onChange={(e) => setEditingColorValue(e.target.value)}
                onBlur={finishEditColor}
                onKeyDown={(e) => e.key === 'Enter' && finishEditColor()}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        ))}
        
        {/* Add Color Button */}
        <div
          className="palette-manager__swatch palette-manager__swatch--add"
          onClick={handleAddColor}
          title="Add current color to palette"
        >
          <span style={{ color: selectedColor }}>+</span>
        </div>
      </div>

      {/* Color Count */}
      <div className="palette-manager__footer">
        <span className="palette-manager__count">{palette.length} colors</span>
      </div>
    </div>
  );
}

export default PaletteManager;
export { PRESET_PALETTES };
