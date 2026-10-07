/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – migrateTool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-10) Shared adapter for migrating legacy tools onto the new
 * core without redesigning them.  The container:
 *   1. Loads the document through the DocumentRegistry (validates
 *      kind; unknown kinds stay inspectable).
 *   2. Registers the tool's shell commands (palette + keymap).
 *   3. Routes onSave through the CommandBus so edits are undoable
 *      (operation-specific inverses, not snapshots).
 *   4. Exposes resolveAsset() backed by the ProjectRepository,
 *      replacing direct zip.root / getData lookups.
 *
 * The wrapped view component keeps its existing props contract
 * (content/onSave/…) — only the source of those props changes.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { createPreviewUrl, revokePreviewUrl } from '../shared/blobUrls.js';

/**
 * @param {Object} spec
 * @param {string} spec.kind            registry kind for the document
 * @param {React.ComponentType} spec.View  the legacy view component
 * @param {Array} [spec.commands]       shell command defs
 * @param {(ctx) => Object} [spec.mapProps]  ctx -> extra view props
 */
export function createMigratedTool({ kind, View, commands: commandDefs = [], mapProps }) {
  function MigratedTool({ documentPath, core, bytes, text, mime, initialProps = {} }) {
    const { registry, commands, bus, store, repository } = core;
    const urlRef = useRef('');

    const inspection = useMemo(() => {
      const data = text !== undefined ? text : bytes;
      if (data === undefined) return { kind: 'unknown', data: null, issues: [] };
      return registry.loadDocument(data, { kind, path: documentPath });
    }, [registry, bytes, text, documentPath]);

    // Repository-backed asset resolution (replaces zip.root/getData).
    const resolveAsset = useMemo(
      () => ({
        list: (dir = '') => repository.list(dir),
        read: path => repository.read(path, { as: 'bytes' }),
        exists: path => repository.exists(path),
      }),
      [repository]
    );

    // onSave routed through the command bus (undoable content replace).
    // The bus is synchronous; the async repository I/O happens around
    // it, and the bus records the undoable op with its before/after.
    const handleSave = useMemo(
      () => async newContent => {
        // Legacy views hand back either text or a JS object; normalize to text.
        const data =
          typeof newContent === 'string' ? newContent : JSON.stringify(newContent, null, 2);
        const prev = await repository.read(documentPath).catch(() => null);
        await repository.write(documentPath, data);
        store.touchDocument(documentPath, data);
        bus.execute({
          name: `tool.save.${kind}`,
          documents: [documentPath],
          do: () => ({ prev, next: data }),
          undo: (_ctx, result) => {
            // Async restore; the store is marked dirty once it lands.
            // (Documented caveat: concurrent saves interleave at tool granularity.)
            repository
              .write(documentPath, result.prev ?? '')
              .then(() => store.touchDocument(documentPath, result.prev ?? ''));
          },
        });
      },
      [bus, store, repository, documentPath, kind]
    );

    useEffect(() => {
      const offs = commandDefs.map(def => commands.register(def));
      return () => offs.forEach(off => off());
    }, [commands]);

    useEffect(() => () => revokePreviewUrl(urlRef.current), []);

    const previewUrl = useMemo(() => {
      if (bytes === undefined || !mime) return null;
      revokePreviewUrl(urlRef.current);
      urlRef.current = createPreviewUrl(bytes, mime);
      return urlRef.current;
    }, [bytes, mime]);

    const extra = mapProps
      ? mapProps({ inspection, resolveAsset, previewUrl, documentPath })
      : {};

    const content = text !== undefined ? text : inspection.data;
    return (
      <View
        {...initialProps}
        {...extra}
        content={content}
        onSave={handleSave}
        resolveAsset={resolveAsset}
      />
    );
  }

  MigratedTool.displayName = `MigratedTool(${View.displayName || View.name || kind})`;
  return MigratedTool;
}

export default createMigratedTool;
