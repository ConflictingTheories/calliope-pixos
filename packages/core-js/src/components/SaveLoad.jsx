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

import { useState, useEffect } from 'react';

/**
 * SaveLoad: save game slots UI.
 *
 * - 3 save slots
 * - Shows timestamp and location for each
 * - Save, load, delete
 * - Uses AvatarManager.serialize()/deserialize()
 */

const SLOTS = [1, 2, 3];
const STORAGE_KEY = 'pixospritz_saves';

function getSaves() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setSaves(saves) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export default function SaveLoad({ mode = 'save', avatarManager, onClose, onLoad }) {
  const [saves, setSavesState] = useState({});

  useEffect(() => {
    setSavesState(getSaves());
  }, []);

  const handleSave = slot => {
    if (!avatarManager) return;
    const data = avatarManager.serialize();
    data.timestamp = new Date().toISOString();
    data.slot = slot;
    const updated = { ...getSaves(), [slot]: data };
    setSaves(updated);
    setSavesState(updated);
  };

  const handleLoad = slot => {
    const data = saves[slot];
    if (!data || !avatarManager) return;
    avatarManager.deserialize(data);
    onLoad?.(data);
    onClose?.();
  };

  const handleDelete = slot => {
    if (!confirm(`Delete save in slot ${slot}?`)) return;
    const updated = { ...getSaves() };
    delete updated[slot];
    setSaves(updated);
    setSavesState(updated);
  };

  const formatDate = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal">
        <div className="ps-modal-header">
          <h2>{mode === 'save' ? 'Save Game' : 'Load Game'}</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ps-modal-body">
          {SLOTS.map(slot => {
            const save = saves[slot];
            return (
              <div key={slot} className="ps-save-slot">
                <div className="ps-save-slot-header">
                  <span className="ps-save-slot-number">Slot {slot}</span>
                  {save ? (
                    <span className="ps-save-slot-info">
                      {formatDate(save.timestamp)} · {save.currentMap || 'Unknown'}
                    </span>
                  ) : (
                    <span className="ps-save-slot-empty">Empty</span>
                  )}
                </div>
                <div className="ps-save-slot-actions">
                  {mode === 'save' ? (
                    <button
                      className="ps-btn ps-btn-primary ps-btn-small"
                      onClick={() => handleSave(slot)}
                    >
                      {save ? 'Overwrite' : 'Save'}
                    </button>
                  ) : (
                    save && (
                      <button
                        className="ps-btn ps-btn-primary ps-btn-small"
                        onClick={() => handleLoad(slot)}
                      >
                        Load
                      </button>
                    )
                  )}
                  {save && (
                    <button
                      className="ps-btn ps-btn-danger ps-btn-small"
                      onClick={() => handleDelete(slot)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="ps-modal-footer">
          <button className="ps-btn ps-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
