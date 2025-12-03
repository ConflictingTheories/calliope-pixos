/**
 * ---------------------------------------------------------------
 *                AI Generator - Text Generator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Handles generation of text content including scripts (.pxs),
 * cutscenes/dialogues (.pxc), and configuration files (.json).
 * Uses comprehensive DSL specifications for guaranteed valid output.
 */

import aiService from './ai-service.js';
import { SPRITE_CONFIG_SCHEMA, NPC_STATES_SCHEMA } from './schemas.js';
import { 
  getSystemPrompt, 
  SPRITESHEET_LAYOUTS, 
  calculateFrameCoordinates,
  generateSpriteConfigFromLayout,
} from './dsl-specifications.js';
import {
  validateSpriteConfig,
  validateCutscene,
  validateScript,
} from './asset-validation.js';

/**
 * Generate a sprite configuration JSON with GUARANTEED valid frame coordinates
 * @param {string} description - Sprite description
 * @param {object} spriteConfig - Sprite parameters from analyzer
 * @returns {Promise<object>} Sprite configuration object
 */
export async function generateSpriteConfig(description, spriteConfig) {
  const { tileSize, sheetSize, directions, framesPerDirection, preset } = spriteConfig;
  
  // Determine layout based on preset and directions
  let layoutName = 'character4';
  if (directions >= 8) {
    layoutName = 'character8';
  } else if (preset === 'npc') {
    layoutName = 'npc';
  } else if (preset === 'monster') {
    layoutName = 'monster';
  } else if (preset === 'item') {
    layoutName = 'item';
  } else if (preset === 'effect') {
    layoutName = 'effect';
  }
  
  // Generate base config with CORRECT frame coordinates
  const layout = SPRITESHEET_LAYOUTS[layoutName];
  const correctFrames = calculateFrameCoordinates(layout);
  
  // Build the config with guaranteed correct values
  const baseConfig = {
    type: 'sprite',
    src: 'sprite.png', // Will be replaced later
    sheetSize: layout.sheetSize,
    tileSize: layout.tileSize,
    frames: correctFrames,
    drawOffset: {},
    hotspotOffset: [0.5, 0.5, 0],
    state: 'intro',
    enableSpeech: true,
    bindCamera: preset === 'character',
    frameTime: 150,
  };
  
  // Add draw offsets for each direction
  for (const dir of layout.directions) {
    baseConfig.drawOffset[dir] = [-0.15, -0.15, -1];
  }
  
  // Try to get AI-enhanced metadata (name, description, states, etc.)
  try {
    const systemPrompt = getSystemPrompt('sprite-config');
    
    const prompt = `Generate sprite metadata for: ${description}

The frame coordinates are already calculated correctly. 
Only provide these optional properties as JSON:
{
  "displayName": "Human readable name",
  "description": "Brief description",
  "states": [
    {
      "name": "intro",
      "next": "idle", 
      "actions": [{"type": "dialogue", "dialogue": "...", "callback": "..."}]
    },
    {
      "name": "idle",
      "next": "idle",
      "actions": []
    }
  ]
}

Keep the dialogue SHORT (1-2 sentences) and character-appropriate.
Return ONLY valid JSON.`;

    const aiMetadata = await aiService.chatCompletion(
      prompt,
      systemPrompt,
      null,
      { temperature: 0.5 }
    );
    
    // Merge AI suggestions, keeping our correct frame data
    if (aiMetadata && typeof aiMetadata === 'object') {
      if (aiMetadata.displayName) baseConfig.displayName = aiMetadata.displayName;
      if (aiMetadata.description) baseConfig.description = aiMetadata.description;
      if (aiMetadata.states && Array.isArray(aiMetadata.states)) {
        baseConfig.states = aiMetadata.states;
      }
    }
  } catch (error) {
    console.warn('AI metadata generation failed, using defaults:', error.message);
  }
  
  // Validate and fix any remaining issues
  const validated = validateSpriteConfig(baseConfig, layoutName);
  
  return validated.config;
}

/**
 * Generate a cutscene script with PROPER format
 * @param {string} description - Scene description
 * @param {object} options - Generation options
 * @returns {Promise<string>} Cutscene script content
 */
