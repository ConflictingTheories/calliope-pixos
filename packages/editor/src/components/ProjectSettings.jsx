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
 * Project Settings: form-based editor for manifest.json
 * Validates on input, shows errors clearly.
 */

const FIELD_DEFS = [
  {
    key: 'title',
    label: 'Game Title',
    type: 'text',
    required: true,
    validate: v => v && v.trim().length > 0 ? null : 'Title is required',
  },
  {
    key: 'version',
    label: 'Version',
    type: 'text',
    required: true,
    placeholder: '1.0.0',
    validate: v => /^\d+\.\d+\.\d+$/.test(v || '') ? null : 'Use format like 1.0.0',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    validate: () => null,
  },
  {
    key: 'initialZones',
    label: 'Starting Maps',
    type: 'list',
    hint: 'Maps the player starts in',
    validate: v => v && v.length > 0 ? null : 'Need at least one starting map',
  },
  {
    key: 'modes',
    label: 'Game Modes',
    type: 'list',
    hint: 'e.g. explore, battle, tactics',
    validate: v => v && v.length > 0 ? null : 'Need at least one mode',
  },
];

export default function ProjectSettings({ manifest, onSave, onClose }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setValues({ ...(manifest || {}) });
  }, [manifest]);

  const validateField = (key, value) => {
    const def = FIELD_DEFS.find(f => f.key === key);
    if (!def || !def.validate) return null;
    return def.validate(value);
  };

  const validateAll = vals => {
    const errs = {};
    for (const def of FIELD_DEFS) {
      const err = validateField(def.key, vals[def.key]);
      if (err) errs[def.key] = err;
    }
    return errs;
  };

  const handleChange = (key, value) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    setTouched({ ...touched, [key]: true });
    // Validate on change if already touched
    if (touched[key]) {
      setErrors({ ...errors, [key]: validateField(key, value) });
    }
  };

  const handleBlur = key => {
    setTouched({ ...touched, [key]: true });
    setErrors({ ...errors, [key]: validateField(key, values[key]) });
  };

  const handleSave = () => {
    const errs = validateAll(values);
    setErrors(errs);
    setTouched(Object.fromEntries(FIELD_DEFS.map(f => [f.key, true])));
    if (Object.keys(errs).length === 0) {
      onSave(values);
    }
  };

  const renderField = def => {
    const err = touched[def.key] && errors[def.key];
    const val = values[def.key] ?? (def.type === 'list' ? [] : '');

    return (
      <div key={def.key} className="ps-field">
        <label className="ps-field-label">
          {def.label}
          {def.required && <span className="ps-required">*</span>}
        </label>
        {def.hint && <div className="ps-field-hint">{def.hint}</div>}

        {def.type === 'text' && (
          <input
            type="text"
            className={`ps-input ${err ? 'ps-input-error' : ''}`}
            value={val}
            placeholder={def.placeholder || ''}
            onChange={e => handleChange(def.key, e.target.value)}
            onBlur={() => handleBlur(def.key)}
          />
        )}

        {def.type === 'textarea' && (
          <textarea
            className={`ps-input ${err ? 'ps-input-error' : ''}`}
            value={val}
            rows={3}
            onChange={e => handleChange(def.key, e.target.value)}
            onBlur={() => handleBlur(def.key)}
          />
        )}

        {def.type === 'list' && (
          <ListEditor
            items={val}
            onChange={items => handleChange(def.key, items)}
            onBlur={() => handleBlur(def.key)}
            hasError={!!err}
          />
        )}

        {err && <div className="ps-field-error">{err}</div>}
      </div>
    );
  };

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal">
        <div className="ps-modal-header">
          <h2>Project Settings</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ps-modal-body">
          {FIELD_DEFS.map(renderField)}
        </div>
        <div className="ps-modal-footer">
          <button className="ps-btn ps-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="ps-btn ps-btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ListEditor({ items, onChange, onBlur, hasError }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) {
      onChange([...items, v]);
      setInput('');
    }
  };

  const remove = idx => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className={`ps-list-editor ${hasError ? 'ps-input-error' : ''}`}>
      <div className="ps-list-items">
        {items.map((item, i) => (
          <span key={i} className="ps-chip">
            {item}
            <button onClick={() => remove(i)} aria-label={`Remove ${item}`}>×</button>
          </span>
        ))}
      </div>
      <div className="ps-list-add">
        <input
          type="text"
          className="ps-input"
          value={input}
          placeholder="Add item..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={onBlur}
        />
        <button className="ps-btn ps-btn-secondary" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}
