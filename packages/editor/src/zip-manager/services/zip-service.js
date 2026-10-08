/*
 * DEPRECATED (P3-13): the @zip.js FS API is superseded by
 * src/core/project/repository.js (ZipProjectRepository, jszip-backed).
 * New code must use the repository.  This module stays only for the
 * unmigrated shell/zip-tree paths; see DEPRECATED.md for the removal plan.
 */
import { fs, configure } from '@zip.js/zip.js';

const { FS } = fs;

function createZipFileSystem() {
  return new FS();
}

export { createZipFileSystem, configure };
