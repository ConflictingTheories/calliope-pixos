/**
 * SpritzPlayer tests — P1-09.
 *
 * Covers the validation gate: valid packages prepare cleanly, invalid
 * packages fail with typed PackageValidationError (never partial state),
 * and inspection never executes scripts.
 *
 * NOTE: requires installed dependencies (jszip, pixospritz-specs workspace
 * link). Not executed in environments without node_modules.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import SpritzPlayer, { PackageValidationError } from '../src/spritz/player.js';

function fixture(path) {
  return JSON.parse(
    readFileSync(new URL(`../../specs/fixtures/${path}`, import.meta.url), 'utf8')
  );
}

describe('SpritzPlayer.prepareManifest', () => {
  it('prepares a valid manifest (1.1.0, no migration needed)', () => {
    const prepared = SpritzPlayer.prepareManifest(fixture('valid-minimal/manifest.json'));
    expect(prepared.manifest.format).toBe('pixozine');
    expect(prepared.manifest.formatVersion).toBe('1.1.0');
    expect(prepared.migration).toBe('no-op');
    expect(prepared.warnings).toEqual([]);
  });

  it('migrates legacy manifests before validating', () => {
    const prepared = SpritzPlayer.prepareManifest(fixture('legacy-pre-v1/manifest.json'));
    expect(prepared.manifest.formatVersion).toBe('1.1.0');
    expect(prepared.manifest.initialZones).toEqual(['zone-1']);
    expect(prepared.migration).toContain('1.1.0');
  });

  it('throws PackageValidationError (typed) for invalid manifests', () => {
    let err = null;
    try {
      SpritzPlayer.prepareManifest(fixture('invalid-missing-required/manifest.json'));
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(PackageValidationError);
    expect(err.code).toBe('PACKAGE_VALIDATION_FAILED');
    expect(err.issues.length).toBeGreaterThan(0);
    expect(err.issues.every(i => i.code && i.path !== undefined)).toBe(true);
  });

  it('throws for semantically dangling entry points', () => {
    const m = fixture('valid-minimal/manifest.json');
    m.initialZones = ['ghost-zone'];
    expect(() => SpritzPlayer.prepareManifest(m)).toThrow(PackageValidationError);
  });

  it('does not mutate its input', () => {
    const m = fixture('legacy-pre-v1/manifest.json');
    const snapshot = JSON.stringify(m);
    SpritzPlayer.prepareManifest(m);
    expect(JSON.stringify(m)).toBe(snapshot);
  });
});

describe('SpritzPlayer.inspectArchive', () => {
  it('reports invalid packages without executing scripts', async () => {
    // A minimal zip is not needed: missing manifest.json short-circuits.
    // Build a tiny zip in-memory via jszip.
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    zip.file('readme.txt', 'not a pixozine');
    const buf = await zip.generateAsync({ type: 'uint8array' });
    const report = await SpritzPlayer.inspectArchive(buf);
    expect(report.valid).toBe(false);
    expect(report.scriptsNotExecuted).toBe(true);
    expect(report.issues[0].code).toBe('missing-manifest');
  });

  it('inspects a valid package without executing scripts', async () => {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    zip.file('manifest.json', JSON.stringify(fixture('valid-minimal/manifest.json')));
    zip.file('scripts/main.pxs', 'while true do end'); // must NOT execute
    const buf = await zip.generateAsync({ type: 'uint8array' });
    const report = await SpritzPlayer.inspectArchive(buf);
    expect(report.scriptsNotExecuted).toBe(true);
    expect(report.title).toBe('Tiny Pixozine');
    expect(typeof report.graphHash).toBe('string');
  });
});
