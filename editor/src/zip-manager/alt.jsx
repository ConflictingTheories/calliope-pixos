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
import {
  Panel,
  Uploader,
  List,
  Message,
  Loader,
  Placeholder,
  Button,
} from 'rsuite';

function ZipManager({ openFile, onZipLoaded }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zip, setZip] = useState(null);

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
    }
  }

  // Create a new empty file (script, map, etc.) in the zip
  function createNewFile() {
    if (!zip) return;
    const name = window.prompt('Enter new file name (e.g. myscript.lua, map.json)');
    if (!name) return;
    let defaultContent = '';
    if (name.endsWith('.json')) {
      defaultContent = '{}';
    } else if (name.endsWith('.pxs')) {
      defaultContent = '-- New pixoscript\n';
    }
    try {
      zip.file(name, defaultContent);
      const entry = zip.file(name);
      setEntries((prev) => [...prev, { name, file: entry }]);
    } catch (err) {
      console.error('Failed to create file', err);
    }
  }

  return (
    <Panel bordered header={<strong>Zip Manager</strong>}> 
      <Uploader
        autoUpload={false}
        multiple={false}
        accept='.zip'
        onChange={handleFileChange}
        style={{ marginBottom: '1rem' }}
      >
        <button type='button'>Select Zip</button>
      </Uploader>
      {loading && <Loader center content='Loading zip…' />}
      {error && <Message type='error'>{error}</Message>}
      {entries.length > 0 ? (
        <List hover bordered style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {entries.map((entry, idx) => (
            <List.Item
              key={idx}
              onClick={() => openFile(entry)}
              style={{ cursor: 'pointer' }}
            >
              {entry.name}
            </List.Item>
          ))}
        </List>
      ) : !loading && (
        <Placeholder.Paragraph rows={4} active />
      )}
      {zip && entries.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <Button appearance='primary' onClick={async () => {
            try {
              const blob = await zip.generateAsync({ type: 'blob' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'pixospritz-package.zip';
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch (err) {
              console.error('Failed to export zip', err);
            }
          }}>
            Export ZIP
          </Button>
        </div>
      )}
      {/* Project actions */}
      <div style={{ marginTop: '1rem' }}>
        <Button appearance='default' onClick={createNewProject}>
          New Project
        </Button>
        <Uploader
          autoUpload={false}
          multiple
          onChange={(files) => importFiles(files)}
          style={{ display: 'inline-block', marginLeft: '0.5rem' }}
        >
          <Button appearance='default'>Add Files</Button>
        </Uploader>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={createNewFile}>
          New File
        </Button>
      </div>
    </Panel>
  );
}

export default ZipManager;