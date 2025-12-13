/**
 * ---------------------------------------------------------------
 *                AI Generator - Prompt Analyzer
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Intelligent prompt parsing to understand user intent, extract
 * asset requirements, and determine which generators to invoke.
 */

/**
 * Asset types that can be generated
 */
export const ASSET_TYPES = {
  SPRITE: 'sprite',
  PORTRAIT: 'portrait',
  SPRITESHEET: 'spritesheet',
  TILESET: 'tileset',
  MAP: 'map',
  AUDIO: 'audio',
  MUSIC: 'music',
  SFX: 'sfx',
  SCRIPT: 'script',
  DIALOGUE: 'dialogue',
  CUTSCENE: 'cutscene',
  CONFIG: 'config',
  NPC: 'npc',
  CHARACTER: 'character',
  MONSTER: 'monster',
  ITEM: 'item',
  EFFECT: 'effect',
};

/**
 * Keywords associated with each asset type
 */
const ASSET_KEYWORDS = {
  [ASSET_TYPES.SPRITE]: ['sprite', 'character sprite', 'player sprite', 'enemy sprite', 'object sprite'],
  [ASSET_TYPES.PORTRAIT]: ['portrait', 'face', 'avatar', 'profile', 'headshot', 'bust'],
  [ASSET_TYPES.SPRITESHEET]: ['spritesheet', 'sprite sheet', 'animation sheet', 'walk cycle', 'animation frames'],
  [ASSET_TYPES.TILESET]: ['tileset', 'tile set', 'tiles', 'terrain tiles', 'floor tiles', 'wall tiles'],
  [ASSET_TYPES.MAP]: ['map', 'level', 'dungeon', 'world', 'area', 'zone', 'room'],
  [ASSET_TYPES.AUDIO]: ['audio', 'sound', 'voice'],
  [ASSET_TYPES.MUSIC]: ['music', 'soundtrack', 'bgm', 'background music', 'theme', 'melody'],
  [ASSET_TYPES.SFX]: ['sfx', 'sound effect', 'effect sound', 'footstep', 'explosion', 'click'],
  [ASSET_TYPES.SCRIPT]: ['script', 'code', 'behavior', 'callback', 'trigger', 'logic', 'function'],
  [ASSET_TYPES.DIALOGUE]: ['dialogue', 'conversation', 'speech', 'talk', 'chat', 'text'],
  [ASSET_TYPES.CUTSCENE]: ['cutscene', 'cinematic', 'scene', 'story', 'narrative'],
  [ASSET_TYPES.CONFIG]: ['config', 'configuration', 'settings', 'properties', 'json'],
  [ASSET_TYPES.NPC]: ['npc', 'non-player', 'shopkeeper', 'villager', 'merchant', 'guard'],
  [ASSET_TYPES.CHARACTER]: ['character', 'hero', 'protagonist', 'player', 'adventurer', 'warrior'],
  [ASSET_TYPES.MONSTER]: ['monster', 'enemy', 'creature', 'boss', 'mob', 'beast', 'demon'],
  [ASSET_TYPES.ITEM]: ['item', 'weapon', 'armor', 'potion', 'key', 'treasure', 'loot'],
  [ASSET_TYPES.EFFECT]: ['effect', 'particle', 'spell', 'magic', 'explosion', 'glow'],
};

/**
 * Sprite directions supported
 */
export const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/**
 * Default sprite configurations for different types
 */
export const SPRITE_PRESETS = {
  character: {
    sheetSize: [96, 384],
    tileSize: [24, 48],
    directions: 8,
    framesPerDirection: 4,
    includePortrait: true,
  },
  npc: {
    sheetSize: [128, 256],
    tileSize: [24, 32],
    directions: 4,
    framesPerDirection: 4,
    includePortrait: true,
  },
  monster: {
    sheetSize: [128, 128],
    tileSize: [32, 32],
    directions: 4,
    framesPerDirection: 4,
    includePortrait: false,
  },
  item: {
    sheetSize: [64, 64],
    tileSize: [16, 16],
    directions: 1,
    framesPerDirection: 4,
    includePortrait: false,
  },
  effect: {
    sheetSize: [128, 32],
    tileSize: [32, 32],
    directions: 1,
    framesPerDirection: 4,
    includePortrait: false,
  },
};

/**
 * Keywords that indicate a full game generation request
 */
