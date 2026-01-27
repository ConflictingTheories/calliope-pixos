/*
 * ---------------------------------------------------------------
 *        PixoSpritz – Editor – PixoScript Language Definition
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Monaco Editor language definition for PixoScript (.pxs files).
 * PixoScript is a Lua-based scripting language with extensions
 * for the PixoSpritz game engine.
 */

/**
 * PixoScript API documentation for autocompletion
 */
export const PIXOS_API = {
  // Zone Management
  'pixos.load_zone': {
    signature: 'load_zone(zone_name: string)',
    description: 'Loads a zone from the package and transitions to it.',
    params: ['zone_name: Path to zone JSON file (e.g., "maps/village.json")'],
    returns: 'Promise that resolves when zone is loaded',
    example: 'pixos.sync({ pixos.load_zone_from_zip("maps/cave.json", zip) })',
    category: 'Zone',
  },
  'pixos.load_zone_from_zip': {
    signature: 'load_zone_from_zip(zone_name: string, zip: ZipObject)',
    description: 'Loads a zone from a specific zip package.',
    params: ['zone_name: Path to zone JSON', 'zip: Zip archive reference'],
    returns: 'Promise that resolves when zone is loaded',
    category: 'Zone',
  },
  'pixos.get_zone': {
    signature: 'get_zone()',
    description: 'Returns the current active zone object.',
    returns: 'Zone object',
    category: 'Zone',
  },
  'pixos.get_world': {
    signature: 'get_world()',
    description: 'Returns the world object containing all zones.',
    returns: 'World object',
    category: 'Zone',
  },

  // Flag/State Management
  'pixos.set_flag': {
    signature: 'set_flag(key: string, value: any)',
    description: 'Sets a persistent game flag. Flags are saved with game state.',
    params: ['key: Flag identifier', 'value: Any serializable value'],
    example: 'pixos.set_flag("quest_complete", true)',
    category: 'Flags',
  },
  'pixos.get_flag': {
    signature: 'get_flag(key: string)',
    description: 'Gets the value of a game flag.',
    params: ['key: Flag identifier'],
    returns: 'Flag value or nil if not set',
    example: 'local completed = pixos.get_flag("quest_complete")',
    category: 'Flags',
  },
  'pixos.has_flag': {
    signature: 'has_flag(key: string)',
    description: 'Checks if a flag exists.',
    params: ['key: Flag identifier'],
    returns: 'true if flag exists, false otherwise',
    category: 'Flags',
  },
  'pixos.add_flag': {
    signature: 'add_flag(key: string, value: any)',
    description: 'Adds a new flag (convenience wrapper for set_flag).',
    params: ['key: Flag identifier', 'value: Any serializable value'],
    category: 'Flags',
  },
  'pixos.all_flags': {
    signature: 'all_flags()',
    description: 'Returns all game flags as a table.',
    returns: 'Table of all flags',
    category: 'Flags',
  },

  // Cutscene System
  'pixos.play_cutscene': {
    signature: 'play_cutscene(name: string)',
    description: 'Plays a registered cutscene or .pxc file.',
    params: ['name: Cutscene name or path to .pxc file'],
    example: 'pixos.sync({ pixos.play_cutscene("intro") })',
    category: 'Cutscene',
  },
  'pixos.play_pxc_cutscene': {
    signature: 'play_pxc_cutscene(path: string, options?: table)',
    description: 'Loads and plays a .pxc cutscene file.',
    params: ['path: Path to .pxc file', 'options: Optional callbacks (onDialogueShow, onEnd)'],
    example: 'pixos.sync({ pixos.play_pxc_cutscene("cutscenes/intro.pxc") })',
    category: 'Cutscene',
  },
  'pixos.play_pxc_script': {
    signature: 'play_pxc_script(script: string, options?: table)',
    description: 'Plays inline .pxc cutscene script.',
    params: ['script: Raw .pxc script text', 'options: Optional callbacks'],
    category: 'Cutscene',
  },
  'pixos.register_cutscene': {
    signature: 'register_cutscene(name: string, steps: table)',
    description: 'Registers a cutscene with step-based definitions.',
    params: ['name: Unique cutscene identifier', 'steps: Array of step tables'],
    category: 'Cutscene',
  },
  'pixos.start_cutscene': {
    signature: 'start_cutscene(name: string)',
    description: 'Starts a pre-registered cutscene immediately.',
    params: ['name: Cutscene name'],
    category: 'Cutscene',
  },
  'pixos.run_cutscene': {
    signature: 'run_cutscene(steps: table)',
    description: 'Runs an ad-hoc cutscene from a step table.',
    params: ['steps: Array of step definitions'],
    example: `pixos.sync({ pixos.run_cutscene({
  { type = 'transition', effect = 'fade', direction = 'out', duration = 500 },
  { type = 'load_zone', zone = 'cave' },
  { type = 'transition', effect = 'fade', direction = 'in', duration = 500 }
}) })`,
    category: 'Cutscene',
  },
  'pixos.skip_cutscene': {
    signature: 'skip_cutscene()',
    description: 'Skips the currently playing cutscene.',
    category: 'Cutscene',
  },

  // Dialogue
  'pixos.sprite_dialogue': {
    signature: 'sprite_dialogue(sprite_id: string, text: string, options?: table)',
    description: 'Shows a dialogue bubble above a sprite.',
    params: [
      'sprite_id: Sprite identifier',
      'text: Dialogue text',
      'options: {duration, style, onClose}',
    ],
    example: 'pixos.sync({ pixos.sprite_dialogue("npc_elder", "Welcome, traveler!") })',
    category: 'Dialogue',
  },

  // Sprite Control
  'pixos.move_sprite': {
    signature: 'move_sprite(sprite_id: string, location: table, running?: boolean)',
    description: 'Moves a sprite to a location.',
    params: [
      'sprite_id: Sprite identifier',
      'location: {x, y} or {row, col}',
      'running: Use run animation',
    ],
    example: 'pixos.sync({ pixos.move_sprite("hero", {5, 10}, true) })',
    category: 'Sprites',
  },
  'pixos.get_caller': {
    signature: 'get_caller()',
    description: 'Gets the sprite that triggered this script.',
    returns: 'Sprite object or nil',
    category: 'Sprites',
  },
  'pixos.get_subject': {
    signature: 'get_subject()',
    description: 'Gets the subject sprite (e.g., the one being interacted with).',
    returns: 'Sprite object or nil',
    category: 'Sprites',
  },

  // Camera Control
  'pixos.set_camera': {
    signature: 'set_camera()',
    description: 'Resets the camera to default position.',
    category: 'Camera',
  },
  'pixos.look_at': {
    signature: 'look_at(position: table, target: table, up: table)',
    description: 'Sets camera view matrix.',
    params: [
      'position: Camera position {x, y, z}',
      'target: Look-at target {x, y, z}',
      'up: Up direction {x, y, z}',
    ],
    category: 'Camera',
  },
  'pixos.pan_camera': {
    signature: 'pan_camera(from: table, to: table, duration: number)',
    description: 'Smoothly pans camera between two positions.',
    params: ['from: Start position', 'to: End position', 'duration: Animation duration in ms'],
    category: 'Camera',
  },
  'pixos.focus_camera': {
    signature: 'focus_camera(target: table, mode: string, speed?: number)',
    description:
      'Focuses camera on a specific target with a mode (default, follow, topdown, isometric, fps).',
    params: ['target: {x, y} or {x, y, z}', 'mode: Camera mode', 'speed: Lerp speed'],
    category: 'Camera',
  },
  'pixos.zoom_camera': {
    signature: 'zoom_camera(level: number, duration?: number)',
    description: 'Zooms the camera to a specific level.',
    params: ['level: Zoom scale (1.0 = default)', 'duration: Time in ms'],
    category: 'Camera',
  },

  // Audio
  'pixos.play_sound': {
    signature: 'play_sound(name: string, loop?: boolean, volume?: number)',
    description: 'Plays a sound effect.',
    params: ['name: Audio resource name', 'loop: Whether to loop', 'volume: 0.0 - 1.0'],
    category: 'Audio',
  },
  'pixos.play_music': {
    signature: 'play_music(name: string, loop?: boolean, volume?: number)',
    description: 'Plays background music.',
    params: ['name: Audio resource name', 'loop: Whether to loop', 'volume: 0.0 - 1.0'],
    category: 'Audio',
  },
  'pixos.stop_music': {
    signature: 'stop_music()',
    description: 'Stops the background music.',
    category: 'Audio',
  },
  'pixos.stop_audio': {
    signature: 'stop_audio(name?: string)',
    description: 'Stops a specific audio track or all audio if name omitted.',
    params: ['name: Optional audio resource name'],
    category: 'Audio',
  },
  'pixos.set_volume': {
    signature: 'set_volume(level: number)',
    description: 'Sets the master volume.',
    params: ['level: 0.0 - 1.0'],
    category: 'Audio',
  },

  // Transitions
  'pixos.run_transition': {
    signature: 'run_transition(effect?: string, direction?: string, duration?: number)',
    description: 'Runs a screen transition effect.',
    params: [
      'effect: "fade", "blur", "cross", etc.',
      'direction: "in" or "out"',
      'duration: Milliseconds',
    ],
    example: 'pixos.sync({ pixos.run_transition("fade", "out", 500) })',
    category: 'Effects',
  },
  'pixos.screen_shake': {
    signature: 'screen_shake(intensity: number, duration: number)',
    description: 'Shakes the camera/screen.',
    params: ['intensity: Shake magnitude', 'duration: Time in ms'],
    category: 'Effects',
  },

  // Input
  'pixos.bind_action': {
    signature: 'bind_action(action: string, input_type: string, input_value: string)',
    description: 'Binds an input to an action.',
    params: [
      'action: Action name',
      'input_type: "keyboard", "mouse", "gamepad"',
      'input_value: Key/button',
    ],
    category: 'Input',
  },
  'pixos.is_action_active': {
    signature: 'is_action_active(action: string)',
    description: 'Checks if an action is currently active (key held).',
    returns: 'boolean',
    category: 'Input',
  },

  // Networking
  'pixos.send_action': {
    signature: 'send_action(action: table)',
    description: 'Sends a network action to the server.',
    params: ['action: Action data to send'],
    category: 'Network',
  },

  // Utility
  'pixos.sync': {
    signature: 'sync(actions: table)',
    description: 'Executes async actions in sequence and waits for completion.',
    params: ['actions: Array of async action functions'],
    example: `pixos.sync({
  pixos.sprite_dialogue("npc", "Hello!"),
  pixos.move_sprite("hero", {5, 5}),
  pixos.run_transition("fade", "out", 500)
})`,
    category: 'Utility',
  },
  'pixos.load_scripts': {
    signature: 'load_scripts(scripts: table)',
    description: 'Loads additional script modules.',
    params: ['scripts: Array of script paths'],
    category: 'Utility',
  },
  'pixos.reload_scripts': {
    signature: 'reload_scripts()',
    description: 'Reloads all scripts in the current zone (Hot Reload).',
    category: 'Utility',
  },
};

