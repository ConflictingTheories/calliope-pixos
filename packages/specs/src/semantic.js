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