const GAME_KEYWORDS = [
  'create a game', 'make a game', 'build a game', 'generate a game',
  'rpg where', 'rpg game', 'adventure game', 'puzzle game', 'action game',
  'game where', 'game with', 'full game', 'complete game', 'entire game',
  'playable game', 'game package', 'game project',
  // Complex multi-asset indicators
  'multiple npcs', 'several npcs', 'different dungeons', 'various locations',
  'intro cutscene', 'quest dialogues', 'boss fight', 'final boss',
  'collect crystals', 'collect items', 'save the', 'defeat the',
];

/**
 * Detect if prompt is asking for full game generation
 * @param {string} lowerPrompt - Lowercase prompt
 * @returns {boolean}
 */
function isGameGenerationRequest(lowerPrompt) {
  // Check for explicit game keywords
  for (const keyword of GAME_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      return true;
    }
  }

  // Heuristic: If prompt mentions 3+ different character types, it's likely a game
  const characterTypes = ['player', 'npc', 'enemy', 'boss', 'merchant', 'shopkeeper', 'mentor', 'villain', 'hero'];
  const mentionedTypes = characterTypes.filter(type => lowerPrompt.includes(type));
  if (mentionedTypes.length >= 3) {
    return true;
  }

  // Heuristic: If prompt mentions locations + characters + story elements
  const hasLocations = /\b(dungeon|town|forest|castle|cave|temple|village|world)\b/.test(lowerPrompt);
  const hasCharacters = /\b(character|npc|enemy|player|hero|protagonist)\b/.test(lowerPrompt);
  const hasStory = /\b(quest|mission|story|adventure|journey|cutscene|dialogue)\b/.test(lowerPrompt);

  if (hasLocations && hasCharacters && hasStory) {
    return true;
  }

  return false;
}

/**
 * Analyze a user prompt to extract generation requirements
 * @param {string} prompt - User's natural language prompt
 * @returns {object} Analysis result with detected assets and parameters
 */
export function analyzePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  const result = {
    originalPrompt: prompt,
    detectedAssets: [],
    spriteConfig: null,
    audioConfig: null,
    textConfig: null,
    metadata: {},
    generationPlan: [],
    isGameRequest: false, // NEW: Flag for full game generation
    suggestedModality: 'auto', // NEW: Suggested modality based on analysis
  };

  // FIRST: Check if this is a full game request
  if (isGameGenerationRequest(lowerPrompt)) {
    result.isGameRequest = true;
    result.suggestedModality = 'game';
    result.detectedAssets = ['Full Game Package'];
    // For game requests, we don't need detailed sprite/audio analysis
    // The game orchestrator handles everything
    result.metadata = extractMetadata(prompt);
    return result;
  }

  // Detect primary asset types
  const detectedTypes = new Set();

  for (const [type, keywords] of Object.entries(ASSET_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        detectedTypes.add(type);
        break;
      }
    }
  }

  result.detectedAssets = Array.from(detectedTypes);

  // Analyze for sprite-specific requirements
  if (hasSpriteLikeAsset(detectedTypes)) {
    result.spriteConfig = analyzeSpriteRequirements(lowerPrompt, detectedTypes);
  }

  // Analyze for audio requirements
  if (detectedTypes.has(ASSET_TYPES.AUDIO) || detectedTypes.has(ASSET_TYPES.MUSIC) || detectedTypes.has(ASSET_TYPES.SFX)) {
    result.audioConfig = analyzeAudioRequirements(lowerPrompt);
  }

  // Analyze for text/dialogue requirements
  if (detectedTypes.has(ASSET_TYPES.DIALOGUE) || detectedTypes.has(ASSET_TYPES.SCRIPT) ||
    detectedTypes.has(ASSET_TYPES.CUTSCENE) || detectedTypes.has(ASSET_TYPES.CONFIG)) {
    result.textConfig = analyzeTextRequirements(lowerPrompt, detectedTypes);
  }

  // Extract metadata (name, style, etc.)
  result.metadata = extractMetadata(prompt);

  // Build generation plan
  result.generationPlan = buildGenerationPlan(result);

  return result;
}

/**
 * Check if detected types include a sprite-like asset
 */
function hasSpriteLikeAsset(types) {
  return types.has(ASSET_TYPES.SPRITE) || types.has(ASSET_TYPES.CHARACTER) ||
    types.has(ASSET_TYPES.NPC) || types.has(ASSET_TYPES.MONSTER) ||
    types.has(ASSET_TYPES.ITEM) || types.has(ASSET_TYPES.EFFECT);
}

