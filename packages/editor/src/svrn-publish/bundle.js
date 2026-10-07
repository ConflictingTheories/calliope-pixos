/**
 * PixoSpritz editor — "Publish to SVRN" bundle builder.
 *
 * Produces a versioned `.svrn` package: a ZIP containing `manifest.json`
 * (bundle metadata + per-file content hashes) and the game payload under
 * `payload/`. This is the editor side of the SVRN universal ingestion
 * contract ("Publish to SVRN", product brief §5): the hub validates the
 * bundle, stores it, and indexes it for discovery. The pinned player
 * version lets SVRN serve exactly the runtime the bundle was built for —
 * no "it worked on my machine".
 *
 * Bundle layout:
 *
 *   my-game.svrn
 *   ├── manifest.json      # svrn-bundle manifest (see buildBundleManifest)
 *   └── payload/           # game files, paths relative to project root
 *
 * Deterministic: file entries are sorted; the manifest is stable-stringified.
 */

const JSZIP_SPECIFIER = 'jszip';

/** Default zip implementation: lazy jszip import (keeps pure functions testable). */
async function defaultZipImpl() {
  const mod = await import(/* @vite-ignore */ JSZIP_SPECIFIER);
  return mod.default || mod;
}

/** Bundle envelope identifier. */
export const SVRN_BUNDLE_FORMAT = 'svrn-bundle';
/** Current bundle envelope version (independent of the pixozine format version). */
export const SVRN_BUNDLE_FORMAT_VERSION = '1.0.0';
export const BUNDLE_EXTENSION = '.svrn';
export const BUNDLE_MIME = 'application/x-svrn-bundle+zip';

/**
 * PixoSpritz player version pinned into bundles.
 * MUST track the player release: SVRN serves this exact player version
 * for the embed. Bump when the player ships a new release.
 */
export const PINNED_PLAYER_VERSION = '1.0.0';

/**
 * FNV-1a 32-bit hash, lowercase hex — matches
 * `packages/specs/src/asset-graph.js`. Used for per-file content hashes
 * so the hub can verify payload integrity without new dependencies.
 * @param {Uint8Array|string} input
 * @returns {string} 8 lowercase hex chars
 */
export function fnv1aHex(input) {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Stable JSON stringify: sorted keys, no whitespace. */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}}`;
}

/**
 * Build the bundle manifest object (also written as manifest.json).
 *
 * @param {object} args
 * @param {string} args.title - bundle title (required)
 * @param {string} [args.creator] - creator name/handle
 * @param {string} [args.description]
 * @param {string[]} [args.tags]
 * @param {string} [args.playerVersion] - defaults to PINNED_PLAYER_VERSION
 * @param {Array<{path:string,hash:string,size:number}>} args.files - payload listing
 * @param {string} [args.sourceFormatVersion] - pixozine formatVersion of the source project, if known
 * @param {string} [args.createdAt] - ISO timestamp (defaults to now)
 */
export function buildBundleManifest({
  title,
  creator = '',
  description = '',
  tags = [],
  playerVersion = PINNED_PLAYER_VERSION,
  files = [],
  sourceFormatVersion = null,
  createdAt = new Date().toISOString(),
}) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('buildBundleManifest: title is required');
  }
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(playerVersion)) {
    throw new Error(
      `buildBundleManifest: playerVersion must be semver, got ${JSON.stringify(playerVersion)}`
    );
  }
  const sorted = [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return {
    bundleFormat: SVRN_BUNDLE_FORMAT,
    bundleFormatVersion: SVRN_BUNDLE_FORMAT_VERSION,
    title: title.trim(),
    creator,
    description,
    tags: Array.isArray(tags) ? tags : [],
    playerVersion,
    sourceFormatVersion,
    createdAt,
    fileCount: sorted.length,
    files: sorted.map(f => ({ path: f.path, hash: f.hash, size: f.size })),
  };
}

/** Filename-safe slug for the bundle file. */
export function slugify(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'untitled'
  );
}

/**
 * Build a complete `.svrn` bundle from a project repository.
 *
 * @param {object} args
 * @param {object} args.repository - ProjectRepository (list/read interface)
 * @param {object} args.meta - { title, creator?, description?, tags? }
 * @param {Function} [args.zipImpl] - async () => JSZip constructor (injectable for tests)
 * @returns {Promise<{ bytes: Uint8Array, manifest: object, filename: string }>}
 */
export async function buildSvrnBundle({ repository, meta, zipImpl = defaultZipImpl }) {
  if (!repository || typeof repository.list !== 'function' || typeof repository.read !== 'function') {
    throw new Error('buildSvrnBundle: repository with list()/read() is required');
  }
  const title = meta && typeof meta.title === 'string' ? meta.title.trim() : '';
  if (!title) throw new Error('buildSvrnBundle: meta.title is required');

  // Source pixozine format version, when the project carries a manifest.
  let sourceFormatVersion = null;
  try {
    if (await repository.exists('manifest.json')) {
      const raw = await repository.read('manifest.json');
      const parsed = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw));
      if (parsed && typeof parsed.formatVersion === 'string') {
        sourceFormatVersion = parsed.formatVersion;
      }
    }
  } catch {
    // Non-fatal: the bundle just won't record a source format version.
  }

  const paths = (await repository.list('')).filter(p => typeof p === 'string').sort();
  const JSZip = await zipImpl();
  const zip = new JSZip();
  const files = [];
  for (const path of paths) {
    const bytes = await repository.read(path, { as: 'bytes' });
    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(String(bytes));
    files.push({ path, hash: fnv1aHex(data), size: data.length });
    zip.file(`payload/${path}`, data);
  }

  const manifest = buildBundleManifest({
    title,
    creator: meta.creator || '',
    description: meta.description || '',
    tags: meta.tags || [],
    playerVersion: meta.playerVersion || PINNED_PLAYER_VERSION,
    files,
    sourceFormatVersion,
  });
  zip.file('manifest.json', `${stableStringify(manifest)}\n`);

  const bytes = new Uint8Array(await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
  return { bytes, manifest, filename: `${slugify(title)}${BUNDLE_EXTENSION}` };
}
