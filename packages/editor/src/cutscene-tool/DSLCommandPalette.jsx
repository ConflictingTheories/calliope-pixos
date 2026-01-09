/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – DSLCommandPalette Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A command palette for inserting DSL commands into cutscene scripts.
 * Provides searchable list of all available commands with parameter forms.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Input, Button, InputNumber, SelectPicker, Toggle } from '../ui';
import { EXTENDED_COMMANDS, getCommandsByCategory } from './ExtendedDSLCommands.js';
import './dsl-command-palette.css';

// Category display info
const CATEGORY_INFO = {
  camera: { label: 'Camera', icon: '🎥' },
  effects: { label: 'Screen Effects', icon: '✨' },
  text: { label: 'Text Display', icon: '📝' },
  sprites: { label: 'Sprites', icon: '🎭' },
  conditions: { label: 'Conditions', icon: '❓' },
  timing: { label: 'Timing', icon: '⏱️' },
  dialogue: { label: 'Dialogue & Choice', icon: '💬' }
};

/**
 * DSLCommandPalette - Command palette for DSL insertion
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether palette is open
 * @param {function} props.onClose - Close callback
 * @param {function} props.onInsert - Callback to insert command (receives string)
 */
function DSLCommandPalette({
  open,
  onClose,
  onInsert
}) {
  const [search, setSearch] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [params, setParams] = useState({});

  // Get categorized commands
  const categorizedCommands = useMemo(() => getCommandsByCategory(), []);

  // Filter commands by search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return categorizedCommands;
    
    const searchLower = search.toLowerCase();
    const filtered = {};
    
    for (const [cat, commands] of Object.entries(categorizedCommands)) {
      const matching = commands.filter(cmd => 
        cmd.key.toLowerCase().includes(searchLower) ||
        cmd.description.toLowerCase().includes(searchLower) ||
        cmd.syntax.toLowerCase().includes(searchLower)
      );
      if (matching.length > 0) {
        filtered[cat] = matching;
      }
    }
    
    return filtered;
  }, [categorizedCommands, search]);

  // Handle command selection
  const handleSelectCommand = useCallback((cmd) => {
    setSelectedCommand(cmd);
    // Initialize params with defaults
    const defaults = {};
    for (const [key, param] of Object.entries(cmd.params || {})) {
      defaults[key] = param.default;
    }
    setParams(defaults);
  }, []);

  // Handle param change
  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Insert command
  const handleInsert = useCallback(() => {
    if (!selectedCommand) return;
    const generated = selectedCommand.generate(params);
    onInsert?.(generated);
    handleClose();
  }, [selectedCommand, params, onInsert]);

  // Close and reset
  const handleClose = useCallback(() => {
    setSearch('');
    setSelectedCommand(null);
    setParams({});
    onClose?.();
  }, [onClose]);

  // Render parameter input based on type
  const renderParamInput = (key, param) => {
    switch (param.type) {
    case 'number':
      return (
        <InputNumber
          size="sm"
          value={params[key]}
          onChange={(val) => handleParamChange(key, val)}
          step={param.step || 1}
        />
      );
    case 'string':
      return (
        <Input
          size="sm"
          value={params[key] || ''}
          onChange={(val) => handleParamChange(key, val)}
          placeholder={param.description}
        />
      );
    case 'color':
      return (
        <div className="dsl-param-color">
          <input
            type="color"
            value={params[key] || '#000000'}
            onChange={(e) => handleParamChange(key, e.target.value)}
          />
          <Input
            size="sm"
            value={params[key] || ''}
            onChange={(val) => handleParamChange(key, val)}
            style={{ width: 80 }}
          />
        </div>
      );
    case 'boolean':
      return (
        <Toggle
          checked={params[key] || false}
          onChange={(val) => handleParamChange(key, val)}
        />
      );
    case 'select':
      return (
        <SelectPicker
          size="sm"
          data={param.options.map(o => ({ label: o, value: o }))}
          value={params[key]}
          onChange={(val) => handleParamChange(key, val)}
          cleanable={false}
          searchable={false}
          style={{ width: 150 }}
        />
      );
    default:
      return (
        <Input
          size="sm"
          value={params[key] || ''}
          onChange={(val) => handleParamChange(key, val)}
        />
      );
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="md" className="dsl-command-palette">
      <Modal.Header>
        <Modal.Title>
          {selectedCommand ? (
            <span>
              <span style={{ marginRight: 8 }}>{selectedCommand.icon}</span>
              {selectedCommand.key}
            </span>
          ) : (
            'Insert DSL Command'
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedCommand ? (
          <div className="dsl-command-list">
            {/* Search */}
            <div className="dsl-search">
              <Input
                placeholder="Search commands..."
                value={search}
                onChange={setSearch}
                autoFocus
              />
            </div>

            {/* Command Categories */}
            <div className="dsl-categories">
              {Object.entries(filteredCommands).map(([category, commands]) => (
                <div key={category} className="dsl-category">
                  <div className="dsl-category__header">
                    <span>{CATEGORY_INFO[category]?.icon || '📌'}</span>
                    <span>{CATEGORY_INFO[category]?.label || category}</span>
                  </div>
                  <div className="dsl-category__commands">
                    {commands.map(cmd => (
                      <button
                        key={cmd.key}
                        className="dsl-command-btn"
                        onClick={() => handleSelectCommand(cmd)}
                      >
                        <span className="dsl-command-btn__icon">{cmd.icon}</span>
                        <div className="dsl-command-btn__content">
                          <div className="dsl-command-btn__name">{cmd.key}</div>
                          <div className="dsl-command-btn__desc">{cmd.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dsl-command-form">
            {/* Syntax preview */}
            <div className="dsl-syntax">
              <code>{selectedCommand.syntax}</code>
            </div>

            {/* Description */}
            <p className="dsl-description">{selectedCommand.description}</p>

            {/* Parameters */}
            {Object.keys(selectedCommand.params || {}).length > 0 && (
              <div className="dsl-params">
                <h4>Parameters</h4>
                {Object.entries(selectedCommand.params).map(([key, param]) => (
                  <div key={key} className="dsl-param">
                    <label>
                      <span className="dsl-param__name">{key}</span>
                      <span className="dsl-param__type">({param.type})</span>
                    </label>
                    {renderParamInput(key, param)}
                    <span className="dsl-param__desc">{param.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="dsl-preview">
              <h4>Preview</h4>
              <code>{selectedCommand.generate(params)}</code>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {selectedCommand ? (
          <>
            <Button onClick={() => setSelectedCommand(null)} appearance="subtle">
              ← Back
            </Button>
            <Button onClick={handleInsert} appearance="primary">
              Insert Command
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} appearance="subtle">
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DSLCommandPalette;
