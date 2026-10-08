/**
 * ---------------------------------------------------------------
 *                AI Generator - JSON Schemas
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Defines structured output schemas for AI-generated content.
 * These schemas ensure consistent, valid output from AI models.
 */

/**
 * Schema for sprite configuration JSON
 */
export const SPRITE_CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['sprite'],
      description: 'Asset type identifier',
    },
    src: {
      type: 'string',
      description: 'Path to spritesheet image file',
    },
    portraitSrc: {
      type: 'string',
      description: 'Path to portrait image file',
    },
    sheetSize: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2,
      description: 'Spritesheet dimensions [width, height]',
    },
    tileSize: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2,
      description: 'Individual tile dimensions [width, height]',
    },
    state: {
      type: 'string',
      description: 'Initial state name',
    },
    frames: {
      type: 'object',
      description: 'Frame coordinates for each direction',
      properties: {
        N: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        NE: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        E: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        SE: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        S: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        SW: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        W: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        NW: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
      },
    },
    drawOffset: {
      type: 'object',
      description: 'Draw offset for each direction [x, y, z]',
    },
    hotspotOffset: {
      type: 'array',
      items: { type: 'number' },
      minItems: 3,
      maxItems: 3,
      description: 'Hotspot offset [x, y, z]',
    },
    bindCamera: {
      type: 'boolean',
      description: 'Whether to bind camera to this sprite',
    },
    enableSpeech: {
      type: 'boolean',
      description: 'Whether sprite can have speech bubbles',
    },
  },
  required: ['type', 'src', 'sheetSize', 'tileSize', 'frames'],
  additionalProperties: true,
};

/**
 * Schema for NPC states configuration
 */
export const NPC_STATES_SCHEMA = {
  type: 'object',
  properties: {
    states: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'State name identifier',
          },
          next: {
            type: 'string',
            description: 'Next state to transition to',
          },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['dialogue', 'move', 'face', 'wait', 'callback', 'setFlag', 'checkFlag'],
                },
                dialogue: { type: 'string' },
                direction: { type: 'string' },
                callback: { type: 'string' },
                flag: { type: 'string' },
                value: { type: 'boolean' },
                duration: { type: 'number' },
              },
              required: ['type'],
            },
          },
        },
        required: ['name', 'actions'],
      },
    },
  },
  required: ['states'],
};

/**
 * Schema for cutscene structure
 */
export const CUTSCENE_SCHEMA = {
  type: 'object',
  properties: {
    backdrop: {
      type: 'string',
      description: 'Background image path or data reference',
    },
    characters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          sprite: { type: 'string' },
          position: { type: 'string', enum: ['left', 'center', 'right'] },
        },
        required: ['name', 'sprite'],
      },
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['dialogue', 'action', 'transition', 'waitInput', 'backdrop', 'sound'],
          },
          character: { type: 'string' },
          text: { type: 'string' },
          expression: { type: 'string' },
          action: { type: 'string' },
          params: { type: 'object' },
        },
        required: ['type'],
      },
    },
  },
  required: ['events'],
};

/**
 * Schema for script callbacks
 */
export const SCRIPT_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Script identifier',
    },
    trigger: {
      type: 'string',
      enum: ['interaction', 'collision', 'timer', 'event', 'callback'],
    },
    code: {
      type: 'string',
      description: 'Script code content',
    },
    parameters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          default: {},
        },
      },
    },
  },
  required: ['code'],
};

/**
 * Schema for tileset configuration
 */
export const TILESET_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Tileset name',
    },
    src: {
      type: 'string',
      description: 'Path to tileset image',
    },
    tileSize: {
      type: 'number',
      description: 'Size of each tile in pixels',
    },
    columns: {
      type: 'number',
      description: 'Number of columns in tileset',
    },
    tiles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          type: { type: 'string', enum: ['floor', 'wall', 'decoration', 'obstacle', 'water'] },
          walkable: { type: 'boolean' },
          animated: { type: 'boolean' },
          frames: { type: 'array', items: { type: 'number' } },
        },
      },
    },
  },
  required: ['src', 'tileSize'],
};

/**
 * Schema for map configuration
 */
export const MAP_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    width: {
      type: 'number',
    },
    height: {
      type: 'number',
    },
    tileSize: {
      type: 'number',
    },
    tileset: {
      type: 'string',
      description: 'Path to tileset',
    },
    layers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          data: {
            type: 'array',
            items: { type: 'array', items: { type: 'number' } },
          },
          visible: { type: 'boolean' },
        },
      },
    },
    objects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          properties: { type: 'object' },
        },
      },
    },
  },
  required: ['width', 'height', 'layers'],
};

/**
 * Schema for audio asset configuration
 */
export const AUDIO_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    src: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['music', 'sfx', 'voice', 'ambient'],
    },
    loop: {
      type: 'boolean',
    },
    volume: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    category: {
      type: 'string',
    },
  },
  required: ['src', 'type'],
};

/**
 * Schema for dialogue lines generation
 */
export const DIALOGUE_LINES_SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['lines'],
};

/**
 * Schema for generation plan
 */
export const GENERATION_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    assets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['sprite', 'portrait', 'spritesheet', 'audio', 'script', 'config', 'cutscene'],
          },
          name: { type: 'string' },
          path: { type: 'string' },
          dependencies: {
            type: 'array',
            items: { type: 'string' },
          },
          config: { type: 'object' },
        },
        required: ['type', 'name', 'path'],
      },
    },
    order: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['assets', 'order'],
};

export default {
  SPRITE_CONFIG_SCHEMA,
  NPC_STATES_SCHEMA,
  CUTSCENE_SCHEMA,
  SCRIPT_SCHEMA,
  TILESET_SCHEMA,
  MAP_SCHEMA,
  AUDIO_SCHEMA,
  DIALOGUE_LINES_SCHEMA,
  GENERATION_PLAN_SCHEMA,
};
