import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  validateManifest,
  validateMap,
  validateSave,
  validateSprite,
  ISSUE_CODES,
} from '../src/validator.js';
import { migrateManifest, listMigrations, LATEST_FORMAT_VERSION } from '../src/migrations/index.js';

function fixture(path) {
  return JSON.parse(readFileSync(new URL(`../fixtures/${path}`, import.meta.url), 'utf8'));
}

function codes(result) {
  return result.issues.map(i => i.code).sort();
}

describe('validator (P1-03)', () => {
  it('accepts the valid-minimal fixture with zero errors', () => {
    const r = validateManifest(fixture('valid-minimal/manifest.json'));
    expect(r.valid).toBe(true);
    expect(r.issues.filter(i => i.severity === 'error')).toEqual([]);
  });

  it('accepts the valid-full fixture', () => {
    const r = validateManifest(fixture('valid-full/manifest.json'));
    expect(r.valid).toBe(true);
  });

  it('flags missing required fields with stable codes and paths', () => {
    const r = validateManifest(fixture('invalid-missing-required/manifest.json'));
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.MISSING_REQUIRED);
    const paths = r.issues.map(i => i.path);
    expect(paths).toContain('title');
    expect(paths).toContain('initialZones');
  });

  it('flags bad semver, wrong types, and out-of-range values', () => {
    const r = validateManifest(fixture('invalid-bad-values/manifest.json'));
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.PATTERN_MISMATCH); // version
    expect(codes(r)).toContain(ISSUE_CODES.WRONG_TYPE); // initialZones string
    expect(codes(r)).toContain(ISSUE_CODES.ARRAY_LENGTH); // resolution [480]
    expect(codes(r)).toContain(ISSUE_CODES.OUT_OF_RANGE); // musicVolume 2.5
  });

  it('rejects empty initialZones (minItems)', () => {
    const r = validateManifest(fixture('edge-empty-initial-zones/manifest.json'));
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.ARRAY_LENGTH);
  });

  it('allows unknown fields but reports them as info (P1-02 hook pending)', () => {
    const r = validateManifest(fixture('edge-unknown-fields/manifest.json'));
    expect(r.valid).toBe(true);
    const unknown = r.issues.filter(i => i.code === ISSUE_CODES.UNKNOWN_FIELD);
    expect(unknown.length).toBeGreaterThan(0);
    expect(unknown.every(i => i.severity === 'info')).toBe(true);
    expect(unknown[0].path).toBe('futureField');
  });

  it('every issue has a stable shape {code, path, message, severity}', () => {
    const r = validateManifest(fixture('invalid-bad-values/manifest.json'));
    for (const issue of r.issues) {
      expect(typeof issue.code).toBe('string');
      expect(typeof issue.path).toBe('string');
      expect(typeof issue.message).toBe('string');
      expect(['error', 'warning', 'info']).toContain(issue.severity);
    }
  });

  it('rejects non-object documents', () => {
    for (const bad of [null, 42, 'nope', []]) {
      const r = validateManifest(bad);
      expect(r.valid).toBe(false);
      expect(codes(r)).toContain(ISSUE_CODES.NOT_AN_OBJECT);
    }
  });

  it('validates map / sprite / save fixtures', () => {
    expect(validateMap(fixture('maps/valid-tilemap.json')).valid).toBe(true);
    expect(validateMap(fixture('maps/invalid-no-bounds.json')).valid).toBe(false);
    expect(validateSprite(fixture('sprites/valid-hero.json')).valid).toBe(true);
    expect(validateSprite(fixture('sprites/invalid-no-src.json')).valid).toBe(false);
    expect(validateSave(fixture('saves/valid-save.json')).valid).toBe(true);
  });

  it('produces no console output (pure)', () => {
    const spy = [];
    const orig = console.log;
    console.log = (...a) => spy.push(a);
    try {
      validateManifest(fixture('valid-full/manifest.json'));
      validateManifest(fixture('invalid-bad-values/manifest.json'));
    } finally {
      console.log = orig;
    }
    expect(spy).toEqual([]);
  });
});

describe('migrations (P1-04)', () => {
  it('migrates a legacy pre-v1 manifest to canonical form', () => {
    const legacy = fixture('legacy-pre-v1/manifest.json');
    const { manifest, applied, from, to } = migrateManifest(legacy);
    expect(from).toBe('0.0.0');
    expect(to).toBe('1.1.0');
    expect(applied).toEqual(['0.0.0 -> 1.0.0', '1.0.0 -> 1.1.0']);
    expect(manifest.format).toBe('pixozine');
    expect(manifest.formatVersion).toBe('1.1.0');
    expect(manifest.playables).toEqual([]);
    expect(manifest.initialZones).toEqual(['zone-1']);
    expect(manifest.settings.resolution).toEqual([480, 640]);
    // migrated doc validates
    expect(validateManifest(manifest).valid).toBe(true);
  });

  it('does not mutate its input', () => {
    const legacy = fixture('legacy-pre-v1/manifest.json');
    const snapshot = JSON.stringify(legacy);
    migrateManifest(legacy);
    expect(JSON.stringify(legacy)).toBe(snapshot);
  });

  it('second migration is a no-op (idempotence)', () => {
    const legacy = fixture('legacy-pre-v1/manifest.json');
    const once = migrateManifest(legacy).manifest;
    const twice = migrateManifest(once);
    expect(twice.applied).toEqual([]);
    expect(JSON.stringify(twice.manifest)).toBe(JSON.stringify(once));
  });

  it('rejects targets newer than latest known', () => {
    expect(() => migrateManifest(fixture('valid-minimal/manifest.json'), { targetVersion: '99.0.0' }))
      .toThrow(/latest known/);
  });

  it('lists registered migrations', () => {
    const list = listMigrations();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toMatchObject({ from: '0.0.0', to: '1.0.0' });
    expect(list[1]).toMatchObject({ from: '1.0.0', to: '1.1.0' });
    expect(LATEST_FORMAT_VERSION).toBe('1.1.0');
  });
});
