/*
 * ---------------------------------------------------------------
 *                   Pixospritz – Editor – Zip Manager
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A minimal zip file explorer for the Pixospritz editor.  It
 * allows the user to select a zip archive from disk, reads
 * its contents using JSZip and lists the files in a simple
 * scrollable list.  Clicking on a file dispatches the entry
 * back to the parent via the provided `openFile` callback.
 * Only file entries (not directories) are shown.  For more
 * advanced features like extraction, renaming or saving back
 * into the zip archive the original zip-manager could be
 * integrated in future iterations.
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import { Panel, Uploader, Message, Loader, Button } from '../ui';
import { useToast } from '../shared/components/Toast.jsx';
// (UX Phase 2) Hierarchical asset tree replaces the flat file list
// (finding A2.1) — folders from zip paths, search, type badges.
import { AssetTree } from './components/AssetTree.jsx';
// (UX Phase 2) Export dialog with options, progress, and deterministic
// output (finding A7.2) — replaces the one-button export.
import { ExportDialog } from './ExportDialog.jsx';
// (UX Phase 2) In-app new-file dialog replaces window.prompt().
import { NewFileDialog } from './NewFileDialog.jsx';

function ZipManager({ openFile, onZipLoaded }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zip, setZip] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const toast = useToast();

  /**
   * Handle file selection from the user.  Reads the first file
   * provided, loads it as a zip archive and enumerates its
   * entries.  Only non-directory entries are stored; each entry
   * is wrapped with its JSZip object so it can be read later.
   */
  async function handleFileChange(fileList) {
    if (!fileList || fileList.length === 0) return;
    const fileItem = fileList[0];
    // Support both RSuite fileItem objects and raw File objects
    const file = fileItem.blobFile || fileItem;
    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const zipObj = await JSZip.loadAsync(arrayBuffer);
      const newEntries = [];
      zipObj.forEach((relativePath, zipEntry) => {
        // Skip directories
        if (!zipEntry.dir) {
          newEntries.push({ name: zipEntry.name, file: zipEntry });
        }
      });
      setEntries(newEntries);
      setError(null);
      setZip(zipObj);
      if (onZipLoaded) {
        onZipLoaded(zipObj);
      }
    } catch (err) {
      console.error('Failed to open zip:', err);
      setEntries([]);
      setError('Failed to read zip file');
      toast.error('Failed to read zip file', { title: 'Open failed' });
    } finally {
      setLoading(false);
    }
  }

  // Create a new empty project (zip).  Resets the current zip
  // object and clears the entries list.
  function createNewProject() {
    const newZip = new JSZip();
    setZip(newZip);
    setEntries([]);
    setError(null);
    if (onZipLoaded) {
      onZipLoaded(newZip);
    }
  }

  // Import one or more external files into the current zip
  async function importFiles(fileList) {
    if (!zip || !fileList || fileList.length === 0) return;
    try {
      for (const item of fileList) {
        const file = item.blobFile || item;
        // Use ArrayBuffer to preserve binary files
        const buffer = await file.arrayBuffer();
        zip.file(file.name, buffer);
      }
      // Rebuild the entries list
      const updatedEntries = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) updatedEntries.push({ name: zipEntry.name, file: zipEntry });
      });
      setEntries(updatedEntries);
      setError(null);
    } catch (err) {
      console.error('Failed to import files:', err);
      setError('Failed to import files');
      toast.error('Failed to import files. See console for details.', { title: 'Import failed' });
    }
  }

  // Create a new file (script, map, etc.) in the zip via the dialog.
  // (UX Phase 2) window.prompt() replaced with an in-app dialog.
  function createNewFile(name, defaultContent) {
    if (!zip) return;
    try {
      zip.file(name, defaultContent);
      const entry = zip.file(name);
      setEntries(prev => [...prev, { name, file: entry }]);
      toast.success(`Created ${name}`);
      if (openFile) openFile({ name, file: entry });
    } catch (err) {
      console.error('Failed to create file', err);
      toast.error(`Failed to create file: ${err.message || err}`, { title: 'Create failed' });
    }
  }

  return (
    <Panel bordered header={<strong>Zip Manager</strong>}>
      <Uploader
        autoUpload={false}
        multiple={false}
        accept=".pxz,.zip"
        onChange={handleFileChange}
        style={{ marginBottom: '1rem' }}
      >
        <button type="button">Select Zip</button>
      </Uploader>
      {loading && <Loader center content="Loading package…" />}
      {error && <Message type="error">{error}</Message>}
      {/* (UX Phase 2) Asset tree: hierarchical, searchable, typed (finding A2.1). */}
      <AssetTree entries={entries} onOpen={openFile} />
      {zip && entries.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <Button appearance="primary" onClick={() => setExportOpen(true)}>
            Export…
          </Button>
          <ExportDialog
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            zip={zip}
          />
        </div>
      )}
      {/* Project actions */}
      <div style={{ marginTop: '1rem' }}>
        <Button appearance="default" onClick={createNewProject}>
          New Project
        </Button>
        <Uploader
          autoUpload={false}
          multiple
          onChange={files => importFiles(files)}
          style={{ display: 'inline-block', marginLeft: '0.5rem' }}
        >
          <Button appearance="default">Add Files</Button>
        </Uploader>
        <Button appearance="default" style={{ marginLeft: '0.5rem' }} onClick={() => setNewFileOpen(true)}>
          New File…
        </Button>
        <NewFileDialog
          open={newFileOpen}
          onClose={() => setNewFileOpen(false)}
          onCreate={createNewFile}
        />
      </div>
    </Panel>
  );
}

export default ZipManager;
