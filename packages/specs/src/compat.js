/**
 * Pixozine format compatibility policy — P1-02 (decided 2026-10-06).
 *
 * DECIDED POLICY (Kyle, 2026-10-06):
 * - The format is BACKWARDS COMPATIBLE and EVOLVABLE.
 * - MIGRATE-ON-LOAD is the default: older packages are migrated to the
 *   current format version at load time via the migration runner
 *   (`./migrations/index.js`). There are no users yet, so there is no
 *   migration risk in practice.
 * - MAJOR VERSIONS and LEGACY SUPPORT are deferred to the future. When a
 *   v2 format is introduced, the policy for supporting v1 packages will be
 *   decided then. Until then, v1 is the only major.
 * - Runtimes MUST reject packages whose `formatVersion` major is newer than
 *   the highest major they implement, with a typed error (never partial
 *   state). Minor/patch bumps are additive-only: unknown fields are allowed
 *   but reported (see validator `unknown-field` info issues).
 *
 * This module is the default `compatPolicy` for the validator. Pass an
 * explicit `{ compatPolicy }` to override, or `compatPolicy: null` to
 * disable version checking entirely.
 */

import { LATEST_FORMAT_VERSION } from './migrations/index.js';

/** Highest format major this policy (and the migration runner) supports. */
export const SUPPORTED_FORMAT_MAJOR = 1;

/** Current canonical format version (mirrors the migration runner). */
export const CURRENT_FORMAT_VERSION = LATEST_FORMAT_VERSION;

function parseMajor(version) {
  if (typeof version !== 'string') return null;
  const m = version.match(/^(\d+)\./);
  return m ? Number(m[1]) : null;
}

/**
 * Check a document's format version against the policy.
 * @param {*} data - document (manifest) to check
 * @returns {Array} issues (possibly empty)
 */
export function checkFormatVersion(data) {
  const issues = [];
  const version = data && typeof data === 'object' ? data.formatVersion : undefined;

  if (version === undefined) {
    // Pre-1.0 packages omit formatVersion; the migration runner fills it.
    issues.push({
      code: 'format-version-missing',
      path: 'formatVersion',
      severity: 'info',
      message: `formatVersion absent; treating as pre-1.0 and migrating to ${CURRENT_FORMAT_VERSION} on load`,
    });
    return issues;
  }

  const major = parseMajor(version);
  if (major === null) {
    issues.push({
      code: 'format-version-malformed',
      path: 'formatVersion',
      severity: 'error',
      message: `formatVersion is not valid semver: ${JSON.stringify(version)}`,
    });
    return issues;
  }

  if (major > SUPPORTED_FORMAT_MAJOR) {
    issues.push({
      code: 'format-version-too-new',
      path: 'formatVersion',
      severity: 'error',
      message: `package format v${version} is newer than supported v${SUPPORTED_FORMAT_MAJOR}.x; refusing to load (never partial state)`,
    });
    return issues;
  }

  if (version !== CURRENT_FORMAT_VERSION) {
    issues.push({
      code: 'format-version-migratable',
      path: 'formatVersion',
      severity: 'info',
      message: `package format v${version} will be migrated to v${CURRENT_FORMAT_VERSION} on load`,
    });
  }

  return issues;
}

/** Default compat policy: plug into the validator via `{ compatPolicy }`. */
export const DEFAULT_COMPAT_POLICY = { checkFormatVersion };
