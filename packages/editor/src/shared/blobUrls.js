/*
 * ---------------------------------------------------------------
 *              PixoSpritz – Editor – Blob URL previews
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-14) Binary previews (images, audio) must use Blob URLs, not
 * base64 data URIs.  Data URIs inflate memory ~33% and keep the
 * whole payload in the React tree; Blob URLs reference the bytes
 * without copying.  Every created URL MUST be revoked on
 * replacement or unmount — the helpers below make that the default.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Create an object URL for binary preview content.
 * @param {Uint8Array|Blob} bytes
 * @param {string} mime
 * @returns {string} blob: URL (empty string when bytes are empty)
 */
export function createPreviewUrl(bytes, mime = 'application/octet-stream') {
  if (!bytes || bytes.length === 0) return '';
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

/** Revoke a previously created preview URL. Safe to call with ''. */
export function revokePreviewUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * React hook: stable preview URL for binary bytes.  Revokes the
 * previous URL whenever bytes/mime change and on unmount, so
 * repeated preview changes cannot grow retained memory.
 */
export function usePreviewUrl(bytes, mime) {
  const urlRef = useRef('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const next = createPreviewUrl(bytes, mime);
    revokePreviewUrl(urlRef.current);
    urlRef.current = next;
    setUrl(next);
    return () => {
      revokePreviewUrl(urlRef.current);
      urlRef.current = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, mime]);

  return url;
}
