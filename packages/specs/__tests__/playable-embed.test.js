import { describe, it, expect } from 'vitest';
import { validateManifest, ISSUE_CODES } from '../src/validator.js';
import { validateSemantics, SEMANTIC_CODES } from '../src/semantic.js';
import { migrateManifest, LATEST_FORMAT_VERSION } from '../src/migrations/index.js';

function minimalManifest(overrides = {}) {
  return {
    format: 'pixozine',
    formatVersion: '1.1.0',
    title: 'Test Zine',
    version: '1.0.0',
    initialZones: ['zone-1'],
    maps: ['zone-1'],
    ...overrides,
  };
}

function validPlayable(overrides = {}) {
  return {
    id: 'demo-game',
    title: 'Demo Game',
    description: 'A playable demo.',
    poster: 'assets/poster.png',
    playerVersion: '1.0.0',
    bundle: {
      uri: 'playables/demo-game.pxz',
      manifestHash: '9e107d9d',
    },
    dimensions: { width: 960, height: 540 },
    fallback: {
      title: 'Demo Game',
      body: 'This playable requires WebGL.',
      image: 'assets/fallback.png',
    },
    ...overrides,
  };
}

const ARCHIVE = [
  'assets/poster.png',
  'assets/fallback.png',
  'playables/demo-game.pxz',
];

function codes(result) {
  return result.issues.map(i => i.code);
}

describe('playable embeds (format v1.1.0)', () => {
  it('accepts a manifest with a valid playable block', () => {
    const r = validateManifest(minimalManifest({ playables: [validPlayable()] }));
    expect(r.valid).toBe(true);
    expect(r.issues.filter(i => i.severity === 'error')).toEqual([]);
  });

  it('accepts a minimal playable (only required fields)', () => {
    const r = validateManifest(
      minimalManifest({
        playables: [
          {
            id: 'g1',
            title: 'G',
            playerVersion: '1.0.0',
            bundle: { uri: 'https://cdn.svrn.example/g.pxz', manifestHash: 'a'.repeat(64) },
          },
        ],
      })
    );
    expect(r.valid).toBe(true);
  });

  it('rejects a playable missing required fields', () => {
    const r = validateManifest(minimalManifest({ playables: [{ id: 'g1', title: 'G' }] }));
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.MISSING_REQUIRED);
    const paths = r.issues.map(i => i.path);
    expect(paths).toContain('playables[0].playerVersion');
    expect(paths).toContain('playables[0].bundle');
  });

  it('rejects a malformed playerVersion', () => {
    const r = validateManifest(
      minimalManifest({ playables: [validPlayable({ playerVersion: 'latest' })] })
    );
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.PATTERN_MISMATCH);
    expect(r.issues.map(i => i.path)).toContain('playables[0].playerVersion');
  });

  it('rejects a malformed manifestHash', () => {
    const r = validateManifest(
      minimalManifest({
        playables: [validPlayable({ bundle: { uri: 'g.pxz', manifestHash: 'zzz' } })],
      })
    );
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.PATTERN_MISMATCH);
  });

  it('rejects unknown fields inside a playable block', () => {
    const r = validateManifest(
      minimalManifest({ playables: [validPlayable({ cheatCode: true })] })
    );
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(ISSUE_CODES.ADDITIONAL_FORBIDDEN);
  });

  it('semantic: duplicate playable IDs are an error', () => {
    const r = validateSemantics(
      minimalManifest({ playables: [validPlayable(), validPlayable()] })
    );
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(SEMANTIC_CODES.DUPLICATE_ID);
  });

  it('semantic: unsafe playable paths are an error', () => {
    const r = validateSemantics(
      minimalManifest({ playables: [validPlayable({ poster: '../evil.png' })] })
    );
    expect(r.valid).toBe(false);
    expect(codes(r)).toContain(SEMANTIC_CODES.UNSAFE_PATH);
  });

  it('semantic: archive-relative bundle/poster paths must exist when an archive listing is given', () => {
    const r = validateSemantics(minimalManifest({ playables: [validPlayable()] }), {
      archiveFiles: ['assets/poster.png'], // bundle + fallback image missing
    });
    expect(r.valid).toBe(false);
    expect(codes(r).filter(c => c === SEMANTIC_CODES.MISSING_ASSET).length).toBe(2);
  });

  it('semantic: absolute https bundle URIs skip archive checks', () => {
    const r = validateSemantics(
      minimalManifest({
        playables: [
          validPlayable({
            poster: 'assets/poster.png',
            bundle: { uri: 'https://cdn.svrn.example/g.pxz', manifestHash: 'b'.repeat(64) },
            fallback: { title: 't' },
          }),
        ],
      }),
      { archiveFiles: ARCHIVE }
    );
    expect(r.valid).toBe(true);
  });
});

describe('playable compat: migrate-on-load no-op for old packages', () => {
  it('a 1.0.0 manifest without playables still validates', () => {
    const old = minimalManifest({ formatVersion: '1.0.0' });
    delete old.playables;
    const r = validateManifest(old);
    expect(r.valid).toBe(true);
    // flagged as migratable (info), never an error
    expect(codes(r)).toContain('format-version-migratable');
    expect(r.issues.filter(i => i.severity === 'error')).toEqual([]);
  });

  it('migrating a 1.0.0 manifest without playables is a no-op apart from the version stamp', () => {
    const old = minimalManifest({ formatVersion: '1.0.0' });
    delete old.playables;
    const { manifest, applied, from, to } = migrateManifest(old);
    expect(from).toBe('1.0.0');
    expect(to).toBe(LATEST_FORMAT_VERSION);
    expect(applied).toEqual(['1.0.0 -> 1.1.0']);
    expect(manifest.playables).toEqual([]);
    expect(validateManifest(manifest).valid).toBe(true);
    // every other field untouched
    const { playables: _p1, formatVersion: _v1, ...restBefore } = old;
    const { playables: _p2, formatVersion: _v2, ...restAfter } = manifest;
    expect(restAfter).toEqual(restBefore);
  });

  it('migration preserves existing playables untouched', () => {
    const doc = minimalManifest({ formatVersion: '1.0.0', playables: [validPlayable()] });
    const { manifest } = migrateManifest(doc);
    expect(manifest.playables).toEqual([validPlayable()]);
    expect(manifest.formatVersion).toBe('1.1.0');
  });

  it('migration is idempotent', () => {
    const once = migrateManifest(minimalManifest({ formatVersion: '1.0.0' })).manifest;
    const twice = migrateManifest(once);
    expect(twice.applied).toEqual([]);
    expect(JSON.stringify(twice.manifest)).toBe(JSON.stringify(once));
  });
});
