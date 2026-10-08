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
 * PortalEditor: visually link doorways between maps.
 *
 * - List all portals in current map
 * - Create new portals (click position, set target)
 * - Link to portals in other maps (dropdown)
 * - Validate links (warn if target missing)
 */

export default function PortalEditor({
  portals = [],
  availableMaps = [],
  portalsByMap = {},
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [selectedId, setSelectedId] = useState(null);
  const selected = portals.find(p => p.id === selectedId);

  const [newId, setNewId] = useState('');
  const [newX, setNewX] = useState(0);
  const [newY, setNewY] = useState(0);
  const [newZ, setNewZ] = useState(0);
  const [newTargetMap, setNewTargetMap] = useState('');
  const [newTargetPortal, setNewTargetPortal] = useState('');

  const handleAdd = () => {
    if (!newId.trim()) return;
    onAdd({
      id: newId.trim(),
      x: parseInt(newX),
      y: parseInt(newY),
      z: parseInt(newZ),
      targetMap: newTargetMap || null,
      targetPortal: newTargetPortal || null,
    });
    setNewId('');
    setSelectedId(newId.trim());
  };

  const validateLink = portal => {
    if (!portal.targetMap) return { ok: false, msg: 'No target map' };
    if (!portal.targetPortal) return { ok: true, msg: 'One-way (uses default spawn)' };
    const targets = portalsByMap[portal.targetMap] || [];
    const found = targets.find(p => p.id === portal.targetPortal);
    if (!found) return { ok: false, msg: `Target portal "${portal.targetPortal}" not found in "${portal.targetMap}"` };
    return { ok: true, msg: `→ ${portal.targetMap}:${portal.targetPortal}` };
  };

  const targetPortals = newTargetMap ? (portalsByMap[newTargetMap] || []) : [];
  const editTargetPortals = selected?.targetMap ? (portalsByMap[selected.targetMap] || []) : [];

  return (
    <>
      <ConfirmDialog />
      <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-wide">
        <div className="ps-modal-header">
          <h2>Portals</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ps-modal-body">
          <div className="ps-portal-list">
            {portals.length === 0 && (
              <div className="ps-empty">No portals. Add one to link maps.</div>
            )}
            {portals.map(portal => {
              const v = validateLink(portal);
              return (
                <div
                  key={portal.id}
                  className={`ps-portal-item ${selectedId === portal.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(portal.id)}
                >
                  <span className="ps-portal-name">{portal.id}</span>
                  <span className="ps-portal-pos">({portal.x}, {portal.y}, {portal.z || 0})</span>
                  <span className={`ps-portal-link ${v.ok ? 'ok' : 'broken'}`}>
                    {v.msg}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="ps-portal-add">
            <h3>Add Portal</h3>
            <div className="ps-field">
              <label className="ps-field-label">ID *</label>
              <input
                type="text"
                className="ps-input"
                value={newId}
                placeholder="north-door"
                onChange={e => setNewId(e.target.value)}
              />
            </div>
            <div className="ps-pos-inputs">
              <label>X <input type="number" value={newX} onChange={e => setNewX(e.target.value)} /></label>
              <label>Y <input type="number" value={newY} onChange={e => setNewY(e.target.value)} /></label>
              <label>Z <input type="number" value={newZ} onChange={e => setNewZ(e.target.value)} /></label>
            </div>
            <div className="ps-field">
              <label className="ps-field-label">Target Map</label>
              <select
                className="ps-input"
                value={newTargetMap}
                onChange={e => {
                  setNewTargetMap(e.target.value);
                  setNewTargetPortal('');
                }}
              >
                <option value="">— Select —</option>
                {availableMaps.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            {newTargetMap && (
              <div className="ps-field">
                <label className="ps-field-label">Target Portal</label>
                <select
                  className="ps-input"
                  value={newTargetPortal}
                  onChange={e => setNewTargetPortal(e.target.value)}
                >
                  <option value="">— Default spawn —</option>
                  {targetPortals.map(p => (
                    <option key={p.id} value={p.id}>{p.id} ({p.x}, {p.y})</option>
                  ))}
                </select>
              </div>
            )}
            <button
              className="ps-btn ps-btn-primary"
              onClick={handleAdd}
              disabled={!newId.trim()}
            >
              Add Portal
            </button>
          </div>

          {selected && (
            <div className="ps-portal-edit">
              <h3>Edit: {selected.id}</h3>
              <div className="ps-field">
                <label className="ps-field-label">Target Map</label>
                <select
                  className="ps-input"
                  value={selected.targetMap || ''}
                  onChange={e => onUpdate(selected.id, { targetMap: e.target.value || null, targetPortal: null })}
                >
                  <option value="">— Select —</option>
                  {availableMaps.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {selected.targetMap && (
                <div className="ps-field">
                  <label className="ps-field-label">Target Portal</label>
                  <select
                    className="ps-input"
                    value={selected.targetPortal || ''}
                    onChange={e => onUpdate(selected.id, { targetPortal: e.target.value || null })}
                  >
                    <option value="">— Default spawn —</option>
                    {editTargetPortals.map(p => (
                      <option key={p.id} value={p.id}>{p.id} ({p.x}, {p.y})</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                className="ps-btn ps-btn-danger"
                onClick={async () => {
                  if (await confirm(`Delete portal "${selected.id}"? This cannot be undone.`)) {
                    onDelete(selected.id);
                    setSelectedId(null);
                  }
                }}
              >
                Delete
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
