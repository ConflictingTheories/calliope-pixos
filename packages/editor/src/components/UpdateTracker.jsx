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
 * Update Tracker: changelog for project changes.
 * Logs who changed what, when. Stored in project metadata.
 */

const CHANGE_TYPES = [
  { id: 'map', label: 'Map', icon: '🗺' },
  { id: 'mode', label: 'Mode', icon: '⚙' },
  { id: 'sprite', label: 'Sprite', icon: '👾' },
  { id: 'script', label: 'Script', icon: '📜' },
  { id: 'settings', label: 'Settings', icon: '🔧' },
  { id: 'asset', label: 'Asset', icon: '📦' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export default function UpdateTracker({ entries = [], onAdd, onClose }) {
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState('map');
  const [newSummary, setNewSummary] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.type === filter);

  const sorted = [...filtered].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const handleAdd = () => {
    if (!newSummary.trim()) return;
    onAdd({
      type: newType,
      summary: newSummary.trim(),
      details: newDetails.trim(),
      timestamp: new Date().toISOString(),
    });
    setNewSummary('');
    setNewDetails('');
    setShowAdd(false);
  };

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeInfo = id => CHANGE_TYPES.find(t => t.id === id) || CHANGE_TYPES[6];

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-wide">
        <div className="ps-modal-header">
          <h2>Update History</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ps-toolbar">
          <div className="ps-filter-group">
            <button
              className={`ps-btn ps-btn-small ${filter === 'all' ? 'ps-btn-primary' : 'ps-btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {CHANGE_TYPES.map(t => (
              <button
                key={t.id}
                className={`ps-btn ps-btn-small ${filter === t.id ? 'ps-btn-primary' : 'ps-btn-secondary'}`}
                onClick={() => setFilter(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button
            className="ps-btn ps-btn-primary ps-btn-small"
            onClick={() => setShowAdd(!showAdd)}
          >
            + Log Change
          </button>
        </div>

        {showAdd && (
          <div className="ps-add-form">
            <div className="ps-field">
              <label className="ps-field-label">Type</label>
              <select
                className="ps-input"
                value={newType}
                onChange={e => setNewType(e.target.value)}
              >
                {CHANGE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="ps-field">
              <label className="ps-field-label">Summary *</label>
              <input
                type="text"
                className="ps-input"
                value={newSummary}
                placeholder="What changed?"
                onChange={e => setNewSummary(e.target.value)}
              />
            </div>
            <div className="ps-field">
              <label className="ps-field-label">Details</label>
              <textarea
                className="ps-input"
                value={newDetails}
                rows={3}
                placeholder="Optional details..."
                onChange={e => setNewDetails(e.target.value)}
              />
            </div>
            <div className="ps-form-actions">
              <button className="ps-btn ps-btn-secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button
                className="ps-btn ps-btn-primary"
                onClick={handleAdd}
                disabled={!newSummary.trim()}
              >
                Add Entry
              </button>
            </div>
          </div>
        )}

        <div className="ps-modal-body ps-timeline">
          {sorted.length === 0 ? (
            <div className="ps-empty">No changes logged yet.</div>
          ) : (
            sorted.map((entry, i) => {
              const typeInfo = getTypeInfo(entry.type);
              return (
                <div key={i} className="ps-timeline-entry">
                  <div className="ps-timeline-icon">{typeInfo.icon}</div>
                  <div className="ps-timeline-content">
                    <div className="ps-timeline-header">
                      <span className="ps-timeline-type">{typeInfo.label}</span>
                      <span className="ps-timeline-date">{formatDate(entry.timestamp)}</span>
                    </div>
                    <div className="ps-timeline-summary">{entry.summary}</div>
                    {entry.details && (
                      <div className="ps-timeline-details">{entry.details}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
