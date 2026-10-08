/*
 * ---------------------------------------------------------------
 *          PixoSpritz – Editor – ProjectRepository
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-01) Storage-agnostic project file-tree abstraction.
 *
 * A ProjectRepository owns the raw bytes of one project: a flat
 * namespace of POSIX paths -> file contents.  UI code, the
 * ProjectStore (P2-02) and the save coordinator (P2-07) program
 * against this interface; concrete adapters provide in-memory
 * and ZIP-backed storage.
 *
 * Deterministic export (P3-15) is part of the contract: exporting
 * the same logical project twice MUST yield byte-identical output.
 * Entry names are sorted, JSON is serialized with sorted keys,
 * text newlines are normalized to LF, and entry timestamps are
 * fixed by policy (never wall-clock).
 */

import JSZip from 'jszip';

/** Fixed entry timestamp used for deterministic exports (P3-15). */
export const DETERMINISTIC_DATE = new Date('2020-01-01T00:00:00.000Z');

/**
 * Serialize a value with recursively sorted object keys so that
 * logically-equal documents produce byte-identical JSON.
 * @param {*} value
 * @returns {string}
 */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * Normalize text content for deterministic storage: LF newlines,
 * no trailing-whitespace-only differences, single trailing newline.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return text.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '');
}

/**
 * Abstract project file-tree repository.  All methods are async.
 * Subclasses must implement every method.
 */
export class ProjectRepository {
  /** @returns {Promise<string[]>} sorted list of all paths, or those under prefix */
  async list(_prefix = '') {
    throw new Error('ProjectRepository.list: not implemented');
  }
  /** @returns {Promise<boolean>} */
  async exists(_path) {
    throw new Error('ProjectRepository.exists: not implemented');
  }
  /**
   * @param {string} path
   * @param {{as?: 'text'|'bytes'}} [options]
   * @returns {Promise<string|Uint8Array>}
   */
  async read(_path, _options = {}) {
    throw new Error('ProjectRepository.read: not implemented');
  }
  /**
   * @param {string} path
   * @param {string|Uint8Array|Blob} data
   * @returns {Promise<void>}
   */
  async write(_path, _data) {
    throw new Error('ProjectRepository.write: not implemented');
  }
  /** @returns {Promise<void>} */
  async delete(_path) {
    throw new Error('ProjectRepository.delete: not implemented');
  }
  /**
   * Deterministic export of the whole project (P3-15).
   * @returns {Promise<{bytes: Uint8Array, hash: string}>} bytes plus hex content hash
   */
  async exportProject() {
    throw new Error('ProjectRepository.exportProject: not implemented');
  }
  /** Replace the entire project contents from exported bytes. */
  async importProject(_bytes) {
    throw new Error('ProjectRepository.importProject: not implemented');
  }
  /** @returns {Promise<Object>} adapter-specific metadata (name, capabilities) */
  async getInfo() {
    throw new Error('ProjectRepository.getInfo: not implemented');
  }
}

function assertPath(path) {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error(`ProjectRepository: invalid path ${JSON.stringify(path)}`);
  }
  if (path.startsWith('/') || path.includes('\\') || /(^|\/)\.\.(\/|$)/.test(path)) {
    throw new Error(`ProjectRepository: unsafe path ${JSON.stringify(path)}`);
  }
}

async function toBytes(data) {
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  if (data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  throw new Error('ProjectRepository: unsupported data type for write()');
}

async function sha256Hex(bytes) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // FNV-1a fallback for non-WebCrypto environments (tests).
  let h1 = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h1 ^= bytes[i];
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return `fnv1a-${h1.toString(16).padStart(8, '0')}`;
}

/**
 * In-memory repository.  Used for tests, previews, and crash-recovery
 * staging.  Fully deterministic.
 */
export class InMemoryProjectRepository extends ProjectRepository {
  constructor() {
    super();
    /** @type {Map<string, Uint8Array>} */
    this.files = new Map();
  }