/**
 * Analyze sprite-specific requirements
 */
function analyzeSpriteRequirements(prompt, types) {
  // Determine sprite preset
  let preset = 'character';
  if (types.has(ASSET_TYPES.NPC)) preset = 'npc';
  else if (types.has(ASSET_TYPES.MONSTER)) preset = 'monster';
  else if (types.has(ASSET_TYPES.ITEM)) preset = 'item';
  else if (types.has(ASSET_TYPES.EFFECT)) preset = 'effect';

  const baseConfig = { ...SPRITE_PRESETS[preset] };
  const config = {
    ...baseConfig,
    preset,
    needsPortrait: false,
    needsSpritesheet: false,
    needsActions: false,
    needsLabels: false,
    needsHooks: false,
    actions: [],
    style: 'pixel art',
  };

  // Check for portrait
  if (prompt.includes('portrait') || prompt.includes('face') || prompt.includes('avatar')) {
    config.needsPortrait = true;
  }

  // Check for spritesheet specifics
  if (prompt.includes('spritesheet') || prompt.includes('animation') || prompt.includes('walk cycle')) {
    config.needsSpritesheet = true;
  }

  // Check for actions/states
  if (prompt.includes('action') || prompt.includes('attack') || prompt.includes('idle') || prompt.includes('walk')) {
    config.needsActions = true;
    config.actions = extractActions(prompt);
  }

  // Check for labels
  if (prompt.includes('label') || prompt.includes('name')) {
    config.needsLabels = true;
  }

  // Check for hooks/callbacks
  if (prompt.includes('hook') || prompt.includes('callback') || prompt.includes('trigger')) {
    config.needsHooks = true;
  }

  // Check for custom sizes
  const sizeMatch = prompt.match(/(\d+)\s*x\s*(\d+)/);
  if (sizeMatch) {
    const width = parseInt(sizeMatch[1]);
    const height = parseInt(sizeMatch[2]);
    if (width && height) {
      config.tileSize = [width, height];
    }
  }

  // Check for direction count
  if (prompt.includes('8 direction') || prompt.includes('eight direction') || prompt.includes('8-direction')) {
    config.directions = 8;
  } else if (prompt.includes('4 direction') || prompt.includes('four direction') || prompt.includes('4-direction')) {
    config.directions = 4;
  }

  // Check for frame count
  const frameMatch = prompt.match(/(\d+)\s*frame/i);
  if (frameMatch) {
    config.framesPerDirection = parseInt(frameMatch[1]);
  }

  // Check for art style
  if (prompt.includes('16-bit') || prompt.includes('16 bit')) config.style = '16-bit pixel art';
  else if (prompt.includes('8-bit') || prompt.includes('8 bit')) config.style = '8-bit pixel art';
  else if (prompt.includes('32-bit') || prompt.includes('32 bit')) config.style = '32-bit pixel art';
  else if (prompt.includes('retro')) config.style = 'retro pixel art';
  else if (prompt.includes('modern')) config.style = 'modern pixel art';

  // Calculate sheet size based on frames and directions
  const totalCols = config.framesPerDirection;
  const totalRows = config.directions;
  config.sheetSize = [
    totalCols * config.tileSize[0],
    totalRows * config.tileSize[1],
  ];

  return config;
}

/**
 * Extract action names from prompt
 */
function extractActions(prompt) {
  const actionKeywords = [
    'idle', 'walk', 'run', 'attack', 'hit', 'die', 'jump', 'fall',
    'cast', 'block', 'dodge', 'climb', 'swim', 'fly', 'crouch', 'talk',
  ];

  const found = actionKeywords.filter(action => prompt.includes(action));
  return found.length > 0 ? found : ['idle', 'walk'];
}

/**
 * Analyze audio requirements
 */
function analyzeAudioRequirements(prompt) {
  const config = {
    type: 'sfx',
    duration: 1,
    format: 'mp3',
    voice: 'alloy',
  };

  // Determine audio type
  if (prompt.includes('music') || prompt.includes('bgm') || prompt.includes('soundtrack')) {
    config.type = 'music';
    config.duration = 30;
  } else if (prompt.includes('voice') || prompt.includes('speech') || prompt.includes('narration')) {
    config.type = 'voice';
  }

  // Check for specific voice
  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  for (const voice of voices) {
    if (prompt.includes(voice)) {
      config.voice = voice;
      break;
    }
  }

  // Check for duration
  const durationMatch = prompt.match(/(\d+)\s*second/i);
  if (durationMatch) {
    config.duration = parseInt(durationMatch[1]);
  }

  return config;
}

