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
import { useConfirm } from '../shared/hooks/useConfirm.jsx';

/**
 * Mode Editor: form-based editor for game modes.
 * Each mode has a name, setup script, and update script.
 */

export default function ModeEditor({ mode, onSave, onClose, onDelete }) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [name, setName] = useState('');
  const [setupScript, setSetupScript] = useState('');
  const [updateScript, setUpdateScript] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (mode) {
      setName(mode.name || '');
      setSetupScript(mode.setup || '');
      setUpdateScript(mode.update || '');
    }
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Mode name is required';
    } else if (!/^[a-z0-9-_]+$/.test(name)) {
      errs.name = 'Use lowercase letters, numbers, hyphens, underscores';
    }
    // Scripts are optional but warn if empty
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true });
    if (Object.keys(errs).length === 0) {
      onSave({
        name: name.trim(),
        setup: setupScript,
        update: updateScript,
      });
    }
  };

  return (
    <>
      <ConfirmDialog />
      <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-wide">
        <div className="ps-modal-header">
          <h2>{mode ? 'Edit Mode' : 'New Mode'}</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ps-modal-body">
          <div className="ps-field">
            <label className="ps-field-label">
              Mode Name <span className="ps-required">*</span>
            </label>
            <div className="ps-field-hint">
              Lowercase, no spaces. e.g. explore, battle, tactics
            </div>
            <input
              type="text"
              className={`ps-input ${touched.name && errors.name ? 'ps-input-error' : ''}`}
              value={name}
              placeholder="explore"
              onChange={e => setName(e.target.value)}
              onBlur={() => {
                setTouched({ ...touched, name: true });
                setErrors(validate());
              }}
            />
            {touched.name && errors.name && (
              <div className="ps-field-error">{errors.name}</div>
            )}
          </div>

          <div className="ps-field">
            <label className="ps-field-label">Setup Script</label>
            <div className="ps-field-hint">
              Runs once when the mode starts. Initialize units, state, UI.
            </div>
            <textarea
              className="ps-input ps-code"
              value={setupScript}
              rows={8}
              placeholder="-- Setup code here"
              onChange={e => setSetupScript(e.target.value)}
            />
          </div>

          <div className="ps-field">
            <label className="ps-field-label">Update Script</label>
            <div className="ps-field-hint">
              Runs every frame. Handle input, game logic, win/lose.
            </div>
            <textarea
              className="ps-input ps-code"
              value={updateScript}
              rows={12}
              placeholder="-- Update code here"
              onChange={e => setUpdateScript(e.target.value)}
            />
          </div>
        </div>
        <div className="ps-modal-footer">
          <div>
            {mode && onDelete && (
              <button
                className="ps-btn ps-btn-danger"
                onClick={async () => {
                  if (await confirm(`Delete mode "${name}"? This cannot be undone.`)) onDelete(mode);
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div>
            <button className="ps-btn ps-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="ps-btn ps-btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
