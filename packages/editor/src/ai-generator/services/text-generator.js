/**
 * ---------------------------------------------------------------
 *                AI Generator - Text Generator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Handles generation of text content including scripts (.pxs),
 * cutscenes/dialogues (.pxc), and configuration files (.json).
 */

import aiService from './ai-service.js';
import { SPRITE_CONFIG_SCHEMA, NPC_STATES_SCHEMA } from './schemas.js';

/**
 * System prompts for different content types
 */
const SYSTEM_PROMPTS = {
  sprite: `You are an expert game asset designer. Generate JSON configurations for game sprites following the exact schema provided. Include proper frame coordinates, directions, and animation states. Use pixel-perfect coordinates.`,
  
  cutscene: `You are a game narrative designer. Generate cutscene scripts in the Pixospritz cutscene format (.pxc). Use the format:
@backdrop [image] - Set background
@char [NAME] sprite=[spritePath] - Define character
@action [NAME] [action] - Character actions
[NAME]: [expression=X] Dialogue text - Character dialogue
*[NAME]: [cutin=size=large] Dialogue - Emphasized dialogue with character cut-in
waitInput - Wait for player input
@transition [type] [duration=X] - Scene transitions
@end - End the cutscene`,

  script: `You are a game programmer. Generate Pixospritz script files (.pxs) for game callbacks and behaviors. The script format is Lua-like with these special functions:
- print(text) - Log output
- sprite:say(text) - Make sprite speak
- sprite:move(dir, steps) - Move sprite
- sprite:face(dir) - Face direction
- sprite:wait(ms) - Wait milliseconds
- world:playSound(name) - Play sound effect
- world:trigger(event) - Trigger event`,

  config: `You are a game configuration expert. Generate clean, valid JSON configuration files for game assets. Follow the schema exactly and use sensible default values.`,
  
  dialogue: `You are a game writer. Create engaging dialogue for game characters. Keep responses concise but meaningful. Consider character personality and context.`,
};

/**
 * Generate a sprite configuration JSON
 * @param {string} description - Sprite description
 * @param {object} spriteConfig - Sprite parameters from analyzer
 * @returns {Promise<object>} Sprite configuration object
 */
export async function generateSpriteConfig(description, spriteConfig) {
  const { tileSize, sheetSize, directions, framesPerDirection, preset } = spriteConfig;
  
  const prompt = `Generate a sprite JSON configuration for: ${description}

Requirements:
- Type: ${preset || 'character'} sprite
- Tile size: ${tileSize[0]}x${tileSize[1]} pixels
- Sheet size: ${sheetSize[0]}x${sheetSize[1]} pixels
- Directions: ${directions} (${directions === 8 ? 'N, NE, E, SE, S, SW, W, NW' : 'N, E, S, W'})
- Frames per direction: ${framesPerDirection}
- Include portrait: ${spriteConfig.needsPortrait || spriteConfig.includePortrait}
- Generate realistic frame coordinates based on tile size and direction layout

The spritesheet layout should be:
- Each row is a direction
- Each column is an animation frame
- Coordinates are [x, y] from top-left of sheet`;

  const config = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.sprite,
    SPRITE_CONFIG_SCHEMA
  );

  return config;
}

/**
 * Generate a cutscene script
 * @param {string} description - Scene description
 * @param {object} options - Generation options
 * @returns {Promise<string>} Cutscene script content
 */
export async function generateCutscene(description, options = {}) {
  const characters = options.characters || [];
  const mood = options.mood || 'neutral';
  const length = options.length || 'medium';

  const charList = characters.length > 0 
    ? `Characters involved: ${characters.join(', ')}`
    : 'Create appropriate characters for the scene';

  const lengthGuide = {
    short: '3-5 dialogue exchanges',
    medium: '6-10 dialogue exchanges',
    long: '10-15 dialogue exchanges',
  };

  const prompt = `Create a cutscene script for: ${description}

${charList}
Mood/tone: ${mood}
Length: ${lengthGuide[length] || lengthGuide.medium}

Include:
- A backdrop setting
- Character definitions with sprites
- Natural dialogue with expressions
- At least one character action or movement
- Appropriate transitions
- End marker

Make the dialogue feel natural and engaging.`;

  const result = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.cutscene,
    null, // Don't use structured output for cutscenes
    { temperature: 0.8 }
  );

  return result;
}