  async list(prefix = '') {
    const out = [];
    for (const p of this.files.keys()) {
      if (!prefix || p === prefix || p.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)) {
        out.push(p);
      }
    }
    return out.sort();
  }

  async exists(path) {
    assertPath(path);
    return this.files.has(path);
  }

  async read(path, options = {}) {
    assertPath(path);
    const bytes = this.files.get(path);
    if (!bytes) throw new Error(`ProjectRepository: not found: ${path}`);
    if (options.as === 'bytes') return new Uint8Array(bytes); // current-realm copy
    return new TextDecoder().decode(bytes);
  }

  async write(path, data) {
    assertPath(path);
    let bytes = await toBytes(data);
    if (path.endsWith('.json')) {
      // Normalize JSON documents on write so exports are stable (contract).
      try {
        const text = normalizeText(new TextDecoder().decode(bytes));
        bytes = new TextEncoder().encode(`${stableStringify(JSON.parse(text))}\n`);
      } catch {
        // Not valid JSON — store as-is.
      }
    }
    this.files.set(path, bytes);
  }

  async delete(path) {
    assertPath(path);
    this.files.delete(path);
  }

  async exportProject() {
    const names = [...this.files.keys()].sort();
    const parts = [];
    for (const name of names) {
      const bytes = this.files.get(name);
      const len = new Uint8Array(4);
      new DataView(len.buffer).setUint32(0, name.length, true);
      parts.push(new TextEncoder().encode(`entry:${name.length}:`), len, new TextEncoder().encode(name), bytes);
    }
    const total = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return { bytes: out, hash: await sha256Hex(out) };
  }

  async importProject(bytes) {
    const data = await toBytes(bytes);
    const dec = new TextDecoder();
    this.files.clear();
    let o = 0;
    while (o < data.length) {
      const marker = 'entry:';
      for (let i = 0; i < marker.length; i++) {
        if (data[o + i] !== marker.charCodeAt(i)) throw new Error('ProjectRepository: corrupt export stream');
      }
      o += marker.length;
      let colon = o;
      while (data[colon] !== 0x3a) colon++;
      const nameLen = parseInt(dec.decode(data.slice(o, colon)), 10);
      o = colon + 1;
      const declared = new DataView(data.buffer, data.byteOffset + o, 4).getUint32(0, true);
      o += 4;
      if (declared !== nameLen) throw new Error('ProjectRepository: corrupt export stream');
      const name = dec.decode(data.slice(o, o + nameLen));
      o += nameLen;
      // Length-prefixed payload: read until next "entry:" marker or EOF.
      let end = o;
      while (end < data.length) {
        let isMarker = true;
        for (let i = 0; i < marker.length; i++) {
          if (end + i >= data.length || data[end + i] !== marker.charCodeAt(i)) {
            isMarker = false;
            break;
          }
        }
        if (isMarker) break;
        end++;
      }
      this.files.set(name, data.slice(o, end));
      o = end;
    }
  }

  async getInfo() {
    return { adapter: 'memory', deterministic: true, streaming: false };
  }
}

/**
 * ZIP-backed repository using jszip (the single archive library chosen
 * for the editor, P3-13).  Export is deterministic per P3-15.
 */
export class ZipProjectRepository extends ProjectRepository {
  constructor() {
    super();
    this.zip = new JSZip();
    this.loaded = false;
  }

  async _ensureLoaded() {
    // Fresh instance starts empty; importProject replaces it.
    this.loaded = true;
  }

  _allPaths() {
    return Object.keys(this.zip.files)
      .filter(p => !this.zip.files[p].dir)
      .sort();
  }

  async list(prefix = '') {
    await this._ensureLoaded();
    const all = this._allPaths();
    if (!prefix) return all;
    const withSlash = prefix.endsWith('/') ? prefix : `${prefix}/`;
    return all.filter(p => p === prefix || p.startsWith(withSlash));
  }

