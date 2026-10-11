/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – Cutscene graph model
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-08) Framework-free cutscene graph: events, branches,
 * timing, assets and IDs normalized independently of React and
 * the player.  Accepts the linear event list (cutscene-tool) and
 * the branching node model (BranchingDialogue) and normalizes
 * both into one graph.
 *
 * Node: { id, type, next: string[], ...eventFields }
 *   - linear events chain next: [nextId]
 *   - choice nodes expose one next id per option
 */

let autoId = 0;
function nextId(prefix = 'n') {
  autoId += 1;
  return `${prefix}${autoId}`;
}
export function resetIdCounter() {
  autoId = 0;
}

/**
 * Normalize raw cutscene data into a graph.
 * @param {{events?: Array, nodes?: Array}} input
 * @returns {{nodes: Array, entryId: string|null}}
 */
export function normalizeCutsceneGraph(input = {}) {
  const nodes = [];

  if (Array.isArray(input.nodes) && input.nodes.length > 0) {
    for (const raw of input.nodes) {
      const id = raw.id || nextId('node');
      const next = [];
      if (raw.nextId) next.push(raw.nextId);
      for (const opt of raw.options || []) {
        if (opt.targetId) next.push(opt.targetId);
      }
      nodes.push({ ...raw, id, next: [...new Set(next)] });
    }
  } else {
    const events = Array.isArray(input.events) ? input.events : [];
    const ids = events.map((e, i) => e.id || nextId('ev'));
    events.forEach((e, i) => {
      nodes.push({
        ...e,
        id: ids[i],
        next: i + 1 < events.length ? [ids[i + 1]] : [],
      });
    });
  }

  // Deduplicate ids (keep first occurrence).
  const seen = new Set();
  const unique = nodes.filter(n => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  return { nodes: unique, entryId: unique.length > 0 ? unique[0].id : null };
}

/** ids reachable from the entry node (BFS). */
export function reachableIds(graph) {
  const byId = new Map(graph.nodes.map(n => [n.id, n]));
  const seen = new Set();
  const queue = graph.entryId ? [graph.entryId] : [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const node = byId.get(id);
    if (node) for (const n of node.next || []) queue.push(n);
  }
  return seen;
}

/**
 * Typed validation: unreachable nodes, missing targets, duplicate ids.
 * @returns {Array<{severity:string, code:string, message:string, nodeId?:string}>}
 */
export function validateCutsceneGraph(graph) {
  const issues = [];
  const byId = new Map();
  for (const n of graph.nodes) {
    if (byId.has(n.id)) {
      issues.push({ severity: 'error', code: 'duplicate-id', message: `duplicate node id "${n.id}"`, nodeId: n.id });
    } else {
      byId.set(n.id, n);
    }
  }
  for (const n of graph.nodes) {
    for (const target of n.next || []) {
      if (!byId.has(target)) {
        issues.push({
          severity: 'error',
          code: 'missing-target',
          message: `node "${n.id}" points at missing target "${target}"`,
          nodeId: n.id,
        });
      }
    }
  }
  const reachable = reachableIds(graph);
  for (const n of graph.nodes) {
    if (!reachable.has(n.id)) {
      issues.push({
        severity: 'warning',
        code: 'unreachable',
        message: `node "${n.id}" is unreachable from the entry`,
        nodeId: n.id,
      });
    }
  }
  return issues;
}

/** Linear playback order following `next[0]` links (for the linear player). */
export function linearOrder(graph) {
  const byId = new Map(graph.nodes.map(n => [n.id, n]));
  const order = [];
  const seen = new Set();
  let id = graph.entryId;
  while (id && !seen.has(id)) {
    seen.add(id);
    const node = byId.get(id);
    if (!node) break;
    order.push(node);
    id = (node.next || [])[0] || null;
  }
  return order;
}
