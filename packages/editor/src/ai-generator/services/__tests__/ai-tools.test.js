/*
 * ---------------------------------------------------------------
 *     AI Generator - ai-tools tests
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 */

import { describe, it, expect } from 'vitest';
import {
  AI_TOOLS,
  getTool,
  listTools,
  runTool,
  validateToolArgs,
} from '../ai-tools.js';

describe('validateToolArgs', () => {
  const schema = {
    type: 'object',
    required: ['description'],
    properties: {
      description: { type: 'string' },
      tileSize: { type: 'integer' },
      preset: { type: 'string', enum: ['character', 'npc'] },
    },
  };

  it('accepts valid args', () => {
    const r = validateToolArgs(schema, { description: 'a knight', tileSize: 32 });
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('rejects missing required fields', () => {
    const r = validateToolArgs(schema, { tileSize: 32 });
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/description/);
  });

  it('rejects wrong types', () => {
    const r = validateToolArgs(schema, { description: 'x', tileSize: '32' });
    expect(r.valid).toBe(false);
  });

  it('rejects out-of-enum values', () => {
    const r = validateToolArgs(schema, { description: 'x', preset: 'dragon' });
    expect(r.valid).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(validateToolArgs(schema, null).valid).toBe(false);
    expect(validateToolArgs(schema, 'nope').valid).toBe(false);
  });
});

describe('tool registry', () => {
  it('defines the expected tools with schemas', () => {
    const names = AI_TOOLS.map(t => t.name);
    for (const expected of [
      'generate_sprite',
      'generate_tileset',
      'generate_audio',
      'generate_script',
      'create_pixozine_scaffold',
    ]) {
      expect(names).toContain(expected);
    }
    for (const t of AI_TOOLS) {
      expect(typeof t.name).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(t.inputSchema?.type).toBe('object');
      expect(typeof t.handler).toBe('function');
    }
  });

  it('listTools omits handlers', () => {
    for (const t of listTools()) {
      expect(t.handler).toBeUndefined();
      expect(t.inputSchema).toBeDefined();
    }
  });

  it('getTool returns null for unknown tools', () => {
    expect(getTool('nope')).toBeNull();
  });
});

describe('runTool', () => {
  it('rejects unknown tools', async () => {
    const r = await runTool('nope', {});
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/unknown tool/);
  });

  it('rejects invalid args without calling the handler', async () => {
    const r = await runTool('generate_sprite', {});
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/invalid args/);
  });

  it('wraps handler errors in the envelope (no network)', async () => {
    // list_project_assets without a repository in ctx throws before any IO
    const r = await runTool('list_project_assets', { prefix: '' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/No project repository/);
  });
});