/**
 * Analyze text generation requirements
 */
function analyzeTextRequirements(prompt, types) {
  const config = {
    type: 'dialogue',
    format: 'pxc',
    includeActions: false,
    includeVoice: false,
  };

  if (types.has(ASSET_TYPES.SCRIPT)) {
    config.type = 'script';
    config.format = 'pxs';
  } else if (types.has(ASSET_TYPES.CUTSCENE)) {
    config.type = 'cutscene';
    config.format = 'pxc';
    config.includeActions = true;
  } else if (types.has(ASSET_TYPES.CONFIG)) {
    config.type = 'config';
    config.format = 'json';
  }

  // Check for voice/audio inclusion
  if (prompt.includes('voice') || prompt.includes('audio')) {
    config.includeVoice = true;
  }

  return config;
}

/**
 * Extract metadata from prompt
 */
function extractMetadata(prompt) {
  const metadata = {
    name: null,
    style: null,
    theme: null,
    color: null,
  };

  // Try to extract name (look for patterns like "named X" or "called X")
  const namePatterns = [
    /named\s+["']?(\w+)["']?/i,
    /called\s+["']?(\w+)["']?/i,
    /name\s*:\s*["']?(\w+)["']?/i,
    /["'](\w+)["']\s+(?:sprite|character|npc)/i,
  ];

  for (const pattern of namePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      metadata.name = match[1];
      break;
    }
  }

  // Extract style keywords
  const styles = ['pixel', 'retro', 'modern', 'anime', 'cartoon', 'realistic', 'fantasy', 'sci-fi'];
  for (const style of styles) {
    if (prompt.toLowerCase().includes(style)) {
      metadata.style = style;
      break;
    }
  }

  // Extract theme
  const themes = ['medieval', 'futuristic', 'nature', 'urban', 'underwater', 'space', 'forest', 'desert', 'ice'];
  for (const theme of themes) {
    if (prompt.toLowerCase().includes(theme)) {
      metadata.theme = theme;
      break;
    }
  }

  // Extract color mentions
  const colorMatch = prompt.match(/\b(red|blue|green|yellow|purple|orange|pink|black|white|gold|silver|brown)\b/i);
  if (colorMatch) {
    metadata.color = colorMatch[1].toLowerCase();
  }

  return metadata;
}

/**
 * Build a generation plan based on analysis
 */
function buildGenerationPlan(analysis) {
  const plan = [];

  if (analysis.spriteConfig) {
    // Step 1: Generate sprite JSON config
    plan.push({
      step: 1,
      type: 'config',
      description: 'Generate sprite configuration JSON',
      output: 'sprite.json',
      dependencies: [],
    });

    // Step 2: Generate portrait if needed
    if (analysis.spriteConfig.needsPortrait || analysis.spriteConfig.includePortrait) {
      plan.push({
        step: 2,
        type: 'image',
        subtype: 'portrait',
        description: 'Generate character portrait',
        output: 'portrait.png',
        dependencies: [],
      });
    }

    // Step 3: Generate spritesheet
    plan.push({
      step: 3,
      type: 'image',
      subtype: 'spritesheet',
      description: 'Generate spritesheet with animation frames',
      output: 'spritesheet.png',
      dependencies: [],
    });

    // Step 4: Generate hooks/callbacks if needed
    if (analysis.spriteConfig.needsHooks) {
      plan.push({
        step: 4,
        type: 'script',
        description: 'Generate behavior scripts',
        output: 'callbacks/',
        dependencies: [1],
      });
    }
  }

  if (analysis.audioConfig) {
    plan.push({
      step: plan.length + 1,
      type: 'audio',
      subtype: analysis.audioConfig.type,
      description: `Generate ${analysis.audioConfig.type}`,
      output: `audio.${analysis.audioConfig.format}`,
      dependencies: [],
    });
  }

  if (analysis.textConfig) {
    plan.push({
      step: plan.length + 1,
      type: 'text',
      subtype: analysis.textConfig.type,
      description: `Generate ${analysis.textConfig.type}`,
      output: `content.${analysis.textConfig.format}`,
      dependencies: [],
    });
  }

  return plan;
}

export default {
  ASSET_TYPES,
  DIRECTIONS,
  SPRITE_PRESETS,
  analyzePrompt,
};
