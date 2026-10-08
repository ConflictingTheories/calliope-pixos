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

import { useState } from 'react';
import { useConfirm } from '../shared/hooks/useConfirm.jsx';

/**
 * LightEditor: place and configure point lights in the scene.
 *
 * Each light has:
 * - id: unique identifier
 * - position: [x, y, z]
 * - color: [r, g, b] 0-1
 * - intensity: 0-2 (maps to density)
 * - radius: falloff distance (maps to attenuation)
 * - enabled: on/off
 */

export default function LightEditor({ lights = [], onAdd, onUpdate, onDelete, onClose }) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [selectedId, setSelectedId] = useState(null);
  const selected = lights.find(l => l.id === selectedId);

  const handleAdd = () => {
    const id = `light_${Date.now()}`;
    onAdd({
      id,
      pos: [0, 0, 2],
      color: [1, 1, 1],
      intensity: 1.0,
      radius: 10,
      enabled: true,
    });
    setSelectedId(id);
  };

  const handleChange = (field, value) => {
    if (!selected) return;
    onUpdate(selected.id, { [field]: value });
  };

  const handleColorChange = (channel, value) => {
    if (!selected) return;
    const color = [...selected.color];
    color[channel] = parseFloat(value);
    onUpdate(selected.id, { color });
  };

  const handlePosChange = (axis, value) => {
    if (!selected) return;
    const pos = [...selected.pos];
    pos[axis] = parseFloat(value);
    onUpdate(selected.id, { pos });
  };

  const rgbToHex = ([r, g, b]) => {
    const toHex = v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToRgb = hex => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    return [r, g, b];
  };

  return (
    <>
      <ConfirmDialog />
      <div className="ps-modal-overlay">
      <div className="ps-modal">
        <div className="ps-modal-header">
          <h2>Lights</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ps-modal-body">
          <div className="ps-light-list">
            {lights.length === 0 && (
              <div className="ps-empty">No lights. Add one to illuminate the scene.</div>
            )}
            {lights.map(light => (
              <div
                key={light.id}
                className={`ps-light-item ${selectedId === light.id ? 'selected' : ''} ${!light.enabled ? 'disabled' : ''}`}
                onClick={() => setSelectedId(light.id)}
              >
                <span
                  className="ps-light-swatch"
                  style={{ backgroundColor: rgbToHex(light.color) }}
                />
                <span className="ps-light-name">{light.id}</span>
                <span className="ps-light-pos">
                  ({light.pos.map(v => v.toFixed(1)).join(', ')})
                </span>
              </div>
            ))}
          </div>

          <button className="ps-btn ps-btn-secondary" onClick={handleAdd}>
            + Add Light
          </button>

          {selected && (
            <div className="ps-light-editor">
              <h3>Edit Light</h3>

              <div className="ps-field">
                <label className="ps-field-label">Enabled</label>
                <input
                  type="checkbox"
                  checked={selected.enabled}
                  onChange={e => handleChange('enabled', e.target.checked)}
                />
              </div>

              <div className="ps-field">
                <label className="ps-field-label">Color</label>
                <input
                  type="color"
                  value={rgbToHex(selected.color)}
                  onChange={e => onUpdate(selected.id, { color: hexToRgb(e.target.value) })}
                />
              </div>

              <div className="ps-field">
                <label className="ps-field-label">
                  Intensity: {selected.intensity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={selected.intensity}
                  onChange={e => handleChange('intensity', parseFloat(e.target.value))}
                />
              </div>

              <div className="ps-field">
                <label className="ps-field-label">
                  Radius: {selected.radius.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={selected.radius}
                  onChange={e => handleChange('radius', parseFloat(e.target.value))}
                />
              </div>

              <div className="ps-field">
                <label className="ps-field-label">Position</label>
                <div className="ps-pos-inputs">
                  {['X', 'Y', 'Z'].map((label, i) => (
                    <label key={label}>
                      {label}
                      <input
                        type="number"
                        step="0.5"
                        value={selected.pos[i]}
                        onChange={e => handlePosChange(i, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="ps-btn ps-btn-danger"
                onClick={async () => {
                  if (await confirm(`Delete light "${selected.id}"? This cannot be undone.`)) {
                    onDelete(selected.id);
                    setSelectedId(null);
                  }
                }}
              >
                Delete Light
              </button>
            </div>
          )}
        </div>

        <div className="ps-modal-footer">
          <button className="ps-btn ps-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