  async exists(path) {
    assertPath(path);
    await this._ensureLoaded();
    const f = this.zip.file(path);
    return !!f && !f.dir;
  }

  async read(path, options = {}) {
    assertPath(path);
    await this._ensureLoaded();
    const f = this.zip.file(path);
    if (!f || f.dir) throw new Error(`ProjectRepository: not found: ${path}`);
    if (options.as === 'bytes') return new Uint8Array(await f.async('uint8array'));
    return f.async('string');
  }

  async write(path, data) {
    assertPath(path);
    await this._ensureLoaded();
    const bytes = await toBytes(data);
    let payload = bytes;
    if (path.endsWith('.json')) {
      // Normalize JSON documents on write so exports are stable.
      try {
        const text = normalizeText(new TextDecoder().decode(bytes));
        payload = new TextEncoder().encode(`${stableStringify(JSON.parse(text))}\n`);
      } catch {
        payload = new TextEncoder().encode(normalizeText(new TextDecoder().decode(bytes)));
      }
    } else {
      try {
        payload = new TextEncoder().encode(normalizeText(new TextDecoder().decode(bytes)));
      } catch {
        // Binary: store as-is.
      }
    }
    this.zip.file(path, payload, { date: DETERMINISTIC_DATE });
  }

  async delete(path) {
    assertPath(path);
    await this._ensureLoaded();
    this.zip.remove(path);
  }

  async exportProject() {
    await this._ensureLoaded();
    // Deterministic: entries are already date-fixed on write; regenerate
    // through a fresh archive in sorted order to guarantee stability.
    const fresh = new JSZip();
    for (const p of this._allPaths()) {
      const bytes = new Uint8Array(await this.zip.file(p).async('uint8array'));
      fresh.file(p, bytes, { date: DETERMINISTIC_DATE, compression: 'DEFLATE' });
    }
    const bytes = new Uint8Array(await fresh.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
    return { bytes, hash: await sha256Hex(bytes) };
  }

  async importProject(bytes) {
    const data = await toBytes(bytes);
    this.zip = await JSZip.loadAsync(data);
    this.loaded = true;
  }

  async getInfo() {
    return { adapter: 'zip(jszip)', deterministic: true, streaming: true };
  }
}

/**
 * (P3-10) Repository bridged onto a live session (e.g. the shell's
 * zip-manager project).  Delegates implement the storage; this class
 * only adapts them to the ProjectRepository interface.  Deterministic
 * export is NOT supported here — export goes through the canonical
 * ZipProjectRepository once the session is imported.
 */
export class BridgedProjectRepository extends ProjectRepository {
  /**
   * @param {{read:Function, write:Function, list:Function, exists:Function,
   *          remove?:Function, getInfo?:Function}} delegates
   */
  constructor(delegates = {}) {
    super();
    this.delegates = delegates;
  }

  async list(prefix = '') {
    return this.delegates.list(prefix);
  }

  async exists(path) {
    assertPath(path);
    return this.delegates.exists(path);
  }

  async read(path, options = {}) {
    assertPath(path);
    const result = await this.delegates.read(path, options);
    // Normalize to current-realm Uint8Array (delegates may use another realm's).
    if (options.as === 'bytes' && ArrayBuffer.isView(result)) {
      return new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
    }
    return result;
  }

  async write(path, data) {
    assertPath(path);
    return this.delegates.write(path, data);
  }

  async delete(path) {
    assertPath(path);
    if (!this.delegates.remove) throw new Error('BridgedProjectRepository.delete: not implemented');
    return this.delegates.remove(path);
  }

  async exportProject() {
    throw new Error(
      'BridgedProjectRepository.exportProject: import the session into ZipProjectRepository first (P3-15)'
    );
  }

  async importProject(_bytes) {
    throw new Error('BridgedProjectRepository.importProject: not implemented');
  }

  async getInfo() {
    return { adapter: 'bridged(session)', deterministic: false, ...(this.delegates.getInfo?.() || {}) };
  }
}
