/*
 * ---------------------------------------------------------------
 *     AI Generator - context-assembler tests
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 */

import { describe, it, expect } from 'vitest';
import { assembleContext, describeInclusion } from '../context-assembler.js';

describe('assembleContext', () => {
  it('includes the current file when toggled on', async () => {
    const ctx = await assembleContext({
      includeCurrentFile: true,
      currentDocument: { path: 'maps/start.json', kind: 'map', content: '{"cells":[]}' },
    });
    expect(ctx.included).toContain('current-file');
    expect(ctx.summary).toMatch(/start\.json/);
  });

  it('omits everything when all toggles are off', async () => {
    const ctx = await assembleContext({
      includeCurrentFile: false,
      includeProject: false,
      includeAssets: false,
      currentDocument: { path: 'x.json', content: 'secret' },
    });
    expect(ctx.included).toEqual([]);
    expect(ctx.summary).not.toMatch(/secret/);
  });

  it('truncates large files with a note', async () => {
    const big = 'x'.repeat(20000);
    const ctx = await assembleContext({
      includeCurrentFile: true,
      currentDocument: { path: 'big.json', content: big },
    });
    expect(ctx.files[0].content.length).toBeLessThan(big.length);
    expect(ctx.files[0].content).toMatch(/truncated/);
  });

  it('lists project assets from the repository', async () => {
    const repo = {
      list: async () => ['sprites/hero.png', 'maps/start.json'],
    };
    const ctx = await assembleContext({
      includeCurrentFile: false,
      includeAssets: true,
      projectRepository: repo,
    });
    expect(ctx.included).toContain('assets');
    expect(ctx.assets).toEqual(['sprites/hero.png', 'maps/start.json']);
  });

  it('survives a broken repository', async () => {
    const repo = {
      list: async () => {
        throw new Error('boom');
      },
    };
    const ctx = await assembleContext({ includeAssets: true, projectRepository: repo });
    expect(ctx.assets).toEqual([]);
  });

  it('includes the manifest when provided', async () => {
    const ctx = await assembleContext({
      includeCurrentFile: false,
      manifest: { title: 'My Zine' },
    });
    expect(ctx.summary).toMatch(/My Zine/);
  });
});

describe('describeInclusion', () => {
  it('describes the active toggles', () => {
    expect(describeInclusion({ includeCurrentFile: true })).toMatch(/current file/);
    expect(describeInclusion({})).toBe('no project context');
  });
});
