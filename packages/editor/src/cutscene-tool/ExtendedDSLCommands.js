/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Extended DSL Commands
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Extended SpritzCut DSL commands for cutscenes. Adds:
 * - Camera commands (pan, zoom, shake)
 * - Screen effects (fade, pixelate)
 * - Text display commands
 * - Sprite manipulation
 * - Conditions (if/else/endif)
 * - Timing controls
 */

/**
 * Extended DSL command definitions
 * Each command has: syntax, parameters, description, and parser
 */
export const EXTENDED_COMMANDS = {
  // ===== CAMERA COMMANDS =====
  cameraPan: {
    syntax: '@camera pan [x=<num>,y=<num>,duration=<ms>]',
    description: 'Pan camera to position over duration',
    category: 'camera',
    icon: '🎥',
    params: {
      x: { type: 'number', default: 0, description: 'Target X position' },
      y: { type: 'number', default: 0, description: 'Target Y position' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
    },
    generate: params => `@camera pan [x=${params.x},y=${params.y},duration=${params.duration}]`,
  },

  cameraZoom: {
    syntax: '@camera zoom [factor=<num>,duration=<ms>]',
    description: 'Zoom camera by factor over duration',
    category: 'camera',
    icon: '🔍',
    params: {
      factor: { type: 'number', default: 1.5, description: 'Zoom factor (1 = normal)' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
    },
    generate: params => `@camera zoom [factor=${params.factor},duration=${params.duration}]`,
  },

  cameraShake: {
    syntax: '@camera shake [intensity=<num>,duration=<ms>]',
    description: 'Shake camera with intensity',
    category: 'camera',
    icon: '📳',
    params: {
      intensity: { type: 'number', default: 5, description: 'Shake intensity (pixels)' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
    },
    generate: params => `@camera shake [intensity=${params.intensity},duration=${params.duration}]`,
  },

  cameraReset: {
    syntax: '@camera reset [duration=<ms>]',
    description: 'Reset camera to default position and zoom',
    category: 'camera',
    icon: '🔄',
    params: {
      duration: { type: 'number', default: 300, description: 'Duration in ms' },
    },
    generate: params => `@camera reset [duration=${params.duration}]`,
  },

  // ===== SCREEN EFFECTS =====
  fadeIn: {
    syntax: '@effect fadeIn [duration=<ms>,color=<hex>]',
    description: 'Fade in from color',
    category: 'effects',
    icon: '🌅',
    params: {
      duration: { type: 'number', default: 500, description: 'Fade duration in ms' },
      color: { type: 'color', default: '#000000', description: 'Fade color' },
    },
    generate: params => `@effect fadeIn [duration=${params.duration},color=${params.color}]`,
  },

  fadeOut: {
    syntax: '@effect fadeOut [duration=<ms>,color=<hex>]',
    description: 'Fade out to color',
    category: 'effects',
    icon: '🌆',
    params: {
      duration: { type: 'number', default: 500, description: 'Fade duration in ms' },
      color: { type: 'color', default: '#000000', description: 'Fade color' },
    },
    generate: params => `@effect fadeOut [duration=${params.duration},color=${params.color}]`,
  },

  pixelate: {
    syntax: '@effect pixelate [factor=<num>,duration=<ms>]',
    description: 'Apply pixelation effect',
    category: 'effects',
    icon: '🔳',
    params: {
      factor: { type: 'number', default: 8, description: 'Pixel size factor' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
    },
    generate: params => `@effect pixelate [factor=${params.factor},duration=${params.duration}]`,
  },

  flash: {
    syntax: '@effect flash [color=<hex>,duration=<ms>]',
    description: 'Flash screen with color',
    category: 'effects',
    icon: '⚡',
    params: {
      color: { type: 'color', default: '#ffffff', description: 'Flash color' },
      duration: { type: 'number', default: 100, description: 'Flash duration in ms' },
    },
    generate: params => `@effect flash [color=${params.color},duration=${params.duration}]`,
  },

  blur: {
    syntax: '@effect blur [amount=<num>,duration=<ms>]',
    description: 'Apply blur effect',
    category: 'effects',
    icon: '🌫️',
    params: {
      amount: { type: 'number', default: 5, description: 'Blur amount (pixels)' },
      duration: { type: 'number', default: 300, description: 'Duration in ms' },
    },
    generate: params => `@effect blur [amount=${params.amount},duration=${params.duration}]`,
  },

  vignette: {
    syntax: '@effect vignette [intensity=<num>,duration=<ms>]',
    description: 'Apply vignette effect',
    category: 'effects',
    icon: '⭕',
    params: {
      intensity: { type: 'number', default: 0.5, description: 'Vignette intensity (0-1)' },
      duration: { type: 'number', default: 300, description: 'Duration in ms' },
    },
    generate: params =>
      `@effect vignette [intensity=${params.intensity},duration=${params.duration}]`,
  },

  clearEffects: {
    syntax: '@effect clear [duration=<ms>]',
    description: 'Clear all screen effects',
    category: 'effects',
    icon: '🧹',
    params: {
      duration: { type: 'number', default: 300, description: 'Transition duration' },
    },
    generate: params => `@effect clear [duration=${params.duration}]`,
  },

  // ===== TEXT DISPLAY =====
  showText: {
    syntax: '@text show [text="<string>",x=<num>,y=<num>,duration=<ms>,style=<style>]',
    description: 'Display text on screen',
    category: 'text',
    icon: '📝',
    params: {
      text: { type: 'string', default: 'Text', description: 'Text to display' },
      x: { type: 'number', default: 50, description: 'X position (%)' },
      y: { type: 'number', default: 50, description: 'Y position (%)' },
      duration: { type: 'number', default: 2000, description: 'Display duration in ms' },
      style: {
        type: 'select',
        options: ['normal', 'title', 'subtitle', 'caption'],
        default: 'normal',
      },
    },
    generate: params =>
      `@text show [text="${params.text}",x=${params.x},y=${params.y},duration=${params.duration},style=${params.style}]`,
  },

  typewriter: {
    syntax: '@text typewriter [text="<string>",speed=<ms>]',
    description: 'Display text with typewriter effect',
    category: 'text',
    icon: '⌨️',
    params: {
      text: { type: 'string', default: 'Text', description: 'Text to display' },
      speed: { type: 'number', default: 50, description: 'Delay per character (ms)' },
    },
    generate: params => `@text typewriter [text="${params.text}",speed=${params.speed}]`,
  },

  clearText: {
    syntax: '@text clear',
    description: 'Clear all displayed text',
    category: 'text',
    icon: '🗑️',
    params: {},
    generate: () => '@text clear',
  },

  // ===== SPRITE MANIPULATION =====
  spriteMove: {
    syntax: '@sprite <id> move [x=<num>,y=<num>,duration=<ms>,easing=<type>]',
    description: 'Move sprite to position',
    category: 'sprites',
    icon: '🏃',
    params: {
      id: { type: 'string', default: 'sprite1', description: 'Sprite ID' },
      x: { type: 'number', default: 0, description: 'Target X position' },
      y: { type: 'number', default: 0, description: 'Target Y position' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
      easing: {
        type: 'select',
        options: ['linear', 'easeIn', 'easeOut', 'easeInOut'],
        default: 'easeInOut',
      },
    },
    generate: params =>
      `@sprite ${params.id} move [x=${params.x},y=${params.y},duration=${params.duration},easing=${params.easing}]`,
  },

  spriteFade: {
    syntax: '@sprite <id> fade [alpha=<num>,duration=<ms>]',
    description: 'Fade sprite to alpha',
    category: 'sprites',
    icon: '👻',
    params: {
      id: { type: 'string', default: 'sprite1', description: 'Sprite ID' },
      alpha: { type: 'number', default: 0, description: 'Target alpha (0-1)' },
      duration: { type: 'number', default: 300, description: 'Duration in ms' },
    },
    generate: params =>
      `@sprite ${params.id} fade [alpha=${params.alpha},duration=${params.duration}]`,
  },

  spriteScale: {
    syntax: '@sprite <id> scale [factor=<num>,duration=<ms>]',
    description: 'Scale sprite by factor',
    category: 'sprites',
    icon: '📐',
    params: {
      id: { type: 'string', default: 'sprite1', description: 'Sprite ID' },
      factor: { type: 'number', default: 1.5, description: 'Scale factor' },
      duration: { type: 'number', default: 300, description: 'Duration in ms' },
    },
    generate: params =>
      `@sprite ${params.id} scale [factor=${params.factor},duration=${params.duration}]`,
  },

  spriteRotate: {
    syntax: '@sprite <id> rotate [angle=<num>,duration=<ms>]',
    description: 'Rotate sprite by angle',
    category: 'sprites',
    icon: '🔄',
    params: {
      id: { type: 'string', default: 'sprite1', description: 'Sprite ID' },
      angle: { type: 'number', default: 360, description: 'Rotation angle (degrees)' },
      duration: { type: 'number', default: 500, description: 'Duration in ms' },
    },
    generate: params =>
      `@sprite ${params.id} rotate [angle=${params.angle},duration=${params.duration}]`,
  },

  spriteAnimate: {
    syntax: '@sprite <id> animate [animation=<name>,loop=<bool>]',
    description: 'Play sprite animation',
    category: 'sprites',
    icon: '🎬',
    params: {
      id: { type: 'string', default: 'sprite1', description: 'Sprite ID' },
      animation: { type: 'string', default: 'idle', description: 'Animation name' },
      loop: { type: 'boolean', default: true, description: 'Loop animation' },
    },
    generate: params =>
      `@sprite ${params.id} animate [animation=${params.animation},loop=${params.loop}]`,
  },

  // ===== CONDITIONS =====
  ifCondition: {
    syntax: '@if <variable> <operator> <value>',
    description: 'Start conditional block',
    category: 'conditions',
    icon: '❓',
    params: {
      variable: { type: 'string', default: 'flag', description: 'Variable name' },
      operator: { type: 'select', options: ['==', '!=', '>', '<', '>=', '<='], default: '==' },
      value: { type: 'string', default: 'true', description: 'Value to compare' },
    },
    generate: params => `@if ${params.variable} ${params.operator} ${params.value}`,
  },

  elseCondition: {
    syntax: '@else',
    description: 'Else branch of condition',
    category: 'conditions',
    icon: '↔️',
    params: {},
    generate: () => '@else',
  },

  endifCondition: {
    syntax: '@endif',
    description: 'End conditional block',
    category: 'conditions',
    icon: '🔚',
    params: {},
    generate: () => '@endif',
  },

  setVariable: {
    syntax: '@set <variable> = <value>',
    description: 'Set a variable value',
    category: 'conditions',
    icon: '📦',
    params: {
      variable: { type: 'string', default: 'flag', description: 'Variable name' },
      value: { type: 'string', default: 'true', description: 'Value to set' },
    },
    generate: params => `@set ${params.variable} = ${params.value}`,
  },

  // ===== TIMING CONTROLS =====
  wait: {
    syntax: 'wait <duration>',
    description: 'Wait for specified duration',
    category: 'timing',
    icon: '⏱️',
    params: {
      duration: { type: 'number', default: 1000, description: 'Wait duration in ms' },
    },
    generate: params => `wait ${params.duration}`,
  },

  waitInput: {
    syntax: 'waitInput',
    description: 'Wait for user input',
    category: 'timing',
    icon: '⌨️',
    params: {},
    generate: () => 'waitInput',
  },

  sync: {
    syntax: '@sync',
    description: 'Wait for all animations to complete',
    category: 'timing',
    icon: '🔄',
    params: {},
    generate: () => '@sync',
  },

  parallel: {
    syntax: '@parallel',
    description: 'Run following commands in parallel until @endparallel',
    category: 'timing',
    icon: '⚡',
    params: {},
    generate: () => '@parallel',
  },

  endParallel: {
    syntax: '@endparallel',
    description: 'End parallel block',
    category: 'timing',
    icon: '🔚',
    params: {},
    generate: () => '@endparallel',
  },

  // ===== CHOICE SYSTEM =====
  choice: {
    syntax: '@choice',
    description: 'Start a choice menu',
    category: 'dialogue',
    icon: '🔀',
    params: {},
    generate: () => '@choice',
  },

  option: {
    syntax: '- <text> -> <label>',
    description: 'Choice option with jump target',
    category: 'dialogue',
    icon: '➡️',
    params: {
      text: { type: 'string', default: 'Option', description: 'Option text' },
      label: { type: 'string', default: 'target', description: 'Jump target label' },
    },
    generate: params => `- ${params.text} -> ${params.label}`,
  },

  endChoice: {
    syntax: '@endchoice',
    description: 'End choice menu',
    category: 'dialogue',
    icon: '🔚',
    params: {},
    generate: () => '@endchoice',
  },

  label: {
    syntax: '::<label>',
    description: 'Define a jump label',
    category: 'dialogue',
    icon: '🏷️',
    params: {
      label: { type: 'string', default: 'label', description: 'Label name' },
    },
    generate: params => `::${params.label}`,
  },

  jump: {
    syntax: '@jump <label>',
    description: 'Jump to label',
    category: 'dialogue',
    icon: '⤵️',
    params: {
      label: { type: 'string', default: 'label', description: 'Target label' },
    },
    generate: params => `@jump ${params.label}`,
  },
};

/**
 * Get commands by category
 */
export function getCommandsByCategory() {
  const categories = {};
  for (const [key, cmd] of Object.entries(EXTENDED_COMMANDS)) {
    const cat = cmd.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ key, ...cmd });
  }
  return categories;
}

/**
 * Parse extended DSL command from text
 * @param {string} line - DSL line to parse
 * @returns {Object|null} Parsed command or null
 */
export function parseExtendedCommand(line) {
  const trimmed = line.trim();

  // Camera commands
  const cameraMatch = trimmed.match(/^@camera\s+(pan|zoom|shake|reset)\s*\[(.*?)\]?$/);
  if (cameraMatch) {
    const [, action, paramsStr] = cameraMatch;
    const params = parseParams(paramsStr);
    return { type: `camera${capitalize(action)}`, params };
  }

  // Effect commands
  const effectMatch = trimmed.match(/^@effect\s+(\w+)\s*\[(.*?)\]?$/);
  if (effectMatch) {
    const [, effect, paramsStr] = effectMatch;
    const params = parseParams(paramsStr);
    return { type: effect, params };
  }

  // Text commands
  const textMatch = trimmed.match(/^@text\s+(\w+)\s*\[(.*?)\]?$/);
  if (textMatch) {
    const [, action, paramsStr] = textMatch;
    const params = parseParams(paramsStr);
    return { type: action === 'show' ? 'showText' : action, params };
  }

  // Sprite commands
  const spriteMatch = trimmed.match(/^@sprite\s+(\w+)\s+(\w+)\s*\[(.*?)\]?$/);
  if (spriteMatch) {
    const [, id, action, paramsStr] = spriteMatch;
    const params = { id, ...parseParams(paramsStr) };
    return { type: `sprite${capitalize(action)}`, params };
  }

  // Condition commands
  if (trimmed.startsWith('@if ')) {
    const match = trimmed.match(/^@if\s+(\w+)\s*(==|!=|>|<|>=|<=)\s*(.+)$/);
    if (match) {
      return {
        type: 'ifCondition',
        params: { variable: match[1], operator: match[2], value: match[3] },
      };
    }
  }

  if (trimmed === '@else') return { type: 'elseCondition', params: {} };
  if (trimmed === '@endif') return { type: 'endifCondition', params: {} };
  if (trimmed === '@sync') return { type: 'sync', params: {} };
  if (trimmed === '@parallel') return { type: 'parallel', params: {} };
  if (trimmed === '@endparallel') return { type: 'endParallel', params: {} };
  if (trimmed === '@choice') return { type: 'choice', params: {} };
  if (trimmed === '@endchoice') return { type: 'endChoice', params: {} };
  if (trimmed === 'waitInput') return { type: 'waitInput', params: {} };

  // Wait command
  const waitMatch = trimmed.match(/^wait\s+(\d+)$/);
  if (waitMatch) {
    return { type: 'wait', params: { duration: parseInt(waitMatch[1], 10) } };
  }

  // Set variable
  const setMatch = trimmed.match(/^@set\s+(\w+)\s*=\s*(.+)$/);
  if (setMatch) {
    return { type: 'setVariable', params: { variable: setMatch[1], value: setMatch[2] } };
  }

  // Jump
  const jumpMatch = trimmed.match(/^@jump\s+(\w+)$/);
  if (jumpMatch) {
    return { type: 'jump', params: { label: jumpMatch[1] } };
  }

  // Label
  const labelMatch = trimmed.match(/^::(\w+)$/);
  if (labelMatch) {
    return { type: 'label', params: { label: labelMatch[1] } };
  }

  // Choice option
  const optionMatch = trimmed.match(/^-\s+(.+?)\s*->\s*(\w+)$/);
  if (optionMatch) {
    return { type: 'option', params: { text: optionMatch[1], label: optionMatch[2] } };
  }

  return null;
}

// Helper: Parse bracket params
function parseParams(str) {
  const params = {};
  if (!str) return params;

  const regex = /(\w+)=(["']?)([^,\]"']+)\2/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    let value = match[3];
    // Try to parse as number
    if (/^\d+(\.\d+)?$/.test(value)) {
      value = parseFloat(value);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    params[match[1]] = value;
  }
  return params;
}

// Helper: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default EXTENDED_COMMANDS;
