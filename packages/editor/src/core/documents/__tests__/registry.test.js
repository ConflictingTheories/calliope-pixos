/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – DocumentRegistry tests (P2-03)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 */

import { describe, it, expect } from 'vitest';
import { DocumentRegistry, createDefaultRegistry } from '../registry.js';

describe('DocumentRegistry', () => {
  it('round-trips known documents and reports typed issues', () => {
    const reg = createDefaultRegistry();
    const { kind, data, issues } = reg.loadDocument(
      JSON.stringify({ width: 4, height: 4, layers: [{ cells: [[1]] }] }),
      { path: 'maps/a.pixomap.json' }
    );
    expect(kind).toBe('map');
    expect(issues).toEqual([]);
    expect(data.width).toBe(4);
    const out = reg.serializeDocument('map', data);
    expect(JSON.parse(out).layers).toHaveLength(1);
  });

  it('migrates partial documents and flags malformed cells', () => {
    const reg = createDefaultRegistry();
    const { data, issues } = reg.loadDocument(JSON.stringify({}), { path: 'm.pixomap.json' });
    expect(data.layers).toEqual([]);
    expect(data.width).toBe(16);
    const bad = reg.loadDocument(JSON.stringify({ layers: [{}] }), { path: 'm.pixomap.json' });
    expect(bad.issues.some(i => i.severity === 'error' && /cells/.test(i.message))).toBe(true);
  });

  it('keeps unknown documents inspectable via passthrough', () => {
    const reg = createDefaultRegistry();
    const { kind, data, issues } = reg.loadDocument('whatever', { path: 'x.blorb' });
    expect(kind).toBe('unknown');
    expect(data).toBe('whatever');
    expect(issues).toEqual([]);
    expect(reg.serializeDocument('unknown', 'whatever')).toBe('whatever');
  });

  it('resolves kinds from extensions', () => {
    const reg = createDefaultRegistry();
    expect(reg.resolveKind({ path: 'a.png' })).toBe('image');
    expect(reg.resolveKind({ path: 'b.pxs' })).toBe('script');
    expect(reg.resolveKind({ path: 'c.wav' })).toBe('audio');
  });

  it('loads script sources as text or descriptors', () => {
    const reg = createDefaultRegistry();
    const a = reg.loadDocument('print("hi")', { path: 's.pxs' });
    expect(a.data.source).toBe('print("hi")');
    const b = reg.loadDocument(JSON.stringify({ source: 'x', language: 'pxsl' }), { path: 's.pxs' });
    expect(b.data.language).toBe('pxsl');
    expect(reg.validateDocument('script', {}).some(i => i.severity === 'error')).toBe(true);
  });

  it('rejects adapters missing required functions', () => {
    const reg = new DocumentRegistry();
    expect(() => reg.register({ kind: 'bad' })).toThrow();
  });
});
