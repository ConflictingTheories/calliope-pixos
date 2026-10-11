/**
 * Pixozine semantic validation — P1-06.
 *
 * Structural validation (P1-03) checks shapes; this module checks meaning:
 * ID uniqueness, reference integrity, entry-point reachability, sane bounds,
 * media declarations, and safe paths.
 *
 * All findings are path-addressed with stable codes:
 *   { code, path, message, severity }
 *
 * @param {object} manifest - validated manifest document
 * @param {object} [opts] - { archiveFiles?: string[] } list of paths present
 *   in the package archive; when provided, declared media/script paths are
 *   checked for existence.
 */

export const SEMANTIC_CODES = {
  DUPLICATE_ID: 'duplicate-id',
  DANGLING_REFERENCE: 'dangling-reference',
  UNSAFE_PATH: 'unsafe-path',
  MISSING_ASSET: 'missing-asset',
  SUSPICIOUS_BOUNDS: 'suspicious-bounds',
  UNREACHABLE_ASSET: 'unreachable-asset',
};

/** Asset-list fields that declare content IDs. */
const ID_LIST_FIELDS = [
  'maps',
  'tilesets',
  'sprites',
  'models',
  'shaders',
];

/** Fields that declare file paths inside the archive. */
const PATH_LIST_FIELDS = ['textures', 'audio', 'scripts', 'cutscenes', 'callbacks', 'triggers'];
const SINGLE_PATH_FIELDS = ['thumbnail', 'icon', 'splash'];

function isUnsafePath(p) {
  return (
    typeof p !== 'string' ||
    p.includes('..') ||
    p.startsWith('/') ||
    /^[a-zA-Z]:/.test(p) ||
    p.includes('\\')
  );
}

/** Absolute URIs (e.g. https: bundle URLs) are not archive paths. */
function isAbsoluteUri(p) {
  return typeof p === 'string' && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(p);
}

