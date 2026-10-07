/**
 * ---------------------------------------------------------------
 *            AI Generator - MCP-Style Tool Layer
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Discrete, JSON-schema-defined tools the model acts through —
 * mirroring the MCP tool pattern used elsewhere in this ecosystem
 * (cf. zine-editor's `server.cjs` MCP implementation). Each tool
 * declares a name, description, input schema, and handler.
 * Orchestrators dispatch through `runTool` instead of bespoke
 * prompt chains, so new capabilities are added by registering a
 * tool, not by rewriting flows.
 *
 * Tool handlers delegate to the existing generator modules; this
 * layer adds validation, uniform results, and a single place for
 * the model-facing contract.
 */

import { generateSpriteConfig, generateCutscene, generateScript, generateManifest } from './text-generator.js';
import { generateSpritesheet, generateTileset, generatePortrait } from './image-generator.js';
import { generateSpeech } from './audio-generator.js';

/**
 * Minimal JSON-schema validation for tool args: required fields
 * plus primitive type checks. This is a gate, not a full validator —
 * generation handlers do their own deep validation.
 */
export function validateToolArgs(schema, args) {
  const errors = [];
  if (typeof args !== 'object' || args === null) {
    return { valid: false, errors: ['args must be an object'] };
  }
  const required = schema.required ?? [];
  for (const key of required) {
    if (args[key] === undefined || args[key] === null) {
      errors.push(`missing required field: ${key}`);
    }
  }
  const props = schema.properties ?? {};
  for (const [key, def] of Object.entries(props)) {
    if (args[key] === undefined) continue;
    const t = def.type;
    if (!t) continue;
    const v = args[key];
    const ok =
      (t === 'string' && typeof v === 'string') ||
      (t === 'number' && typeof v === 'number') ||
      (t === 'integer' && Number.isInteger(v)) ||
      (t === 'boolean' && typeof v === 'boolean') ||
      (t === 'array' && Array.isArray(v)) ||
      (t === 'object' && typeof v === 'object' && v !== null);
    if (!ok) errors.push(`field ${key} must be ${t}`);
    if (def.enum && !def.enum.includes(v)) {
      errors.push(`field ${key} must be one of: ${def.enum.join(', ')}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

const tool = (name, description, inputSchema, handler) => ({
  name,
  description,
  inputSchema,
  handler,
});

export const AI_TOOLS = [
  tool(
    'generate_sprite',
    'Generate a sprite config (JSON) and its spritesheet image for a character, NPC, monster, or item.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        preset: { type: 'string', enum: ['character', 'npc', 'monster', 'item'] },
        tileSize: { type: 'integer' },
        directions: { type: 'integer' },
        framesPerDirection: { type: 'integer' },
      },
    },
    async (args, ctx) => {
      const spriteConfig = {
        tileSize: args.tileSize ?? 32,
        directions: args.directions ?? 4,
        framesPerDirection: args.framesPerDirection ?? 4,
        preset: args.preset ?? 'character',
      };
      const config = await generateSpriteConfig(args.description, spriteConfig);
      const image = await generateSpritesheet(args.description, spriteConfig);
      return { config, image, spriteConfig };
    }
  ),

  tool(
    'generate_sprite_config',
    'Generate only the sprite config JSON (frame layout, directions) without any image.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        preset: { type: 'string', enum: ['character', 'npc', 'monster', 'item'] },
        tileSize: { type: 'integer' },
        directions: { type: 'integer' },
        framesPerDirection: { type: 'integer' },
      },
    },
    async (args, ctx) => {
      const spriteConfig = {
        tileSize: args.tileSize ?? 32,
        directions: args.directions ?? 4,
        framesPerDirection: args.framesPerDirection ?? 4,
        preset: args.preset ?? 'character',
      };
      const config = await generateSpriteConfig(args.description, spriteConfig);
      return { config, spriteConfig };
    }
  ),

  tool(
    'generate_spritesheet_image',
    'Generate only the spritesheet image (base64 PNG) for given sprite parameters.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        tileSize: { type: 'integer' },
        directions: { type: 'integer' },
        framesPerDirection: { type: 'integer' },
      },
    },
    async (args, ctx) => {
      const image = await generateSpritesheet(
        args.description,
        {
          tileSize: args.tileSize ?? 32,
          directions: args.directions ?? 4,
          framesPerDirection: args.framesPerDirection ?? 4,
          onRetry: ctx?.onRetry,
        }
      );
      return { image };
    }
  ),

  tool(
    'generate_tileset',
    'Generate a tileset texture image plus tile metadata for a map theme.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        tileSize: { type: 'integer' },
        columns: { type: 'integer' },
        rows: { type: 'integer' },
      },
    },
    async (args, ctx) => {
      const config = { tileSize: args.tileSize ?? 32, columns: args.columns ?? 8, rows: args.rows ?? 8 };
      const image = await generateTileset(args.description, { ...config, onRetry: ctx?.onRetry });
      return { image, config };
    }
  ),

  tool(
    'generate_audio',
    'Generate speech audio for dialogue or narration. Uses the configured local TTS endpoint when available.',
    {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string' },
        voice: { type: 'string' },
        format: { type: 'string', enum: ['mp3', 'wav', 'ogg'] },
      },
    },
    async (args, ctx) => {
      const audio = await generateSpeech(args.text, { voice: args.voice, format: args.format, onRetry: ctx?.onRetry });
      return { audio, format: args.format ?? 'mp3' };
    }
  ),

  tool(
    'generate_script',
    'Generate a PixoScript behavior script for a trigger type (callback, interaction, zone enter, etc.).',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        triggerType: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const contextSummary = ctx?.assembledContext?.summary ?? '';
      const script = await generateScript(args.description, args.triggerType ?? 'callback', {
        context: contextSummary,
      });
      return { script };
    }
  ),

  tool(
    'generate_cutscene',
    'Generate a cutscene definition (dialogue, camera, events) from a description.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const contextSummary = ctx?.assembledContext?.summary ?? '';
      const cutscene = await generateCutscene(args.description, {
        context: contextSummary,
      });
      return { cutscene };
    }
  ),

  tool(
    'generate_portrait',
    'Generate a character portrait image.',
    {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        size: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const image = await generatePortrait(args.description, { size: args.size, onRetry: ctx?.onRetry });
      return { image };
    }
  ),

  tool(
    'create_pixozine_scaffold',
    'Create a pixozine package scaffold: manifest.json plus folder structure for a new interactive zine/game.',
    {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        author: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const assets = ctx?.assetInventory ?? {};
      const manifest = {
        title: args.title,
        description: args.description ?? '',
        author: args.author ?? '',
        ...generateManifest(assets),
      };
      return {
        manifest,
        folders: ['sprites/', 'tilesets/', 'audio/', 'scripts/', 'cutscenes/', 'maps/'],
      };
    }
  ),

  tool(
    'list_project_assets',
    'List the assets currently in the project (from the ProjectRepository). A context tool for the model.',
    {
      type: 'object',
      properties: {
        kind: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const repo = ctx?.projectRepository;
      if (!repo || typeof repo.list !== 'function') return { assets: [], note: 'no repository available' };
      const assets = await repo.list(args.kind);
      return { assets };
    }
  ),
];

export function getTool(name) {
  return AI_TOOLS.find(t => t.name === name) ?? null;
}

export function listTools() {
  return AI_TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
}

/**
 * Validate args against the tool schema, then run the handler.
 * Returns a uniform result envelope.
 */
export async function runTool(name, args, ctx = {}) {
  const t = getTool(name);
  if (!t) {
    return { ok: false, tool: name, error: `unknown tool: ${name}` };
  }
  const check = validateToolArgs(t.inputSchema, args);
  if (!check.valid) {
    return { ok: false, tool: name, error: `invalid args: ${check.errors.join('; ')}` };
  }
  try {
    const result = await t.handler(args, ctx);
    return { ok: true, tool: name, result };
  } catch (err) {
    return { ok: false, tool: name, error: err?.message ?? String(err) };
  }
}
