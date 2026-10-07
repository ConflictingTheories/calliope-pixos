/**
 * Pixozine migration runner — P1-04.
 *
 * Pure, sequential migrations: each migration declares source/target format
 * versions and a pure `migrate` function. `migrateManifest` walks the chain
 * from the document's current `formatVersion` (defaulting to '0.0.0' when
 * absent) to the requested target (default: latest known).
 *
 * Idempotence: running the runner on an already-migrated document is a
 * no-op — verified by deep-equality in the test suite.
 */

import * as v0ToV1 from './v0-to-v1.js';

/** Ordered migration chain. New migrations append here. */
export const MIGRATIONS = [
  { from: v0ToV1.from, to: v0ToV1.to, description: v0ToV1.description, migrate: v0ToV1.migrate },
];

/** Highest format version this runner knows how to produce. */
export const LATEST_FORMAT_VERSION = MIGRATIONS[MIGRATIONS.length - 1].to;

function currentVersion(manifest) {
  return manifest && typeof manifest.formatVersion === 'string'
    ? manifest.formatVersion
    : '0.0.0';
}

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Migrate a manifest document to the target format version.
 * @param {object} manifest - manifest document (not mutated)
 * @param {object} [opts] - { targetVersion?: string }
 * @returns {{ manifest: object, applied: string[], from: string, to: string }}
 * @throws {Error} on unknown source version, missing chain link, or
 *   a target newer than LATEST_FORMAT_VERSION.
 */
export function migrateManifest(manifest, opts = {}) {
  const target = opts.targetVersion || LATEST_FORMAT_VERSION;
  if (compareSemver(target, LATEST_FORMAT_VERSION) > 0) {
    throw new Error(
      `Cannot migrate to ${target}: latest known format version is ${LATEST_FORMAT_VERSION}`
    );
  }

  let doc = JSON.parse(JSON.stringify(manifest));
  const from = currentVersion(doc);
  const applied = [];

  let cursor = from;
  while (compareSemver(cursor, target) < 0) {
    const step = MIGRATIONS.find(m => m.from === cursor);
    if (!step) {
      throw new Error(`No migration registered from format version ${cursor} (target ${target})`);
    }
    if (compareSemver(step.to, target) > 0) {
      throw new Error(
        `Migration ${step.from} -> ${step.to} overshoots requested target ${target}`
      );
    }
    doc = step.migrate(doc);
    applied.push(`${step.from} -> ${step.to}`);
    cursor = step.to;
  }

  return { manifest: doc, applied, from, to: currentVersion(doc) };
}

/** List registered migrations (for CLI / diagnostics). */
export function listMigrations() {
  return MIGRATIONS.map(m => ({ from: m.from, to: m.to, description: m.description }));
}

export default { migrateManifest, listMigrations, MIGRATIONS, LATEST_FORMAT_VERSION };
