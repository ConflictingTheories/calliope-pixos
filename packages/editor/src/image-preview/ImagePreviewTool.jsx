/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ImagePreviewTool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-10) Proof migration of one small tool onto the new core.
 * Project access goes through the DocumentRegistry (kind
 * 'image'), zoom actions register as shell commands, and the
 * view stays the existing ImagePreview component — no redesign.
 * The legacy direct-ZIP path is gone: this tool never sees bytes
 * except through the registry.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import ImagePreview from './index.jsx';
import { createPreviewUrl, revokePreviewUrl } from '../shared/blobUrls.js';

/**
 * @param {Object} props
 * @param {string} props.documentPath
 * @param {{ registry: import('../core/documents/registry.js').DocumentRegistry,
 *          commands: import('../shell/commands/commands.js').CommandRegistry }} props.core
 * @param {() => void} [props.onZoomIn]
 * @param {() => void} [props.onZoomOut]
 * @param {() => void} [props.onZoomReset]
 */
export function ImagePreviewTool({ documentPath, core, imageBytes, mime }) {
  const urlRef = useRef('');
  const { registry, commands } = core;

  // Validate through the registry: unknown/corrupt images stay inspectable.
  const inspection = useMemo(() => {
    if (!imageBytes) return { kind: 'unknown', issues: [] };
    return registry.loadDocument(imageBytes, { kind: 'image', path: documentPath });
  }, [registry, imageBytes, documentPath]);

  const url = useMemo(() => {
    revokePreviewUrl(urlRef.current);
    urlRef.current = createPreviewUrl(imageBytes, mime);
    return urlRef.current;
  }, [imageBytes, mime]);

  useEffect(() => () => revokePreviewUrl(urlRef.current), []);

  // Shell integration: zoom commands registered once per mount.
  useEffect(() => {
    const offs = [
      commands.register({
        id: 'image-preview.zoom-in',
        title: 'Zoom image in',
        group: 'image-preview',
        shortcut: '=',
        run: () => document.dispatchEvent(new CustomEvent('px:image-zoom', { detail: 'in' })),
      }),
      commands.register({
        id: 'image-preview.zoom-out',
        title: 'Zoom image out',
        group: 'image-preview',
        shortcut: '-',
        run: () => document.dispatchEvent(new CustomEvent('px:image-zoom', { detail: 'out' })),
      }),
      commands.register({
        id: 'image-preview.zoom-reset',
        title: 'Reset image zoom',
        group: 'image-preview',
        shortcut: 'ctrl+0',
        run: () => document.dispatchEvent(new CustomEvent('px:image-zoom', { detail: 'reset' })),
      }),
    ];
    return () => offs.forEach(off => off());
  }, [commands]);

  if (inspection.issues.some(i => i.severity === 'error')) {
    return <div style={{ padding: '1rem', color: '#f48771' }}>Image failed validation.</div>;
  }
  return <ImagePreview content={url} />;
}

export default ImagePreviewTool;
