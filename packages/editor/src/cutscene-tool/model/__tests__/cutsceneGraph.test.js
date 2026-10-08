/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – cutsceneGraph tests (P3-08)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Fixtures catch unreachable nodes and missing targets.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeCutsceneGraph,
  validateCutsceneGraph,
  reachableIds,
  linearOrder,
  resetIdCounter,
} from '../cutsceneGraph.js';

beforeEach(() => resetIdCounter());

describe('cutsceneGraph', () => {
  it('normalizes a linear event list into a chained graph', () => {
    const g = normalizeCutsceneGraph({
      events: [
        { type: 'dialogue', speaker: 'A', content: 'hi' },
        { type: 'wait', duration: 1 },
        { type: 'action', command: '@bg night' },
      ],
    });
    expect(g.nodes).toHaveLength(3);
    expect(g.nodes[0].next).toEqual([g.nodes[1].id]);
    expect(g.nodes[2].next).toEqual([]);
    expect(linearOrder(g).map(n => n.type)).toEqual(['dialogue', 'wait', 'action']);
    expect(validateCutsceneGraph(g)).toEqual([]);
  });

  it('normalizes branching nodes with choice targets', () => {
    const g = normalizeCutsceneGraph({
      nodes: [
        { id: 'start', type: 'choice', options: [{ text: 'a', targetId: 'a' }, { text: 'b', targetId: 'b' }] },
        { id: 'a', type: 'dialogue', nextId: null },
        { id: 'b', type: 'dialogue', nextId: null },
      ],
    });
    expect(g.nodes[0].next.sort()).toEqual(['a', 'b']);
    expect(validateCutsceneGraph(g)).toEqual([]);
    expect(reachableIds(g).size).toBe(3);
  });

  it('catches missing targets', () => {
    const g = normalizeCutsceneGraph({
      nodes: [{ id: 'start', type: 'choice', options: [{ text: 'x', targetId: 'ghost' }] }],
    });
    const issues = validateCutsceneGraph(g);
    expect(issues.some(i => i.code === 'missing-target' && i.severity === 'error')).toBe(true);
  });

  it('catches unreachable nodes', () => {
    const g = normalizeCutsceneGraph({
      nodes: [
        { id: 'start', type: 'dialogue', nextId: null },
        { id: 'orphan', type: 'dialogue', nextId: null },
      ],
    });
    const issues = validateCutsceneGraph(g);
    expect(issues.some(i => i.code === 'unreachable' && i.nodeId === 'orphan')).toBe(true);
  });

  it('handles empty input', () => {
    const g = normalizeCutsceneGraph({});
    expect(g.nodes).toEqual([]);
    expect(g.entryId).toBe(null);
    expect(validateCutsceneGraph(g)).toEqual([]);
  });
});
