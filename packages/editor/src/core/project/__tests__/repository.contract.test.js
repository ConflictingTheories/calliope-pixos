/*
 * ---------------------------------------------------------------
 *     PixoSpritz – Editor – ProjectRepository contract tests
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-01) The same contract suite runs against every
 * ProjectRepository adapter (in-memory and ZIP).  Deterministic
 * export (P3-15) is asserted: two exports of the same logical
 * project must be byte-identical.
 */

import { describe, it, expect } from 'vitest';
import { InMemoryProjectRepository, ZipProjectRepository, stableStringify, normalizeText } from '../repository.js';

/**
 * Register the full repository contract against a factory.
 * @param {string} name
 * @param {() => import('../repository.js').ProjectRepository} create
 */
export function defineRepositoryContract(name, create) {
  describe(`ProjectRepository contract: ${name}`, () => {
    it('writes, reads, lists and deletes files', async () => {
      const repo = create();
      await repo.write('maps/level1.json', JSON.stringify({ w: 4 }));
      await repo.write('tiles/grass.png', new Uint8Array([1, 2, 3]));
      expect(await repo.exists('maps/level1.json')).toBe(true);
      expect(await repo.exists('nope.json')).toBe(false);
      expect((await repo.read('maps/level1.json')).includes('"w"')).toBe(true);
      expect(await repo.read('tiles/grass.png', { as: 'bytes' })).toEqual(new Uint8Array([1, 2, 3]));
      expect(await repo.list()).toEqual(['maps/level1.json', 'tiles/grass.png']);
      expect(await repo.list('maps')).toEqual(['maps/level1.json']);
      await repo.delete('tiles/grass.png');
      expect(await repo.exists('tiles/grass.png')).toBe(false);
    });

    it('rejects unsafe paths', async () => {
      const repo = create();
      await expect(repo.write('/abs.json', '{}')).rejects.toThrow();
      await expect(repo.write('../escape.json', '{}')).rejects.toThrow();
      await expect(repo.read('missing.json')).rejects.toThrow();
    });

    it('exports deterministically: same project, same bytes, same hash', async () => {
      const seed = async () => {
        const repo = create();
        // Write in scrambled order on purpose.
        await repo.write('z.json', JSON.stringify({ z: 1, a: [3, 2] }));
        await repo.write('a.txt', 'hello\r\nworld  \n');
        await repo.write('m/nested.json', JSON.stringify({ b: 2, a: 1 }));
        return repo;
      };
      const first = await (await seed()).exportProject();
      const second = await (await seed()).exportProject();
      expect(first.hash).toBe(second.hash);
      expect(first.bytes).toEqual(second.bytes);
    });

    it('round-trips through import/export', async () => {
      const repo = create();
      await repo.write('maps/level1.json', JSON.stringify({ tiles: [1, 2, 3] }));
      await repo.write('readme.txt', 'pixozine project');
      const { bytes } = await repo.exportProject();
      const other = create();
      await other.importProject(bytes);
      expect(await other.list()).toEqual(['maps/level1.json', 'readme.txt']);
      expect(JSON.parse(await other.read('maps/level1.json'))).toEqual({ tiles: [1, 2, 3] });
      const again = await other.exportProject();
      expect(again.hash).toBe((await repo.exportProject()).hash);
    });

    it('normalizes JSON documents on write (stable key order)', async () => {
      const repo = create();
      await repo.write('doc.json', '{"z":1,"a":2}');
      const text = await repo.read('doc.json');
      expect(text.indexOf('"a"')).toBeLessThan(text.indexOf('"z"'));
    });
  });
}

describe('stableStringify / normalizeText', () => {
  it('sorts keys recursively', () => {
    expect(stableStringify({ z: 1, a: { d: 4, b: 2 } })).toBe('{"a":{"b":2,"d":4},"z":1}');
  });
  it('normalizes CRLF and trailing whitespace', () => {
    expect(normalizeText('a\r\nb  \r\n')).toBe('a\nb\n');
  });
});

defineRepositoryContract('InMemoryProjectRepository', () => new InMemoryProjectRepository());
defineRepositoryContract('ZipProjectRepository', () => new ZipProjectRepository());
