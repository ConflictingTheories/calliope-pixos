/**
 * Migration: pixozine format 1.0.0 -> 1.1.0.
 *
 * v1.1.0 adds the `playables` array (playable embed blocks, §8 of
 * PIXOZINE_FORMAT.md). The migration is a no-op for existing packages:
 * manifests without `playables` validate identically before and after;
 * the field is normalized to `[]` so downstream code never sees `undefined`.
 *
 * Pure: never mutates its input, always returns a new object. Idempotent:
 * running it on an already-migrated document is a deep-equal no-op.
 */
export const from = '1.0.0';
export const to = '1.1.0';
export const description =
  'Stamp manifests as pixozine format 1.1.0 and normalize the playables array (no-op for packages without playable embeds).';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {object} manifest - format 1.0.0 manifest document
 * @returns {object} migrated manifest at format 1.1.0
 */
export function migrate(manifest) {
  const out = deepClone(manifest);

  out.formatVersion = '1.1.0';

  // v1.1.0: playable embed blocks. Absent in 1.0.0 packages; normalize so
  // consumers can rely on an array. Existing entries pass through untouched.
  if (out.playables === undefined) {
    out.playables = [];
  }

  return out;
}
