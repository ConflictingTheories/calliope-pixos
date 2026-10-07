/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ExportDialog
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2, backlog 2.9 / finding A7.2) Export is no longer
 * one button with no options.  This dialog offers format choice,
 * uses the deterministic exportProject() path when a repository
 * is available, and shows progress + errors instead of failing
 * silently.
 */

import React, { useState, useCallback } from 'react';
import { Modal, Button, Input, Radio, RadioGroup, Progress } from '../ui';
import { useToast } from '../shared/components/Toast.jsx';
import './ExportDialog.css';

const FORMATS = [
  {
    value: 'pxz',
    label: '.pxz — PixoSpritz package',
    description: 'Native package format. Use for sharing and publishing.',
  },
  {
    value: 'zip',
    label: '.zip — Plain archive',
    description: 'Standard zip. Use for external tools.',
  },
];

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   zip: any,                    JSZip instance (fallback path)
 *   repository?: { exportProject: () => Promise<{bytes: Uint8Array}> },
 *   defaultFileName?: string
 * }} props
 */
export function ExportDialog({ open, onClose, zip, repository, defaultFileName = 'pixospritz-package' }) {
  const toast = useToast();
  const [format, setFormat] = useState('pxz');
  const [fileName, setFileName] = useState(defaultFileName);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const doExport = useCallback(async () => {
    const name = (fileName.trim() || defaultFileName).replace(/\.(pxz|zip)$/i, '');
    const ext = format === 'pxz' ? 'pxz' : 'zip';
    setBusy(true);
    setProgress({ percent: 10, label: 'Preparing package…' });
    try {
      let blob;
      if (repository && typeof repository.exportProject === 'function') {
        // Deterministic path: sorted entries, stable bytes.
        setProgress({ percent: 30, label: 'Building deterministic package…' });
        const { bytes } = await repository.exportProject();
        setProgress({ percent: 80, label: 'Finalizing…' });
        blob = new Blob([bytes], { type: 'application/zip' });
      } else if (zip) {
        setProgress({ percent: 30, label: 'Compressing…' });
        blob = await zip.generateAsync(
          { type: 'blob', compression: 'DEFLATE' },
          metadata => {
            setProgress({
              percent: 30 + Math.round(metadata.percent * 0.5),
              label: `Compressing… ${Math.round(metadata.percent)}%`,
            });
          }
        );
      } else {
        throw new Error('No package loaded to export.');
      }
      setProgress({ percent: 95, label: 'Downloading…' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success(`Exported ${name}.${ext}`, { title: 'Export complete' });
      onClose();
    } catch (err) {
      // (Style guide §6.2) No silent failures — surface what happened.
      toast.error(`Export failed: ${err.message || err}`, { title: 'Export failed' });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [fileName, defaultFileName, format, repository, zip, toast, onClose]);

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} size="sm">
      <Modal.Header onClose={busy ? undefined : onClose}>
        <Modal.Title>Export package</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div className="export-dialog">
        <div className="export-dialog__field">
          <label className="export-dialog__label" htmlFor="export-filename">
            File name
          </label>
          <Input
            id="export-filename"
            value={fileName}
            onChange={setFileName}
            disabled={busy}
            placeholder={defaultFileName}
          />
        </div>
        <div className="export-dialog__field">
          <span className="export-dialog__label">Format</span>
          <RadioGroup value={format} onChange={setFormat}>
            {FORMATS.map(f => (
              <Radio key={f.value} value={f.value} disabled={busy}>
                <span className="export-dialog__format-label">{f.label}</span>
                <span className="export-dialog__format-desc">{f.description}</span>
              </Radio>
            ))}
          </RadioGroup>
        </div>
        {progress && (
          <div className="export-dialog__progress">
            <Progress percent={progress.percent} />
            <span className="export-dialog__progress-label">{progress.label}</span>
          </div>
        )}
        {!repository && (
          <p className="export-dialog__note">
            Note: exporting from the raw archive. Deterministic export is
            available when the project repository is connected.
          </p>
        )}
      </div>
      </Modal.Body>
      <Modal.Footer>
      <div className="export-dialog__footer">
        <Button appearance="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={doExport} disabled={busy} loading={busy}>
          {busy ? 'Exporting…' : 'Export'}
        </Button>
      </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ExportDialog;
