/**
 * Pixozine deterministic asset graph — P1-07.
 *
 * Indexes every declared asset ID and file path from a manifest into a
 * deterministic graph: nodes sorted by ID, FNV-1a content hashes, inbound
 * reference lists, and media metadata. Two builds of the same source tree
 * produce identical graphs (key order and iteration order are normalized).
 *
 * Also provides rename/delete *simulations* so editors can preview the blast
 * radius of a change without touching the archive: no silent broken references.
 */

/** FNV-1a 32-bit hash — dependency-free, deterministic across runtimes. */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}

/** Manifest fields that declare asset IDs, mapped to node kinds. */
const ID_FIELDS = {
  maps: 'map',
  tilesets: 'tileset',
  sprites: 'sprite',
  models: 'model',
  shaders: 'shader',
};

/** Manifest fields that declare file paths, mapped to node kinds. */
const PATH_FIELDS = {
  textures: 'texture',
  audio: 'audio',
  scripts: 'script',
  cutscenes: 'cutscene',
  callbacks: 'callback',
  triggers: 'trigger',
};

const SINGLETON_PATHS = { thumbnail: 'media', icon: 'media', splash: 'media' };

/**
 * Build the asset graph.
 * @param {object} manifest - validated manifest
 * @param {Array<string|{path:string,size?:number,hash?:string}>} [files] - archive listing
 * @returns {{ nodes: Array, byId: object, byPath: object, hash: string }}
 *   nodes are sorted by id; `hash` is the graph fingerprint.
 */
export function buildAssetGraph(manifest, files = []) {
  const nodes = new Map(); // id -> node
  const byPath = new Map(); // path -> id

  const addNode = (id, kind, source) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, kind, sources: [], inbound: [], path: null, hash: null, size: null });
    }
    const node = nodes.get(id);
    if (!node.sources.includes(source)) node.sources.push(source);
    return node;
  };

  // ID-declared assets; manifest fields are inbound references.
  for (const [field, kind] of Object.entries(ID_FIELDS)) {
    const list = manifest[field];
    if (!Array.isArray(list)) continue;
    list.forEach((id, i) => {
      const node = addNode(String(id), kind, `manifest:${field}`);
      node.inbound.push({ from: 'manifest', field, index: i });
    });
  }

  // Entry points reference maps too.
  (manifest.initialZones || []).forEach((id, i) => {
    const node = addNode(String(id), 'map', 'manifest:initialZones');
    node.inbound.push({ from: 'manifest', field: 'initialZones', index: i });
  });

  // Path-declared assets.
  const addPath = (p, kind, source, field, index) => {
    const id = `file:${p}`;
    const node = addNode(id, kind, source);
    node.path = p;
    node.inbound.push({ from: 'manifest', field, index });
    byPath.set(p, id);
  };
  for (const [field, kind] of Object.entries(PATH_FIELDS)) {
    const list = manifest[field];
    if (!Array.isArray(list)) continue;
    list.forEach((p, i) => addPath(p, kind, `manifest:${field}`, field, i));
  }
  for (const [field, kind] of Object.entries(SINGLETON_PATHS)) {
    if (manifest[field] !== undefined) addPath(manifest[field], kind, `manifest:${field}`, field, 0);
  }

  // Attach file metadata from the archive listing (deterministic order).
  const fileList = files
    .map(f => (typeof f === 'string' ? { path: f } : f))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  for (const f of fileList) {
    const id = byPath.get(f.path);
    if (!id) continue;
    const node = nodes.get(id);
    node.size = f.size ?? null;
    node.hash = f.hash ?? fnv1a(f.path);
  }
  // Hash ID-nodes deterministically from their identity.
  for (const node of nodes.values()) {
    if (!node.hash) node.hash = fnv1a(`${node.kind}:${node.id}`);
    node.inbound.sort((a, b) =>
      a.field === b.field ? a.index - b.index : a.field < b.field ? -1 : 1
    );
    node.sources.sort();
  }

  const sorted = [...nodes.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const fingerprint = fnv1a(sorted.map(n => `${n.id}@${n.hash}`).join('|'));

  const byId = {};
  for (const n of sorted) byId[n.id] = n;
  const byPathObj = {};
  for (const [p, id] of [...byPath.entries()].sort()) byPathObj[p] = id;

  return { nodes: sorted, byId, byPath: byPathObj, hash: fingerprint };
}

/**
 * Simulate renaming an asset ID: returns every inbound reference that would
 * need rewriting. Pure — does not mutate the graph.
 */
export function simulateRename(graph, fromId, toId) {
  const node = graph.byId[fromId];
  if (!node) return { ok: false, reason: `unknown asset ID: ${fromId}`, affected: [] };
  if (graph.byId[toId]) return { ok: false, reason: `target ID already exists: ${toId}`, affected: [] };
  return { ok: true, affected: node.inbound.map(r => ({ ...r, rewriteTo: toId })) };
}

/**
 * Simulate deleting an asset: returns inbound references that would dangle.
 */
export function simulateDelete(graph, id) {
  const node = graph.byId[id];
  if (!node) return { ok: false, reason: `unknown asset ID: ${id}`, dangling: [] };
  return { ok: true, dangling: [...node.inbound] };
}

export default { buildAssetGraph, simulateRename, simulateDelete, fnv1a };
