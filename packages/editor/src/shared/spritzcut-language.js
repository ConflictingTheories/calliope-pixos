/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – SpritzCut Language Definition
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Monaco Editor language definition for the SpritzCut DSL (.pxc files).
 * This provides syntax highlighting for cutscene scripts.
 */

/**
 * Register the SpritzCut language with Monaco Editor
 * @param {typeof import('monaco-editor')} monaco - Monaco editor instance
 */
export function registerSpritzCutLanguage(monaco) {
  // Check if already registered
  const languages = monaco.languages.getLanguages();
  if (languages.some(lang => lang.id === 'spritzcut')) {
    return;
  }

  // Register the language
  monaco.languages.register({
    id: 'spritzcut',
    extensions: ['.pxc'],
    aliases: ['SpritzCut', 'spritzcut', 'PXC'],
  });

  // Define tokenizer rules
  monaco.languages.setMonarchTokensProvider('spritzcut', {
    defaultToken: '',
    tokenPostfix: '.spritzcut',

    // Keywords and commands
    keywords: ['wait', 'waitInput', 'end'],

    commands: [
      'backdrop',
      'char',
      'action',
      'transition',
      'do',
      'end',
      'playBgm',
      'playSfx',
      'playVoice',
      'stopBgm',
      'stopAll',
      'stopSfx',
      'moveTo',
      'fadeIn',
      'fadeOut',
      'fadeOutBackdrop',
      'wipe',
      'shake',
    ],

    expressions: [
      'smile',
      'sad',
      'angry',
      'annoyed',
      'shocked',
      'neutral',
      'smirk',
      'worried',
      'tired',
      'happy',
    ],

    operators: ['->', '|', '='],

    // Token rules
    tokenizer: {
      root: [
        // Comments (lines starting with #)
        [/#.*$/, 'comment'],

        // Multiline strings (triple quotes)
        [/"""/, 'string.quote', '@multilineString'],

        // @ commands (backdrop, char, action, transition, do)
        [/@(backdrop|char|action|transition|do|end)\b/, 'keyword.command'],

        // Other @ prefixed commands
        [/@\w+/, 'keyword'],

        // Command parameters in brackets
        [/\[/, 'delimiter.bracket', '@bracketContent'],

        // Wait commands
        [/\b(wait|waitInput)\b/, 'keyword.control'],

        // Numbers (for durations, coordinates, etc)
        [/\b\d+(\.\d+)?\b/, 'number'],

        // Cutin marker (asterisk before speaker)
        [/^\*(?=[A-Z])/, 'keyword.cutin'],

        // Speaker names (UPPERCASE followed by colon)
        [/^[A-Z][A-Z0-9_]*(?=\s*:)/, 'variable.speaker'],
        [/^\*[A-Z][A-Z0-9_]*(?=\s*:)/, 'variable.speaker.cutin'],

        // Colon after speaker
        [/:/, 'delimiter'],

        // Operators
        [/->/, 'operator.chain'],
        [/\|/, 'operator.parallel'],

        // Strings (double quoted)
        [/"([^"\\]|\\.)*"/, 'string'],

        // Paths and file references
        [/\b(data|textures|sprites|audio|maps):[\w\/.]+/, 'string.path'],

        // Identifiers
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@commands': 'type.command',
              '@expressions': 'constant.expression',
              '@default': 'identifier',
            },
          },
        ],

        // Whitespace
        [/\s+/, 'white'],
      ],

      multilineString: [
        [/"""/, 'string.quote', '@pop'],
        [/[^"]+/, 'string'],
        [/"/, 'string'],
      ],

      bracketContent: [
        [/\]/, 'delimiter.bracket', '@pop'],
        [
          /\b(x|y|duration|fadeIn|fadeOut|name|sprite|expression|position|size|delay)\b/,
          'variable.parameter',
        ],
        [/=/, 'operator'],
        [/\d+(\.\d+)?/, 'number'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/[a-zA-Z_][\w\/.]*/, 'string.value'],
        [/,/, 'delimiter'],
        [/\s+/, 'white'],
      ],
    },
  });

  // Define theme colors for SpritzCut tokens
  monaco.editor.defineTheme('spritzcut-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'keyword.command', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'DCDCAA' },
      { token: 'keyword.cutin', foreground: 'FF79C6', fontStyle: 'bold' },
      { token: 'variable.speaker', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'variable.speaker.cutin', foreground: 'FF79C6', fontStyle: 'bold' },
      { token: 'variable.parameter', foreground: '9CDCFE' },
      { token: 'type.command', foreground: '4FC1FF' },
      { token: 'constant.expression', foreground: 'CE9178' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.quote', foreground: 'CE9178' },
      { token: 'string.path', foreground: 'D7BA7D' },
      { token: 'string.value', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'operator.chain', foreground: 'DCDCAA', fontStyle: 'bold' },
      { token: 'operator.parallel', foreground: 'FF79C6', fontStyle: 'bold' },
      { token: 'delimiter', foreground: 'D4D4D4' },
      { token: 'delimiter.bracket', foreground: 'FFD700' },
    ],
    colors: {
      'editor.background': '#0a0f1a',
      'editor.foreground': '#e6eef8',
    },
  });
}

export default registerSpritzCutLanguage;
