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

/**
 * BehaviorEditor: attach behaviors and scripts to scene objects visually.
 *
 * - Pick from built-in behaviors (wander, dialog, chest, trigger, door)
 * - Configure parameters via form
 * - Attach PixoScript hooks (onInteract, onEnter, onUpdate, etc.)
 */

const BUILT_IN_BEHAVIORS = [
  {
    id: 'wander',
    label: 'Wander',
    icon: '🚶',
    description: 'NPC moves randomly within a radius',
    params: [
      { key: 'radius', label: 'Radius', type: 'number', default: 3, min: 1, max: 10 },
      { key: 'speed', label: 'Speed', type: 'number', default: 1, min: 0.1, max: 5, step: 0.1 },
    ],
  },
  {
    id: 'dialog',
    label: 'Dialog',
    icon: '💬',
    description: 'Talk with greeting and options',
    params: [
      { key: 'greeting', label: 'Greeting', type: 'text', default: 'Hello!' },
    ],
  },
  {
    id: 'chest',
    label: 'Chest',
    icon: '📦',
    description: 'Openable container with items',
    params: [
      { key: 'items', label: 'Items (comma-separated)', type: 'text', default: '' },
      { key: 'locked', label: 'Locked', type: 'checkbox', default: false },
    ],
  },
  {
    id: 'trigger',
    label: 'Trigger',
    icon: '⚡',
    description: 'Fires when player enters area',
    params: [
      { key: 'once', label: 'Fire once', type: 'checkbox', default: true },
      { key: 'radius', label: 'Radius', type: 'number', default: 1, min: 1, max: 5 },
    ],
  },
  {
    id: 'door',
    label: 'Door',
    icon: '🚪',
    description: 'Open/close, optionally linked to portal',
    params: [
      { key: 'portalId', label: 'Linked Portal ID', type: 'text', default: '' },
    ],
  },
];

const SCRIPT_HOOKS = ['onInteract', 'onEnter', 'onExit', 'onUpdate'];

export default function BehaviorEditor({ object, onSave, onClose }) {
  const [behaviors, setBehaviors] = useState(object?.behaviors || {});
  const [scripts, setScripts] = useState(object?.scripts || {});
  const [showAdd, setShowAdd] = useState(false);

  const addBehavior = behaviorDef => {
    const config = {};
    for (const p of behaviorDef.params) {
      config[p.key] = p.default;
    }
    setBehaviors({ ...behaviors, [behaviorDef.id]: config });
    setShowAdd(false);
  };

  const removeBehavior = id => {
    const b = { ...behaviors };
    delete b[id];
    setBehaviors(b);
  };

  const updateParam = (behaviorId, paramKey, value) => {
    setBehaviors({
      ...behaviors,
      [behaviorId]: { ...behaviors[behaviorId], [paramKey]: value },
    });
  };

  const updateScript = (hook, file) => {
    if (!file.trim()) {
      const s = { ...scripts };
      delete s[hook];
      setScripts(s);
    } else {
      setScripts({ ...scripts, [hook]: file.trim() });
    }
  };

  const handleSave = () => {
    // Parse comma-separated items for chest
    const processed = { ...behaviors };
    if (processed.chest?.items && typeof processed.chest.items === 'string') {
      processed.chest.items = processed.chest.items.split(',').map(s => s.trim()).filter(Boolean);
    }
    onSave({ behaviors: processed, scripts });
  };

  const renderParam = (behaviorId, param) => {
    const value = behaviors[behaviorId][param.key];
    if (param.type === 'checkbox') {
      return (
        <label key={param.key} className="ps-checkbox">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => updateParam(behaviorId, param.key, e.target.checked)}
          />
          {param.label}
        </label>
      );
    }
    return (
      <div key={param.key} className="ps-field">
        <label className="ps-field-label">{param.label}</label>
        <input
          type={param.type}
          className="ps-input"
          value={value}
          min={param.min}
          max={param.max}
          step={param.step}
          onChange={e => updateParam(
            behaviorId,
            param.key,
            param.type === 'number' ? parseFloat(e.target.value) : e.target.value
          )}
        />
      </div>
    );
  };

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-wide">
        <div className="ps-modal-header">
          <h2>Behaviors: {object?.id || 'Object'}</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ps-modal-body">
          <h3>Declarative Behaviors</h3>
          {Object.keys(behaviors).length === 0 && (
            <div className="ps-empty">No behaviors. Add one below.</div>
          )}
          {Object.entries(behaviors).map(([id, config]) => {
            const def = BUILT_IN_BEHAVIORS.find(b => b.id === id);
            if (!def) return null;
            return (
              <div key={id} className="ps-behavior-card">
                <div className="ps-behavior-header">
                  <span>{def.icon} {def.label}</span>
                  <button
                    className="ps-btn-icon"
                    onClick={() => removeBehavior(id)}
                    aria-label={`Remove ${def.label}`}
                  >
                    ×
                  </button>
                </div>
                <div className="ps-behavior-desc">{def.description}</div>
                {def.params.map(p => renderParam(id, p))}
              </div>
            );
          })}

          {showAdd ? (
            <div className="ps-behavior-picker">
              {BUILT_IN_BEHAVIORS.filter(b => !behaviors[b.id]).map(b => (
                <button
                  key={b.id}
                  className="ps-btn ps-btn-secondary"
                  onClick={() => addBehavior(b)}
                >
                  {b.icon} {b.label}
                </button>
              ))}
              <button className="ps-btn ps-btn-secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="ps-btn ps-btn-secondary" onClick={() => setShowAdd(true)}>
              + Add Behavior
            </button>
          )}

          <h3>Script Hooks</h3>
          <div className="ps-field-hint">
            Attach PixoScript files to object events. Scripts run after declarative behaviors.
          </div>
          {SCRIPT_HOOKS.map(hook => (
            <div key={hook} className="ps-field">
              <label className="ps-field-label">{hook}</label>
              <input
                type="text"
                className="ps-input ps-code"
                value={scripts[hook] || ''}
                placeholder={`${hook}.pxs`}
                onChange={e => updateScript(hook, e.target.value)}
              />
            </div>
          ))}
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

export { BUILT_IN_BEHAVIORS };
