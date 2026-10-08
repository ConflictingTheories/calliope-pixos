/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – BridgedProjectRepository test (P3-10)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * The bridge delegates storage to the live session and adapts it
 * to the ProjectRepository interface.
 */

import { describe, it, expect } from 'vitest';
import { BridgedProjectRepository } from '../repository.js';

function makeBridge() {
  const files = new Map([['a.txt', 'hello'], ['dir/b.json', '{"x":1}']]);
  return new BridgedProjectRepository({
    list: async (prefix = '') =>
      [...files.keys()].filter(p => !prefix || p === prefix || p.startsWith(prefix + '/')).sort(),
    exists: async path => files.has(path),
    read: async (path, options = {}) => {
      if (!files.has(path)) throw new Error(`not found: ${path}`);
      return options.as === 'bytes' ? new TextEncoder().encode(files.get(path)) : files.get(path);
    },
    write: async (path, data) => {
      files.set(path, typeof data === 'string' ? data : new TextDecoder().decode(data));
    },
    remove: async path => {
      files.delete(path);
    },
  });
}

describe('BridgedProjectRepository', () => {
  it('delegates list/read/write/exists/delete', async () => {
    const repo = makeBridge();
    expect(await repo.list('')).toEqual(['a.txt', 'dir/b.json']);
    expect(await repo.list('dir')).toEqual(['dir/b.json']);
    expect(await repo.exists('a.txt')).toBe(true);
    expect(await repo.exists('nope.txt')).toBe(false);
    expect(await repo.read('a.txt')).toBe('hello');
    expect(await repo.read('a.txt', { as: 'bytes' })).toBeInstanceOf(Uint8Array);
    await repo.write('c.txt', 'new');
    expect(await repo.exists('c.txt')).toBe(true);
    await repo.delete('c.txt');
    expect(await repo.exists('c.txt')).toBe(false);
  });

  it('rejects unsafe paths', async () => {
    const repo = makeBridge();
    await expect(repo.read('../escape.txt')).rejects.toThrow();
  });

  it('refuses deterministic export (must go through ZipProjectRepository)', async () => {
    const repo = makeBridge();
    await expect(repo.exportProject()).rejects.toThrow(/ZipProjectRepository/);
  });
});
