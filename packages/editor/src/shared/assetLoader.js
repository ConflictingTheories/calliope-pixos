/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – Asset Loader
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Extracted from app.jsx. Loads assets from the project ZIP for
 * cutscene previews and other tools that need asset URLs.
 *
 * The loader:
 * - Cleans paths (strips data:, assets/ prefixes)
 * - Searches ZIP recursively for matching files
 * - Prefers image formats (.png, .gif) over definitions (.json)
 * - Returns data URIs with correct MIME types
 */

import { debug } from '@Engine/utils/debug-logger.js';

/**
 * Create an asset loader bound to a ZIP archive.
 *
 * @param {object} zip - JSZip instance
 * @param {Function} getData - (entry, binary) => Promise<data>
 * @param {Function} toDataUri - (data, mime) => string
 * @returns {Function} assetLoader(path) => Promise<string|null>
 */
export function createAssetLoader(zip, getData, toDataUri) {
  /**
   * Helper to find asset by name in ZIP recursively.
   */
  const findAsset = (node, targetName) => {
    if (node.children) {
      for (const child of node.children) {
        if (
          !child.directory &&
          (child.name === targetName || child.name.includes(targetName))
        ) {
          return child;
        }
        if (child.directory) {
          const found = findAsset(child, targetName);
          if (found) return found;
        }
      }
    }
    return null;
  };

  /**
   * Load an asset from the ZIP and return a data URI.
   * @param {string} path - Asset path (e.g. "characters/male", "textures/fire.png")
   * @returns {Promise<string|null>} Data URI or null if not found
   */
  const assetLoader = async path => {
    try {
      debug('AssetLoader', 'Loading asset:', path);
      // Clean the path
      let cleanPath = path.replace(/^data:/, '').replace(/^assets\//, '');
      debug('AssetLoader', 'Clean path:', cleanPath);

      // First try direct match
      let assetEntry = findAsset(zip, cleanPath);

      // If not found, try common prefix and extension fixes for sprites and audio
      if (!assetEntry) {
        // For sprite assets like "characters/male"
        if (
          cleanPath.startsWith('characters/') ||
          cleanPath.startsWith('npc/') ||
          cleanPath.startsWith('sprites/')
        ) {
          // Try image formats FIRST (cutscene needs pixels, not JSON)
          // Then fall back to JSON definition
          const trialPaths = [
            cleanPath.startsWith('sprites/')
              ? cleanPath + '.png'
              : 'sprites/' + cleanPath + '.png',
            cleanPath.startsWith('sprites/')
              ? cleanPath + '.gif'
              : 'sprites/' + cleanPath + '.gif',
            cleanPath.startsWith('sprites/') ? cleanPath : 'sprites/' + cleanPath,
            cleanPath + '.png',
            cleanPath + '.gif',
            cleanPath.startsWith('sprites/')
              ? cleanPath + '.json'
              : 'sprites/' + cleanPath + '.json',
            cleanPath + '.json',
          ];
          for (const trial of trialPaths) {
            assetEntry = findAsset(zip, trial);
            if (assetEntry) {
              debug('AssetLoader', 'Found sprite at:', trial);
              break;
            }
          }
        }

        // For texture/backdrop files
        if (!assetEntry && cleanPath.startsWith('textures/')) {
          const trialTexturePaths = [
            cleanPath,
            cleanPath + '.png',
            cleanPath + '.gif',
            cleanPath + '.jpg',
            cleanPath + '.jpeg',
          ];
          for (const trial of trialTexturePaths) {
            assetEntry = findAsset(zip, trial);
            if (assetEntry) break;
          }
        }

        // For audio files, try prefixing with "audio/"
        if (!assetEntry && cleanPath.match(/\.mp3$|\.wav$|\.ogg$/)) {
          const trialAudioPath = 'audio/' + cleanPath.replace(/^audio\//, '');
          assetEntry = findAsset(zip, trialAudioPath);
        }

        // For direct portrait references (like fire_portrait, water_portrait)
        if (!assetEntry && cleanPath.match(/_portrait$/)) {
          const trialPortraitPaths = [
            'textures/' + cleanPath + '.gif',
            'textures/' + cleanPath + '.png',
            cleanPath + '.gif',
            cleanPath + '.png',
          ];
          for (const trial of trialPortraitPaths) {
            assetEntry = findAsset(zip, trial);
            if (assetEntry) break;
          }
        }

        // Last resort: try without any prefix if it has an extension
        if (!assetEntry && cleanPath.match(/\.\w+$/)) {
          assetEntry = findAsset(zip, cleanPath.split('/').pop());
        }
      }

      if (!assetEntry) {
        // Only warn if it's not an intermediate search path
        if (!path.match(/\.(json|gif|png)$/)) {
          console.warn(`Asset not found in ZIP: ${path}`);
        }
        return null;
      }

      // Get the data and convert to data URI
      const data = await getData(assetEntry, false);
      const ext = assetEntry.name.split('.').pop().toLowerCase();
      const mimeMap = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        json: 'application/json',
      };
      const mimeType = mimeMap[ext] || 'application/octet-stream';
      debug('AssetLoader', 'Returning data URI with MIME type:', mimeType);
      return toDataUri(data, mimeType);
    } catch (e) {
      console.warn('AssetLoader failed for', path, e);
      return null;
    }
  };

  return assetLoader;
}

export default createAssetLoader;
