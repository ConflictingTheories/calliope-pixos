import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateSemantics, SEMANTIC_CODES } from '../src/semantic.js';
import { buildAssetGraph, simulateRename, simulateDelete, fnv1a } from '../src/asset-graph.js';

function fixture(path) {
  return JSON.parse(readFileSync(new URL(`../fixtures/${path}`, import.meta.url), 'utf8'));
}

const ARCHIVE = [
  'assets/thumb.png',
  'assets/icon.png',
  'assets/splash.png',
  'audio/theme.mp3',
  'scripts/main.pxs',
  'scripts/trigger.pxs',
  'cutscenes/intro.pxc',
  'shaders/water.glsl',
];

describe('semantic validation (P1-06)', () => {
  it('accepts the valid-full fixture against its archive listing', () => {
    const r = validateSemantics(fixture('valid-full/manifest.json'), { archiveFiles: ARCHIVE });
    expect(r.valid).toBe(true);
    expect(r.issues.filter(i => i.severity === 'error')).toEqual([]);
  });

  it('flags dangling initialZones references with paths', () => {
    const m = fixture('valid-minimal/manifest.json');
    m.initialZones = ['zone-1', 'ghost-zone'];
    const r = validateSemantics(m);
    expect(r.valid).toBe(false);
    const dangling = r.issues.filter(i => i.code === SEMANTIC_CODES.DANGLING_REFERENCE);
    expect(dangling).toHaveLength(1);
    expect(dangling[0].path).toBe('initialZones[1]');
  });

  it('flags duplicate IDs across lists', () => {
    const m = fixture('valid-minimal/manifest.json');
    m.tilesets = ['zone-1'];
    const r = validateSemantics(m);
    const dupes = r.issues.filter(i => i.code === SEMANTIC_CODES.DUPLICATE_ID);
    expect(dupes.length).toBeGreaterThan(0);
    expect(r.valid).toBe(false);
  });

  it('rejects unsafe paths', () => {
    const m = fixture('valid-minimal/manifest.json');
    m.scripts = ['scripts/main.pxs', '../../etc/passwd'];
    m.thumbnail = '/abs/thumb.png';
    const r = validateSemantics(m);
    const unsafe = r.issues.filter(i => i.code === SEMANTIC_CODES.UNSAFE_PATH);
    expect(unsafe).toHaveLength(2);
    expect(unsafe.map(i => i.path).sort()).toEqual(['scripts[1]', 'thumbnail']);
  });

  it('flags declared-but-missing assets when an archive listing is given', () => {
    const m = fixture('valid-minimal/manifest.json');
    const r = validateSemantics(m, { archiveFiles: [] });
    const missing = r.issues.filter(i => i.code === SEMANTIC_CODES.MISSING_ASSET);
    expect(missing.length).toBeGreaterThan(0);
    expect(missing[0].path).toMatch(/^scripts\[0\]$/);
    expect(r.valid).toBe(false);
  });

  it('warns on suspicious resolution bounds', () => {
    const m = fixture('valid-full/manifest.json');
    m.settings.resolution = [99999, 10];
    const r = validateSemantics(m, { archiveFiles: ARCHIVE });
    const w = r.issues.filter(i => i.code === SEMANTIC_CODES.SUSPICIOUS_BOUNDS);
    expect(w).toHaveLength(1);
    expect(w[0].severity).toBe('warning');
    expect(r.valid).toBe(true); // warnings don't fail
  });

  it('reports non-entry maps as info, not errors', () => {
    const m = fixture('valid-full/manifest.json');
    m.maps = ['zone-1', 'secret-zone'];
    const r = validateSemantics(m, { archiveFiles: ARCHIVE });
    const info = r.issues.filter(i => i.code === SEMANTIC_CODES.UNREACHABLE_ASSET);
    expect(info).toHaveLength(1);
    expect(info[0].severity).toBe('info');
    expect(r.valid).toBe(true);
  });
});

describe('asset graph (P1-07)', () => {
  it('builds a deterministic graph (same input -> same hash)', () => {
    const m = fixture('valid-full/manifest.json');
    const g1 = buildAssetGraph(m, ARCHIVE);
    const g2 = buildAssetGraph(m, [...ARCHIVE].reverse());
    expect(g1.hash).toBe(g2.hash);
    expect(JSON.stringify(g1.nodes)).toBe(JSON.stringify(g2.nodes));
  });

  it('indexes IDs, paths, hashes, and inbound references', () => {
    const g = buildAssetGraph(fixture('valid-full/manifest.json'), ARCHIVE);
    const zone = g.byId['zone-1'];
    expect(zone.kind).toBe('map');
    expect(zone.inbound.some(r => r.field === 'initialZones')).toBe(true);
    expect(zone.inbound.some(r => r.field === 'maps')).toBe(true);
    const script = g.byPath['scripts/main.pxs'];
    expect(g.byId[script].kind).toBe('script');
    expect(typeof g.byId[script].hash).toBe('string');
  });

  it('fnv1a is stable and dependency-free', () => {
    expect(fnv1a('hello')).toBe(fnv1a('hello'));
    expect(fnv1a('hello')).not.toBe(fnv1a('world'));
  });

  it('simulateRename reports every inbound reference without mutating', () => {
    const g = buildAssetGraph(fixture('valid-full/manifest.json'), ARCHIVE);
    const before = JSON.stringify(g.nodes);
    const sim = simulateRename(g, 'zone-1', 'zone-one');
    expect(sim.ok).toBe(true);
    expect(sim.affected.length).toBeGreaterThan(0);
    expect(sim.affected.every(r => r.rewriteTo === 'zone-one')).toBe(true);
    expect(JSON.stringify(g.nodes)).toBe(before);
    expect(simulateRename(g, 'nope', 'x').ok).toBe(false);
    expect(simulateRename(g, 'zone-1', 'hero').ok).toBe(false); // target exists
  });

  it('simulateDelete reports dangling inbound references', () => {
    const g = buildAssetGraph(fixture('valid-full/manifest.json'), ARCHIVE);
    const sim = simulateDelete(g, 'file:scripts/main.pxs');
    expect(sim.ok).toBe(true);
    expect(sim.dangling.length).toBeGreaterThan(0);
    expect(simulateDelete(g, 'ghost').ok).toBe(false);
  });
});