/**
 * Generate a behavior script
 * @param {string} description - Script description/purpose
 * @param {string} triggerType - Type of trigger (callback, trigger, etc.)
 * @param {object} options - Generation options
 * @returns {Promise<string>} Script content
 */
export async function generateScript(description, triggerType = 'callback', options = {}) {
  const context = options.context || '';
  const sprite = options.spriteName || 'sprite';

  const triggerExamples = {
    callback: `-- Callback script for ${sprite}
-- Triggered when ${description}`,
    trigger: `-- Trigger script
-- Activates when player enters trigger zone`,
    interaction: `-- Interaction script for ${sprite}
-- Triggered when player interacts with this object`,
    quest: `-- Quest callback
-- Handles quest state updates`,
  };

  const prompt = `Generate a game script for: ${description}

Script type: ${triggerType}
${context ? `Context: ${context}` : ''}
Sprite/Object name: ${sprite}

${triggerExamples[triggerType] || triggerExamples.callback}

The script should:
- Be concise and functional
- Use proper Pixospritz script syntax
- Include comments explaining the logic
- Handle edge cases appropriately`;

  const result = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.script,
    null,
    { temperature: 0.5 }
  );

  return result;
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

  const prompt = `Generate NPC state machine configuration for: ${description}

Role: ${role}
Personality: ${personality}
Interactions: ${interactions.join(', ')}

Create states for:
- An intro state (first meeting)
- A loop/idle state (repeated interactions)
- Any relevant quest or shop states based on the role
- Include appropriate dialogue and actions for each state`;

  const states = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.config,
    NPC_STATES_SCHEMA
  );

  return states;
}

/**
 * Generate dialogue lines for a character
 * @param {string} characterDescription - Character description
 * @param {string} situation - Current situation/context
 * @param {number} count - Number of lines to generate
 * @returns {Promise<string[]>} Array of dialogue lines
 */
export async function generateDialogueLines(characterDescription, situation, count = 5) {
  const prompt = `Generate ${count} dialogue lines for this character: ${characterDescription}

Situation: ${situation}

Requirements:
- Each line should be unique
- Lines should feel natural and in-character
- Mix of short and medium length
- Appropriate for an RPG game context`;

  const result = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.dialogue,
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
 * Generate a complete configuration file
 * @param {string} assetType - Type of asset (sprite, tileset, map, etc.)
 * @param {string} description - Asset description
 * @param {object} template - Base template to extend
 * @returns {Promise<object>} Configuration object
 */
export async function generateConfig(assetType, description, template = {}) {
  const templateStr = Object.keys(template).length > 0 
    ? `Base template to extend:\n${JSON.stringify(template, null, 2)}`
    : '';

  const prompt = `Generate a complete ${assetType} configuration for: ${description}

${templateStr}

Ensure all required fields are present and values are sensible for a game asset.`;

  const result = await aiService.chatCompletion(
    prompt,
    SYSTEM_PROMPTS.config,
    null,
    { temperature: 0.3 }
  );

  // Try to parse if string
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
                        result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch {
      // Return as-is if parsing fails
    }
  }

  return result;
}

/**
 * Enhance/improve existing content
 * @param {string} content - Existing content
 * @param {string} contentType - Type of content (script, dialogue, config)
 * @param {string} instructions - Enhancement instructions
 * @returns {Promise<string>} Enhanced content
 */
export async function enhanceContent(content, contentType, instructions) {
  const prompt = `Improve this ${contentType}:

---
${content}
---

Instructions: ${instructions}

Provide the enhanced version only, without explanations.`;

  const systemPrompt = SYSTEM_PROMPTS[contentType] || SYSTEM_PROMPTS.config;

  const result = await aiService.chatCompletion(
    prompt,
    systemPrompt,
    null,
    { temperature: 0.6 }
  );

  return result;
}

export default {
  generateSpriteConfig,
  generateCutscene,
  generateScript,
  generateNPCStates,
  generateDialogueLines,
  generateConfig,
  enhanceContent,
};