/**
 * Register the PixoScript language with Monaco Editor
 * @param {typeof import('monaco-editor')} monaco - Monaco editor instance
 */
export function registerPixoScriptLanguage(monaco) {
  // Check if already registered
  const languages = monaco.languages.getLanguages();
  if (languages.some(lang => lang.id === 'pixoscript')) {
    return;
  }

  // Register the language
  monaco.languages.register({
    id: 'pixoscript',
    extensions: ['.pxs', '.lua'],
    aliases: ['PixoScript', 'pixoscript', 'PXS', 'Lua'],
  });

  // Define tokenizer rules (Lua-based with PixoScript extensions)
  monaco.languages.setMonarchTokensProvider('pixoscript', {
    defaultToken: '',
    tokenPostfix: '.pxs',

    keywords: [
      'and',
      'break',
      'do',
      'else',
      'elseif',
      'end',
      'false',
      'for',
      'function',
      'goto',
      'if',
      'in',
      'local',
      'nil',
      'not',
      'or',
      'repeat',
      'return',
      'then',
      'true',
      'until',
      'while',
    ],

    builtins: [
      'assert',
      'collectgarbage',
      'dofile',
      'error',
      'getfenv',
      'getmetatable',
      'ipairs',
      'load',
      'loadfile',
      'loadstring',
      'module',
      'next',
      'pairs',
      'pcall',
      'print',
      'rawequal',
      'rawget',
      'rawset',
      'require',
      'select',
      'setfenv',
      'setmetatable',
      'tonumber',
      'tostring',
      'type',
      'unpack',
      'xpcall',
      'coroutine',
      'debug',
      'io',
      'math',
      'os',
      'package',
      'string',
      'table',
    ],

    // PixoScript API functions
    pixosApi: Object.keys(PIXOS_API),

    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.bracket' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],

    operators: [
      '+',
      '-',
      '*',
      '/',
      '%',
      '^',
      '#',
      '==',
      '~=',
      '<=',
      '>=',
      '<',
      '>',
      '=',
      'and',
      'or',
      'not',
      '..',
      '.',
      ':',
    ],

    symbols: /[=><!~?:&|+\-*\/\^%#]+/,

    tokenizer: {
      root: [
        // Comments
        [/--\[=*\[/, 'comment', '@multiLineComment'],
        [/--.*$/, 'comment'],

        // Strings
        [/\[=*\[/, 'string', '@multiLineString'],
        [/"/, 'string', '@doubleQuoteString'],
        [/'/, 'string', '@singleQuoteString'],

        // PixoScript API calls
        [
          /pixos\.\w+/,
          {
            cases: {
              '@pixosApi': 'keyword.pixos',
              '@default': 'variable.pixos',
            },
          },
        ],

        // Numbers
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+(\.\d+)?([eE][-+]?\d+)?/, 'number'],

        // Identifiers and keywords
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@builtins': 'type.builtin',
              '@default': 'identifier',
            },
          },
        ],

        // Operators
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'operator',
              '@default': '',
            },
          },
        ],

        // Delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[,;]/, 'delimiter'],

        // Whitespace
        [/\s+/, 'white'],
      ],

      multiLineComment: [
        [/\]=*\]/, 'comment', '@pop'],
        [/./, 'comment'],
      ],

      multiLineString: [
        [/\]=*\]/, 'string', '@pop'],
        [/./, 'string'],
      ],

      doubleQuoteString: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],

      singleQuoteString: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  });

  // Register completion provider
  monaco.languages.registerCompletionItemProvider('pixoscript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [];

      // Add PixoScript API suggestions
      for (const [name, doc] of Object.entries(PIXOS_API)) {
        suggestions.push({
          label: name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: name.replace('pixos.', ''),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: {
            value: `**${doc.signature}**\n\n${doc.description}\n\n${doc.example ? '```lua\n' + doc.example + '\n```' : ''}`,
          },
          range,
        });
      }

      // Add Lua keywords
      const keywords = [
        'local',
        'function',
        'end',
        'if',
        'then',
        'else',
        'elseif',
        'for',
        'while',
        'do',
        'repeat',
        'until',
        'return',
        'break',
        'and',
        'or',
        'not',
        'true',
        'false',
        'nil',
        'in',
      ];
      keywords.forEach(kw => {
        suggestions.push({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        });
      });

      return { suggestions };
    },
  });

  // Register hover provider
  monaco.languages.registerHoverProvider('pixoscript', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const text = word.word;
      const fullText = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column + text.length,
      });

      // Check for pixos.* API calls
      const apiMatch = fullText.match(/pixos\.(\w+)/);
      if (apiMatch) {
        const apiName = 'pixos.' + apiMatch[1];
        const doc = PIXOS_API[apiName];
        if (doc) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${doc.signature}**` },
              { value: doc.description },
              ...(doc.params
                ? [{ value: '**Parameters:**\n' + doc.params.map(p => `- ${p}`).join('\n') }]
                : []),
              ...(doc.returns ? [{ value: `**Returns:** ${doc.returns}` }] : []),
              ...(doc.example ? [{ value: '**Example:**\n```lua\n' + doc.example + '\n```' }] : []),
            ],
          };
        }
      }

      return null;
    },
  });

  // Define theme for PixoScript
  monaco.editor.defineTheme('pixoscript-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'keyword.pixos', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'variable.pixos', foreground: '9CDCFE' },
      { token: 'type.builtin', foreground: '4FC1FF' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.hex', foreground: 'B5CEA8' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#0a0f1a',
      'editor.foreground': '#e6eef8',
    },
  });
}

export default registerPixoScriptLanguage;