export async function generateCutscene(description, options = {}) {
  const characters = options.characters || [];
  const mood = options.mood || 'neutral';
  const length = options.length || 'medium';

  const lengthGuide = {
    short: '3-5 dialogue exchanges, ~30 seconds',
    medium: '6-10 dialogue exchanges, ~1 minute',
    long: '10-15 dialogue exchanges, ~2 minutes',
  };

  const charList = characters.length > 0 
    ? `Use these characters: ${characters.map(c => c.toUpperCase()).join(', ')}`
    : 'Create 2-3 appropriate characters (use UPPERCASE names like HERO, MERCHANT, GUARD)';

  const systemPrompt = getSystemPrompt('cutscene', { mood, characters });
  
  const prompt = `Create a ${mood} cutscene for: ${description}

${charList}
Length: ${lengthGuide[length] || lengthGuide.medium}

Requirements:
1. Start with @backdrop and @char definitions
2. Include @do playBgm for atmosphere
3. Use varied expressions (smile, worried, shocked, angry, neutral)
4. Alternate character positions (left, right)
5. Add wait commands (500-1500ms) for pacing
6. Use ONE *cutin moment for drama
7. End with waitInput and @end

Write engaging, natural dialogue that fits the scene.`;

  let result = await aiService.chatCompletion(
    prompt,
    systemPrompt,
    null, // Don't use structured output for cutscenes
    { temperature: 0.75 }
  );
  
  // Clean up result
  if (typeof result === 'string') {
    // Remove markdown code blocks if present
    result = result.replace(/^```\w*\n?/gm, '').replace(/```$/gm, '').trim();
  }
  
  // Validate and fix
  const validated = validateCutscene(result);
  
  if (validated.warnings.length > 0) {
    console.warn('Cutscene warnings:', validated.warnings);
  }
  
  return validated.content;
}

/**
 * Generate a PixosScript behavior script
 * @param {string} description - Script description/purpose
 * @param {string} triggerType - Type of trigger (callback, trigger, zone, event)
 * @param {object} options - Generation options
 * @returns {Promise<string>} Script content
 */
export async function generateScript(description, triggerType = 'callback', options = {}) {
  const context = options.context || '';
  const spriteName = options.spriteName || 'sprite';

  const scriptTemplates = {
    callback: `-- Callback: ${description}
-- Called when sprite action is triggered

local _this = pixos.get_caller()
local player = pixos.get_subject()

pixos.log(pixos.as_obj({ msg = '${description}', caller = _this }))

-- TODO: Add your callback logic here

pixos.callback_finish(1)`,

    npc: `-- NPC Interaction: ${description}
local npc = pixos.get_caller()
local player = pixos.get_subject()

-- Check quest state
if pixos.has_flag('quest_${spriteName}_complete') then
    pixos.sync({ pixos.sprite_dialogue(npc, 'Thank you for your help!') })
    return nil
end

if pixos.has_flag('quest_${spriteName}_active') then
    pixos.sync({ pixos.sprite_dialogue(npc, 'Have you completed the task?') })
    return nil
end

-- First interaction
pixos.sync({ pixos.sprite_dialogue(npc, 'Greetings, traveler! I need your assistance.') })
pixos.set_flag('quest_${spriteName}_active', true)

return nil`,

    zone: `-- Zone Load Trigger: ${description}
local zone = pixos.get_caller()

pixos.log(pixos.as_obj({ msg = 'zone loaded', zone = zone }))

-- Set atmosphere
pixos.set_mode('explore')

-- Optional: Play intro cutscene once
if not pixos.has_flag('zone_${spriteName}_visited') then
    pixos.set_flag('zone_${spriteName}_visited', true)
    -- pixos.sync({ pixos.play_pxc_cutscene('cutscenes/zone-intro.pxc') })
end

return nil`,

    portal: `-- Portal Trigger: ${description}
local portal = pixos.get_caller()
local player = pixos.get_subject()

local targetZone = pixos.from(portal, 'zones')
local zipPath = pixos.from(portal, 'zip')

pixos.log(pixos.as_obj({ msg = 'entering portal', target = targetZone }))

pixos.remove_all_zones()

local steps = {}
table.insert(steps, { type = 'transition', effect = 'fade', direction = 'out', duration = 500 })
table.insert(steps, { type = 'load_zone', zone = targetZone, zip = zipPath })
table.insert(steps, { type = 'transition', effect = 'fade', direction = 'in', duration = 500 })

pixos.sync({ pixos.run_cutscene(steps) })

return nil`,

    event: `-- Event Trigger: ${description}
local _this = pixos.get_caller()
local subject = pixos.get_subject()

pixos.log(pixos.as_obj({ msg = 'event triggered', event = '${description}' }))

-- Check prerequisites
-- if not pixos.has_flag('prerequisite') then return nil end

-- Trigger action

return nil`,
  };

  // Get template or let AI generate
  const template = scriptTemplates[triggerType] || scriptTemplates.callback;
  
  const systemPrompt = getSystemPrompt('script', { type: triggerType });
  
  const prompt = `Generate a PixosScript for: ${description}

Script type: ${triggerType}
${context ? `Context: ${context}` : ''}
Base template:
\`\`\`lua
${template}
\`\`\`

Modify the template to implement the described behavior.
Keep the core structure but add specific logic for: ${description}

Return ONLY the Lua script, no explanations.`;

  let result = await aiService.chatCompletion(
    prompt,
    systemPrompt,
    null,
    { temperature: 0.4 }
  );
  
  // Clean up result
  if (typeof result === 'string') {
    result = result.replace(/^```\w*\n?/gm, '').replace(/```$/gm, '').trim();
  }
  
  // Validate
  const validated = validateScript(result);
  
  return validated.content;
}

