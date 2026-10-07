/**
 * Migration: pre-versioned manifest -> pixozine format 1.0.0 (P1-04).
 *
 * Pre-1.0 manifests have no `format` / `formatVersion` fields. This migration
 * is pure: it never mutates its input and always returns a new object.
 */
export const from = '0.0.0';
export const to = '1.0.0';
export const description =
  'Stamp pre-versioned manifests as pixozine format 1.0.0 and normalize legacy field shapes.';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {object} manifest - pre-1.0 manifest document
 * @returns {object} migrated manifest at format 1.0.0
 */
export function migrate(manifest) {
  const out = deepClone(manifest);

  if (out.format === undefined) out.format = 'pixozine';
  out.formatVersion = '1.0.0';

  // Legacy: initialZones as a single string -> array.
  if (typeof out.initialZones === 'string') {
    out.initialZones = [out.initialZones];
  }

  // Legacy: settings.resolution as "WxH" string -> [w, h].
  if (out.settings && typeof out.settings.resolution === 'string') {
    const m = /^(\d+)\s*[xX]\s*(\d+)$/.exec(out.settings.resolution.trim());
    if (m) out.settings.resolution = [parseInt(m[1], 10), parseInt(m[2], 10)];
  }

  // scriptApiVersion default for packages that predate capability declarations.
  if (out.scriptApiVersion === undefined) out.scriptApiVersion = '1.0.0';
  if (out.capabilities === undefined) out.capabilities = [];

  return out;
}
