/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – NewFileDialog
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2) In-app dialog for creating a new file, replacing
 * the blocking window.prompt().  Offers templates per file type
 * so a new script/map starts from something useful, not empty.
 */

import React, { useState } from 'react';
import { Modal, Button, Input, SelectPicker } from '../ui';
import './NewFileDialog.css';

const TEMPLATES = [
  {
    value: 'pxs',
    label: 'PixoScript (.pxs)',
    placeholder: 'myscript.pxs',
    content: '-- New pixoscript\n-- Describe what this script does\n\nfunction onStart()\n  -- runs when the scene starts\nend\n',
  },
  {
    value: 'map',
    label: 'Map (.json)',
    placeholder: 'maps/village.json',
    content: '{\n  "name": "New Map",\n  "width": 20,\n  "height": 15,\n  "layers": []\n}\n',
  },
  {
    value: 'json',
    label: 'Data (.json)',
    placeholder: 'data/config.json',
    content: '{\n}\n',
  },
  {
    value: 'txt',
    label: 'Text (.txt)',
    placeholder: 'notes.txt',
    content: '',
  },
];

export function NewFileDialog({ open, onClose, onCreate }) {
  const [template, setTemplate] = useState('pxs');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const selected = TEMPLATES.find(t => t.value === template);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a file name.');
      return;
    }
    // Ensure the extension matches the template.
    const ext = template === 'map' || template === 'json' ? '.json'
      : template === 'txt' ? '.txt' : '.pxs';
    const finalName = trimmed.toLowerCase().endsWith(ext) ? trimmed : trimmed + ext;
    setError(null);
    onCreate(finalName, selected.content);
    setName('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header onClose={onClose}>
        <Modal.Title>New file</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="new-file-dialog">
          <div className="new-file-dialog__field">
            <span className="new-file-dialog__label">Template</span>
            <SelectPicker
              value={template}
              onChange={setTemplate}
              data={TEMPLATES.map(t => ({ value: t.value, label: t.label }))}
              style={{ width: '100%' }}
            />
          </div>
          <div className="new-file-dialog__field">
            <label className="new-file-dialog__label" htmlFor="new-file-name">
              File name
            </label>
            <Input
              id="new-file-name"
              value={name}
              onChange={setName}
              placeholder={selected.placeholder}
              onPressEnter={handleCreate}
            />
          </div>
          {error && <p className="new-file-dialog__error" role="alert">{error}</p>}
          <p className="new-file-dialog__hint">
            Tip: use folders (e.g. <code>maps/village.json</code>) to keep
            the asset tree organized.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="new-file-dialog__footer">
          <Button appearance="ghost" onClick={onClose}>Cancel</Button>
          <Button appearance="primary" onClick={handleCreate}>Create file</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default NewFileDialog;
