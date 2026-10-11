/*
 * ---------------------------------------------------------------
 *                     PixoSpritz – Editor – useZipLoader
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Hook for loading .zip/.spritz package files into a zip.js
 * filesystem. Replaces the ZipManager's importZipFile flow with a
 * minimal loader wired to the AssetsPanel.
 */

import { useState, useCallback } from 'react';
import { zipService } from '../zip-manager/services/index.js';

/**
 * @returns {{ loadZipFile: (file: File) => Promise<object>, loading: boolean, error: string|null }}
 */
export function useZipLoader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadZipFile = useCallback(async file => {
    setLoading(true);
    setError(null);
    try {
      const fs = zipService.createZipFileSystem();
      await fs.importBlob(file);
      return fs;
    } catch (err) {
      const message = err?.message || 'Failed to load package file';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadZipFile, loading, error };
}

export default useZipLoader;