/**
 * Generate NPC states and behaviors
 * @param {string} description - NPC description
 * @param {object} options - Generation options
 * @returns {Promise<object>} NPC states configuration
 */
export async function generateNPCStates(description, options = {}) {
  const role = options.role || 'generic NPC';
  const personality = options.personality || 'friendly';
  const interactions = options.interactions || ['talk'];

  const systemPrompt = getSystemPrompt('sprite-config');
  
  const prompt = `Generate NPC state machine for: ${description}

Role: ${role}
Personality: ${personality}
Interactions: ${interactions.join(', ')}

Return ONLY valid JSON with this exact structure:
{
  "states": [
    {
      "name": "intro",
      "next": "idle",
      "actions": [
        {
          "type": "dialogue",
          "dialogue": "Short greeting appropriate for ${role}",
          "callback": "npc_greet"
        }
      ]
    },
    {
      "name": "idle",
      "next": "idle",
      "actions": []
    }
  ]
}

Keep dialogue SHORT (1-2 sentences). Match the ${personality} personality.`;

  try {
    const states = await aiService.chatCompletion(
      prompt,
      systemPrompt,
      NPC_STATES_SCHEMA,
      { temperature: 0.5 }
    );
    
    return states;
  } catch (error) {
    // Return default states on failure
    return {
      states: [
        {
          name: 'intro',
          next: 'idle',
          actions: [
            {
              type: 'dialogue',
              dialogue: 'Hello there.',
              callback: 'npc_default',
            },
          ],
        },
        {
          name: 'idle',
          next: 'idle',
          actions: [],
        },
      ],
    };
  }
}

/**
 * Generate dialogue lines for a character
 * @param {string} characterDescription - Character description
 * @param {string} situation - Current situation/context
 * @param {number} count - Number of lines to generate
 * @returns {Promise<string[]>} Array of dialogue lines
 */
export async function generateDialogueLines(characterDescription, situation, count = 5) {
  const prompt = `Generate ${count} dialogue lines for: ${characterDescription}

Situation: ${situation}

Requirements:
- Each line 1-2 sentences MAX
- Natural and in-character
- Appropriate for RPG game
- No modern slang

Return as JSON array: ["line1", "line2", ...]`;

  const result = await aiService.chatCompletion(
    prompt,
    'You are a game writer. Write concise, engaging RPG dialogue. Return ONLY a JSON array.',
    {
      type: 'object',
      properties: {
        lines: {
          type: 'array',
          items: { type: 'string' },
          minItems: count,
          maxItems: count,
        },
      },
      required: ['lines'],
    }
  );

  return result.lines || [];
}

/**
 * Generate a map configuration
 * @param {string} description - Map/zone description
 * @param {object} options - Generation options
 * @returns {Promise<object>} Map configuration
 */
export async function generateMapConfig(description, options = {}) {
  const width = options.width || 15;
  const height = options.height || 15;
  const tileset = options.tileset || 'common';

  const systemPrompt = getSystemPrompt('map');
  
  const prompt = `Generate a zone map.json for: ${description}

Dimensions: ${width}x${height}
Tileset: ${tileset}

Return ONLY valid JSON with this structure:
{
  "bounds": [0, 0, ${width}, ${height}],
  "tileset": "${tileset}",
  "mode": "explore",
  "sprites": [
    {
      "id": "avatar",
      "type": "characters/hero",
      "pos": [${Math.floor(width/2)}, ${Math.floor(height/2)}, 0],
      "facing": "Down"
    }
  ],
  "lights": [],
  "scripts": []
}

Add appropriate NPCs, objects, and lights for: ${description}`;

  const result = await aiService.chatCompletion(
    prompt,
    systemPrompt,
    null,
    { temperature: 0.4 }
  );
  
  return result;
}

/**
 * Generate manifest.json for a game package
 * @param {object} assets - Object containing arrays of asset paths
 * @returns {object} Manifest configuration
 */
export function generateManifest(assets) {
  return {
    initialZones: assets.maps?.slice(0, 1) || ['start'],
    modes: assets.modes || ['explore'],
    maps: assets.maps || [],
    tilesets: assets.tilesets || ['common'],
    sprites: assets.sprites || [],
    objects: assets.objects || [],
    textures: assets.textures || [],
    fonts: [],
    audio: assets.audio || [],
    cutscenes: assets.cutscenes || [],
  };
}

export default {
  generateSpriteConfig,
  generateCutscene,
  generateScript,
  generateNPCStates,
  generateDialogueLines,
  generateMapConfig,
  generateManifest,
};
