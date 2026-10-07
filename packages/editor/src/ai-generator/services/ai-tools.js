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
import aiService from './ai-service.js';

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
        // tileSize accepts an integer (square) or [width, height]; directions
        // accepts a count or an array of direction codes (length is used).
        tileSize: {},
        directions: {},
        framesPerDirection: { type: 'integer' },
        style: { type: 'string' },
        sheetSize: { type: 'array' },
      },
    },
    async (args, ctx) => {
      const t = args.tileSize ?? 32;
      const tileSize = Array.isArray(t) ? t : [t, t];
      const d = args.directions ?? 4;
      const directions = Array.isArray(d) ? d.length : d;
      const image = await generateSpritesheet(args.description, {
        tileSize,
        directions,
        framesPerDirection: args.framesPerDirection ?? 4,
        sheetSize: args.sheetSize,
        style: args.style,
        onRetry: ctx?.onRetry,
      });
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
      // generateTileset reads `cols`, not `columns` — map explicitly.
      const image = await generateTileset(args.description, {
        tileSize: config.tileSize,
        cols: config.columns,
        rows: config.rows,
        onRetry: ctx?.onRetry,
      });
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
        spriteName: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const contextSummary = ctx?.assembledContext?.summary ?? '';
      const script = await generateScript(args.description, args.triggerType ?? 'callback', {
        context: contextSummary,
        spriteName: args.spriteName,
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
        characters: { type: 'array' },
        mood: { type: 'string' },
        length: { type: 'string', enum: ['short', 'medium', 'long'] },
      },
    },
    async (args, ctx) => {
      const contextSummary = ctx?.assembledContext?.summary ?? '';
      const cutscene = await generateCutscene(args.description, {
        context: contextSummary,
        characters: args.characters,
        mood: args.mood,
        length: args.length,
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
        style: { type: 'string' },
      },
    },
    async (args, ctx) => {
      const image = await generatePortrait(args.description, {
        size: args.size,
        style: args.style,
        onRetry: ctx?.onRetry,
      });
      return { image };
    }
  ),

  tool(
    'analyze_game_concept',
    'Analyze a high-level game description into structured concept data (title, genre, characters, locations, items, quests, cutscenes). Returns parsed conceptData for the caller to validate.',
    {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string' },
        temperature: { type: 'number' },
      },
    },
    async (args, ctx) => {
      const systemPrompt = `You are an expert game designer. Analyze the game concept and extract structured information.

Return ONLY valid JSON with this structure:
{
  "title": "Game Title",
  "genre": "rpg|action|puzzle|adventure",
  "setting": "fantasy|sci-fi|modern|medieval|post-apocalyptic",
  "synopsis": "Brief 2-3 sentence game synopsis",
  "mood": "adventurous|dark|whimsical|serious|comedic",
  "characters": [
    {
      "name": "character_id",
      "displayName": "Character Name",
      "type": "player|npc|enemy",
      "description": "Visual description for sprite generation - be specific about clothing, colors, features",
      "role": "hero|merchant|guard|villain|etc",
      "personality": "friendly|grumpy|mysterious|etc"
    }
  ],
  "locations": [
    {
      "id": "location_id",
      "name": "Location Name",
      "type": "town|dungeon|forest|castle|etc",
      "description": "Visual description for backdrop/tileset"
    }
  ],
  "items": [
    {
      "id": "item_id",
      "name": "Item Name",
      "type": "weapon|armor|consumable|key",
      "description": "Visual description"
    }
  ],
  "quests": [
    {
      "id": "quest_id",
      "title": "Quest Title",
      "giver": "character_id",
      "description": "Quest objective",
      "reward": "What player gets"
    }
  ],
  "cutscenes": [
    {
      "id": "cutscene_id",
      "trigger": "intro|quest_start|quest_complete|boss_defeat",
      "description": "What happens in this cutscene - be detailed",
      "characters": ["char1", "char2"]
    }
  ]
}

CRITICAL REQUIREMENTS:
- You MUST include at least 1 character with type "player"
- You MUST include at least 1 character with type "npc"
- You MUST include at least 1 location
- You MUST include at least 1 cutscene with trigger "intro"
- Character descriptions should be VISUAL - describe appearance for sprite generation
- Make it a coherent, playable game`;

      const analysisPrompt = `Analyze and design a game based on this concept:

${args.prompt}

Extract all characters, locations, items, quests, and plan cutscenes.
Make it a coherent, playable game with clear progression.
ENSURE you have at least: 1 player, 1 NPC, 1 location, 1 intro cutscene.
RESPOND WITH ONLY VALID JSON, NO MARKDOWN, NO EXPLANATION.`;

      const response = await aiService.chatCompletion(analysisPrompt, systemPrompt, null, {
        temperature: args.temperature ?? 0.7,
      });

      let conceptData;
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('AI did not return JSON for game concept');
        }
        try {
          conceptData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          throw new Error('AI returned invalid JSON for game concept');
        }
      } else if (typeof response === 'object' && response !== null) {
        conceptData = response;
      } else {
        throw new Error('AI returned empty or invalid response');
      }
      return { conceptData };
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