export function validateSemantics(manifest, opts = {}) {
  const issues = [];
  const push = (code, path, severity, message) => issues.push({ code, path, severity, message });
  const archive = opts.archiveFiles ? new Set(opts.archiveFiles) : null;

  // 1. ID uniqueness across declared asset lists.
  const seen = new Map(); // id -> first field
  for (const field of ID_LIST_FIELDS) {
    const list = manifest[field];
    if (!Array.isArray(list)) continue;
    list.forEach((id, i) => {
      if (seen.has(id)) {
        push(
          SEMANTIC_CODES.DUPLICATE_ID,
          `${field}[${i}]`,
          'error',
          `Duplicate asset ID "${id}" (first declared in ${seen.get(id)})`
        );
      } else {
        seen.set(id, field);
      }
    });
  }

  // 1b. Playable embed IDs must be unique (v1.1.0+).
  const playables = Array.isArray(manifest.playables) ? manifest.playables : [];
  playables.forEach((p, i) => {
    const id = p && typeof p === 'object' ? p.id : undefined;
    if (typeof id !== 'string' || id.length === 0) return; // structural check is the validator's job
    if (seen.has(id)) {
      push(
        SEMANTIC_CODES.DUPLICATE_ID,
        `playables[${i}].id`,
        'error',
        `Duplicate playable ID "${id}" (first declared in ${seen.get(id)})`
      );
    } else {
      seen.set(id, `playables[${i}]`);
    }
  });

  // 2. initialZones must reference declared maps.
  const declaredMaps = new Set(manifest.maps || []);
  (manifest.initialZones || []).forEach((zoneId, i) => {
    if (!declaredMaps.has(zoneId)) {
      push(
        SEMANTIC_CODES.DANGLING_REFERENCE,
        `initialZones[${i}]`,
        'error',
        `Entry-point zone "${zoneId}" is not declared in "maps"`
      );
    }
  });

  // 3. Unsafe paths (traversal / absolute / windows).
  const checkPath = (p, path) => {
    if (isUnsafePath(p)) {
      push(
        SEMANTIC_CODES.UNSAFE_PATH,
        path,
        'error',
        `Unsafe asset path "${p}": must be a relative forward-slash path inside the archive`
      );
      return false;
    }
    return true;
  };
  for (const field of PATH_LIST_FIELDS) {
    const list = manifest[field];
    if (!Array.isArray(list)) continue;
    list.forEach((p, i) => checkPath(p, `${field}[${i}]`));
  }
  for (const field of SINGLE_PATH_FIELDS) {
    if (manifest[field] !== undefined) checkPath(manifest[field], field);
  }
  // 3b. Playable embed paths (v1.1.0+). bundle.uri may be an absolute
  // remote URL — only archive-relative values are path-checked.
  playables.forEach((p, i) => {
    if (!p || typeof p !== 'object') return;
    if (p.poster !== undefined) checkPath(p.poster, `playables[${i}].poster`);
    if (p.bundle && typeof p.bundle === 'object' && p.bundle.uri !== undefined) {
      if (!isAbsoluteUri(p.bundle.uri)) {
        checkPath(p.bundle.uri, `playables[${i}].bundle.uri`);
      }
    }
    if (p.fallback && typeof p.fallback === 'object' && p.fallback.image !== undefined) {
      checkPath(p.fallback.image, `playables[${i}].fallback.image`);
    }
  });

  // 4. Declared files must exist in the archive (when a listing is provided).
  if (archive) {
    const allPaths = [];
    for (const field of PATH_LIST_FIELDS) {
      const list = manifest[field];
      if (Array.isArray(list)) list.forEach((p, i) => allPaths.push([p, `${field}[${i}]`]));
    }
    for (const field of SINGLE_PATH_FIELDS) {
      if (manifest[field] !== undefined) allPaths.push([manifest[field], field]);
    }
    for (let i = 0; i < playables.length; i++) {
      const p = playables[i];
      if (!p || typeof p !== 'object') continue;
      if (p.poster !== undefined) allPaths.push([p.poster, `playables[${i}].poster`]);
      const uri = p.bundle && typeof p.bundle === 'object' ? p.bundle.uri : undefined;
      if (uri !== undefined && !isAbsoluteUri(uri)) {
        allPaths.push([uri, `playables[${i}].bundle.uri`]);
      }
      const fimg = p.fallback && typeof p.fallback === 'object' ? p.fallback.image : undefined;
      if (fimg !== undefined) allPaths.push([fimg, `playables[${i}].fallback.image`]);
    }
    for (const [p, path] of allPaths) {
      if (!isUnsafePath(p) && !archive.has(p)) {
        push(
          SEMANTIC_CODES.MISSING_ASSET,
          path,
          'error',
          `Declared asset "${p}" is not present in the package archive`
        );
      }
    }
  }

  // 5. Bounds sanity.
  const res = manifest.settings?.resolution;
  if (Array.isArray(res) && res.length === 2) {
    const [w, h] = res;
    if (
      !Number.isInteger(w) ||
      !Number.isInteger(h) ||
      w <= 0 ||
      h <= 0 ||
      w > 7680 ||
      h > 4320
    ) {
      push(
        SEMANTIC_CODES.SUSPICIOUS_BOUNDS,
        'settings.resolution',
        'warning',
        `Suspicious resolution [${w}, ${h}]: expected positive integers within 7680x4320`
      );
    }
  }

  // 6. Reachability: entry points are initialZones; anything else declared is
  //    only reachable via in-content links, so flag as info for review.
  const entryPoints = new Set(manifest.initialZones || []);
  for (const mapId of declaredMaps) {
    if (!entryPoints.has(mapId)) {
      push(
        SEMANTIC_CODES.UNREACHABLE_ASSET,
        'maps',
        'info',
        `Map "${mapId}" is declared but is not an entry point; ensure it is linked from reachable content`
      );
    }
  }

  return { valid: !issues.some(i => i.severity === 'error'), issues };
}

export default { validateSemantics, SEMANTIC_CODES };
