/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ToolRegistry
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-12) Lazy tool capabilities.  Every tool panel loads via
 * React.lazy + dynamic import, so the initial shell bundle no
 * longer parses all 12 tool panels at boot.  Vite code-splits each
 * dynamic import automatically; heavy extras (Monaco workers /
 * languages, html2canvas export, audio analysis, 3D, AI generator)
 * land in their own chunks (see vite.config.js manualChunks).
 *
 * resolveToolForFile(name) centralizes the extension -> tool
 * dispatch that used to live inline in app.jsx.
 */

import React from 'react';

/**
 * @typedef {Object} ToolDefinition
 * @property {string} id
 * @property {string} title
 * @property {() => Promise<*>} load        dynamic importer (preloading)
 * @property {React.LazyExoticComponent} component
 * @property {(fileName: string) => boolean} matches
 * @property {string} [chunk]  vite chunk hint (documentation)
 */

function defineTool(def) {
  const component = React.lazy(def.load);
  return { ...def, component };
}

/**
 * P6-10 — AI generator isolation.
 *
 * The AI generator is an optional, network-dependent tool. It is isolated
 * on three axes:
 *
 * 1. Build flag: `VITE_AI_GENERATOR=0` excludes the tool (and its chunk)
 *    from the editor build entirely — e.g. for offline/air-gapped builds.
 * 2. Capability gate: the entry carries `requiresProvider: true`; the shell
 *    must treat it as unavailable until a provider is configured. The tool
 *    UI itself renders a "configure API key" state with no key (it ships
 *    without provider config by default).
 * 3. No direct project writes: generation output flows through the shared
 *    validator and the host-supplied `writeFile` — the orchestrator never
 *    touches the project store itself.
 */
const AI_GENERATOR_ENABLED = (() => {
  try {
    return import.meta.env?.VITE_AI_GENERATOR !== '0';
  } catch {
    return true;
  }
})();

export const TOOLS = [
  defineTool({
    id: 'script-editor',
    title: 'Script Editor',
    load: () => import('../script-editor/index.jsx'),
    matches: n => n.endsWith('.pxs') || n.endsWith('.pxsl') || n.endsWith('.txt') || n.endsWith('.js'),
    chunk: 'tool-script',
  }),
  defineTool({
    id: 'cutscene-tool',
    title: 'Cutscene Tool',
    load: () => import('../cutscene-tool/index.jsx'),
    matches: n => n.endsWith('.pxc') || (n.endsWith('.json') && n.includes('cutscene')),
    chunk: 'tool-cutscene',
  }),
  defineTool({
    id: 'image-preview',
    title: 'Image Preview',
    load: () => import('../image-preview/index.jsx'),
    matches: n => ['.png', '.gif', '.jpg', '.jpeg', '.bmp'].some(e => n.endsWith(e)),
    chunk: 'tool-image',
  }),
  defineTool({
    id: 'audio-preview',
    title: 'Audio Preview',
    load: () => import('../audio-preview/index.jsx'),
    matches: n => ['.mp3', '.wav', '.ogg'].some(e => n.endsWith(e)),
    chunk: 'tool-audio',
  }),
  defineTool({
    id: 'model-preview',
    title: '3D Model Preview',
    load: () => import('../model-preview/index.jsx'),
    matches: n => ['.obj', '.mtl', '.gltf', '.glb'].some(e => n.endsWith(e)),
    chunk: 'tool-3d',
  }),
  defineTool({
    id: 'map-editor',
    title: 'Map Editor',
    load: () => import('../map-editor/UnifiedMapEditor.jsx'),
    matches: n => n.endsWith('.json') && n.includes('map'),
    chunk: 'tool-map',
  }),
  defineTool({
    id: 'tile-editor',
    title: 'Tile Editor',
    load: () => import('../tile-editor/index.jsx'),
    matches: n => n.endsWith('.json') && n.includes('tiles'),
    chunk: 'tool-tile',
  }),
  defineTool({
    id: 'geometry-editor',
    title: 'Geometry Editor',
    load: () => import('../geometry-editor/index.jsx'),
    matches: n => n.endsWith('.json') && n.includes('geometry'),
    chunk: 'tool-geometry',
  }),
  defineTool({
    id: 'geometry-editor-3d',
    title: 'Geometry Editor 3D',
    load: () => import('../geometry-editor/GeometryEditor3D.jsx'),
    matches: () => false, // opened explicitly, not by extension
    chunk: 'tool-3d',
  }),
  defineTool({
    id: 'sprite-editor',
    title: 'Sprite Editor',
    load: () => import('../sprite-editor/index.jsx'),
    matches: n => n.endsWith('.json') && n.includes('sprite'),
    chunk: 'tool-sprite',
  }),
  defineTool({
    id: 'ai-generator',
    title: 'AI Generator',
    load: () => import('../ai-generator/index.jsx'),
    matches: () => false, // panel, opened explicitly
    chunk: 'tool-ai',
    // P6-10: optional tool. Excluded from the build when
    // VITE_AI_GENERATOR=0; requires a configured provider at runtime.
    optional: true,
    requiresProvider: true,
    enabled: AI_GENERATOR_ENABLED,
  }),
].filter(t => t.enabled !== false);

/** JSON files fall back to the script editor when no specialist matches. */
export const FALLBACK_TOOL_ID = 'script-editor';

export function getTool(id) {
  return TOOLS.find(t => t.id === id) || null;
}

/**
 * P6-10 — capability gate for optional tools.
 *
 * Returns false for tools excluded at build time (`enabled: false`) or
 * requiring a provider that isn't configured. `isProviderConfigured` is
 * injected by the shell (which owns the ai-service import) to avoid a
 * registry -> service dependency cycle.
 */
export function isToolAvailable(id, { isProviderConfigured = false } = {}) {
  const tool = getTool(id);
  if (!tool) return false;
  if (tool.enabled === false) return false;
  if (tool.requiresProvider && !isProviderConfigured) return false;
  return true;
}

/** Build-time flag, exported for tests and the shell. */
export function isAiGeneratorEnabled() {
  return AI_GENERATOR_ENABLED;
}

/**
 * Resolve the tool for a file name (lowercased).  Mirrors the legacy
 * app.jsx dispatch order: specialists first, script editor as JSON fallback.
 * @param {string} fileName
 * @returns {ToolDefinition|null}
 */
export function resolveToolForFile(fileName) {
  const name = (fileName || '').toLowerCase();
  for (const tool of TOOLS) {
    if (tool.matches(name)) return tool;
  }
  if (name.endsWith('.json')) return getTool(FALLBACK_TOOL_ID);
  return null;
}

/** Preload a tool's chunk (e.g. on hover) without rendering it. Best-effort. */
export function preloadTool(id) {
  const tool = getTool(id);
  if (!tool) return Promise.resolve();
  return tool.load().catch(() => {});
}
