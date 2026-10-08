/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Monaco Language Definition
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Provides syntax highlighting, autocompletion, and hover documentation
 * for PXSL (PixoSpritz Shader Language) in Monaco Editor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * PXSL built-in functions with documentation
 */
const PXSL_FUNCTIONS = {
  // Lighting
  diffuse: {
    signature: 'diffuse(normal: vec3, lightDir: vec3) → float',
    description: "Calculates diffuse lighting factor using Lambert's cosine law.",
    example: 'let diff = diffuse(vNormal, lightDirection)',
  },
  specular: {
    signature: 'specular(normal: vec3, lightDir: vec3, viewDir: vec3, power: float) → float',
    description: 'Calculates specular highlight using Blinn-Phong model.',
    example: 'let spec = specular(vNormal, lightDir, viewDir, 32.0)',
  },
  fresnel: {
    signature: 'fresnel(normal: vec3, viewDir: vec3, power: float) → float',
    description: 'Calculates Fresnel effect for rim lighting and reflections.',
    example: 'let rim = fresnel(vNormal, viewDir, 2.0)',
  },

  // Color Operations
  brighten: {
    signature: 'brighten(color: vec3|vec4, amount: float) → vec3|vec4',
    description: 'Increases brightness of a color by the given amount.',
    example: 'let bright = brighten(baseColor, 0.2)',
  },
  darken: {
    signature: 'darken(color: vec3|vec4, amount: float) → vec3|vec4',
    description: 'Decreases brightness of a color by the given amount (0-1).',
    example: 'let dark = darken(baseColor, 0.3)',
  },
  saturate: {
    signature: 'saturate(color: vec3, amount: float) → vec3',
    description: 'Adjusts color saturation. 0 = grayscale, 1 = original, >1 = oversaturated.',
    example: 'let vivid = saturate(color, 1.5)',
  },
  contrast: {
    signature: 'contrast(color: vec3, amount: float) → vec3',
    description: 'Adjusts color contrast. 1 = original, <1 = less contrast, >1 = more contrast.',
    example: 'let punchy = contrast(color, 1.2)',
  },
  tint: {
    signature: 'tint(color: vec3, tintColor: vec3, amount: float) → vec3',
    description: 'Blends a tint color with the original color.',
    example: 'let tinted = tint(color, vec3(1.0, 0.8, 0.6), 0.3)',
  },

  // Effects
  fog: {
    signature: 'fog(color: vec3|vec4, depth: float, fogColor: vec3, density: float) → vec3|vec4',
    description: 'Applies exponential fog based on depth.',
    example: 'let fogged = fog(color, linearDepth, fogColor, 0.02)',
  },
  glow: {
    signature: 'glow(color: vec3|vec4, intensity: float) → vec3|vec4',
    description: 'Adds a self-illumination glow effect based on luminance.',
    example: 'let glowing = glow(color, 0.5)',
  },
  outline: {
    signature: 'outline(uv: vec2, texture: sampler2D, color: vec3, width: float) → vec4',
    description: 'Adds an outline around opaque pixels in a texture.',
    example: 'fragColor = outline(vUV, tex, vec3(0.0), 2.0)',
  },
  pixelate: {
    signature: 'pixelate(uv: vec2, resolution: float) → vec2',
    description: 'Pixelates UV coordinates for a retro effect.',
    example: 'let pixelUV = pixelate(vUV, 64.0)',
  },

  // Math Helpers
  remap: {
    signature:
      'remap(value: float, inMin: float, inMax: float, outMin: float, outMax: float) → float',
    description: 'Remaps a value from one range to another.',
    example: 'let normalized = remap(depth, 0.1, 100.0, 0.0, 1.0)',
  },
  pulse: {
    signature: 'pulse(value: float, frequency: float) → float',
    description: 'Creates a smooth 0-1 pulsing animation using sine wave.',
    example: 'let p = pulse(time, 2.0)  // 2 pulses per second',
  },
  noise: {
    signature: 'noise(uv: vec2) → float',
    description: 'Generates simple pseudo-random noise (0-1) from 2D coordinates.',
    example: 'let n = noise(vUV * 10.0)',
  },
  fbm: {
    signature: 'fbm(uv: vec2, octaves: int) → float',
    description: 'Fractal Brownian Motion noise for natural-looking patterns.',
    example: 'let cloud = fbm(vUV * 5.0, 4)',
  },

  // UV Transforms
  rotateUV: {
    signature: 'rotateUV(uv: vec2, angle: float, center: vec2) → vec2',
    description: 'Rotates UV coordinates around a center point.',
    example: 'let rotated = rotateUV(vUV, time, vec2(0.5, 0.5))',
  },
  scaleUV: {
    signature: 'scaleUV(uv: vec2, scale: vec2, center: vec2) → vec2',
    description: 'Scales UV coordinates from a center point.',
    example: 'let zoomed = scaleUV(vUV, vec2(2.0, 2.0), vec2(0.5, 0.5))',
  },
  waveUV: {
    signature: 'waveUV(uv: vec2, amplitude: float, frequency: float, time: float) → vec2',
    description: 'Applies wave distortion to UV coordinates.',
    example: 'let wavy = waveUV(vUV, 0.1, 5.0, time)',
  },

  // Utility
  linearizeDepth: {
    signature: 'linearizeDepth(depth: float, near: float, far: float) → float',
    description: 'Converts non-linear depth buffer value to linear depth.',
    example: 'let linear = linearizeDepth(gl_FragCoord.z, 0.1, 100.0)',
  },
  sample: {
    signature: 'sample(texture: sampler2D, uv: vec2) → vec4',
    description: 'Samples a texture at the given UV coordinates.',
    example: 'let color = sample(diffuseMap, vUV)',
  },
};

/**
 * PXSL types
 */
const PXSL_TYPES = [
  // Standard GLSL types
  'float',
  'int',
  'bool',
  'vec2',
  'vec3',
  'vec4',
  'mat2',
  'mat3',
  'mat4',
  'sampler2D',
  'samplerCube',
  // User-friendly aliases
  'color',
  'color3',
  'point',
  'point2',
  'direction',
  'normal',
  'matrix',
  'texture',
  'cubemap',
];

/**
 * PXSL keywords
 */
const PXSL_KEYWORDS = [
  'input',
  'output',
  'uniform',
  'const',
  'let',
  'main',
  'if',
  'else',
  'for',
  'while',
  'return',
  'discard',
  'struct',
];

/**
 * PXSL directives
 */
const PXSL_DIRECTIVES = ['@vertex', '@fragment', '@shader', '@effect'];

/**
 * Register PXSL language with Monaco
 * @param {typeof import('monaco-editor')} monaco
 */
export function registerPXSLLanguage(monaco) {
  // Register the language
  monaco.languages.register({
    id: 'pxsl',
    extensions: ['.pxsl'],
    aliases: ['PXSL', 'PixoSpritz Shader Language'],
    mimetypes: ['text/x-pxsl'],
  });

  // Define tokens for syntax highlighting
  monaco.languages.setMonarchTokensProvider('pxsl', {
    keywords: PXSL_KEYWORDS,
    types: PXSL_TYPES,
    operators: [
      '=',
      '>',
      '<',
      '!',
      '~',
      '?',
      ':',
      '==',
      '<=',
      '>=',
      '!=',
      '&&',
      '||',
      '++',
      '--',
      '+',
      '-',
      '*',
      '/',
      '&',
      '|',
      '^',
      '%',
      '<<',
      '>>',
      '>>>',
      '+=',
      '-=',
      '*=',
      '/=',
      '&=',
      '|=',
      '^=',
      '%=',
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,

    tokenizer: {
      root: [
        // Directives
        [/@\w+/, 'keyword.directive'],

        // Identifiers and keywords
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@types': 'type',
              '@default': 'identifier',
            },
          },
        ],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'operator',
              '@default': '',
            },
          },
        ],

        // Numbers
        [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)[fFdD]/, 'number.float'],
        [/(@digits)/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],

        // Punctuation
        [/[;,.]/, 'delimiter'],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment'],
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop'],
      ],
    },
  });

  // Define the PXSL theme
  monaco.editor.defineTheme('pxsl-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: 'ff6b9d', fontStyle: 'bold' },
      { token: 'keyword', foreground: '4ecdc4' },
      { token: 'type', foreground: 'a78bfa' },
      { token: 'identifier', foreground: 'f0f0f5' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'number.float', foreground: 'fbbf24' },
      { token: 'string', foreground: '22c55e' },
      { token: 'comment', foreground: '606070', fontStyle: 'italic' },
      { token: 'operator', foreground: '4ecdc4' },
    ],
    colors: {
      'editor.background': '#0a0a12',
      'editor.foreground': '#f0f0f5',
    },
  });

  // Configure autocompletion
  monaco.languages.registerCompletionItemProvider('pxsl', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [];

      // Add directives
      for (const directive of PXSL_DIRECTIVES) {
        suggestions.push({
          label: directive,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: directive,
          range,
          detail: 'PXSL Directive',
          documentation: getDirectiveDoc(directive),
        });
      }

      // Add keywords
      for (const keyword of PXSL_KEYWORDS) {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
          detail: 'Keyword',
        });
      }

      // Add types
      for (const type of PXSL_TYPES) {
        suggestions.push({
          label: type,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: type,
          range,
          detail: 'Type',
        });
      }

      // Add built-in functions
      for (const [name, info] of Object.entries(PXSL_FUNCTIONS)) {
        suggestions.push({
          label: name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: name + '($0)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: info.signature,
          documentation: {
            value: `${info.description}\n\n**Example:**\n\`\`\`pxsl\n${info.example}\n\`\`\``,
          },
        });
      }

      // Add snippets
      suggestions.push(
        {
          label: 'shader',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            '@shader "${1:shader_name}"',
            '',
            '@vertex',
            'input position: vec3',
            'input uv: vec2',
            'uniform modelMatrix: mat4',
            'uniform viewMatrix: mat4',
            'uniform projectionMatrix: mat4',
            'output vUV: vec2',
            '',
            'main {',
            '  vUV = uv',
            '  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)',
            '}',
            '',
            '@fragment',
            'input vUV: vec2',
            'uniform texture: sampler2D',
            'output fragColor: vec4',
            '',
            'main {',
            '  fragColor = sample(texture, vUV)',
            '}',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: 'Complete PXSL Shader Template',
          documentation: 'Creates a complete shader with vertex and fragment stages.',
        },
        {
          label: 'vertex',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            '@vertex',
            'input position: vec3',
            'input uv: vec2',
            'uniform modelMatrix: mat4',
            'uniform viewMatrix: mat4',
            'uniform projectionMatrix: mat4',
            'output vUV: vec2',
            '',
            'main {',
            '  vUV = uv',
            '  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)',
            '}',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: 'Vertex Shader Template',
        },
        {
          label: 'fragment',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            '@fragment',
            'input vUV: vec2',
            'uniform texture: sampler2D',
            'output fragColor: vec4',
            '',
            'main {',
            '  fragColor = sample(texture, vUV)',
            '}',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: 'Fragment Shader Template',
        }
      );

      return { suggestions };
    },
  });

  // Configure hover provider
  monaco.languages.registerHoverProvider('pxsl', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const text = word.word;

      // Check if it's a built-in function
      if (PXSL_FUNCTIONS[text]) {
        const info = PXSL_FUNCTIONS[text];
        return {
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          },
          contents: [
            { value: `**${text}**` },
            { value: `\`\`\`\n${info.signature}\n\`\`\`` },
            { value: info.description },
            { value: `**Example:**\n\`\`\`pxsl\n${info.example}\n\`\`\`` },
          ],
        };
      }

      // Check if it's a directive
      if (text.startsWith('@') || PXSL_DIRECTIVES.includes('@' + text)) {
        const directive = text.startsWith('@') ? text : '@' + text;
        const doc = getDirectiveDoc(directive);
        if (doc) {
          return {
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
            contents: [{ value: `**${directive}**` }, { value: doc }],
          };
        }
      }

      // Check if it's a type
      if (PXSL_TYPES.includes(text)) {
        return {
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          },
          contents: [{ value: `**${text}**` }, { value: getTypeDoc(text) }],
        };
      }

      return null;
    },
  });
}

/**
 * Get documentation for a directive
 * @param {string} directive
 * @returns {string}
 */
function getDirectiveDoc(directive) {
  const docs = {
    '@vertex':
      'Marks the start of the vertex shader section. Vertex shaders run once per vertex and output transformed positions.',
    '@fragment':
      'Marks the start of the fragment shader section. Fragment shaders run once per pixel and output colors.',
    '@shader': 'Names the shader for identification. Usage: `@shader "my_shader"`',
    '@effect':
      'Defines a reusable effect with configurable properties. Usage: `@effect "name" { ... }`',
  };
  return docs[directive] || '';
}

/**
 * Get documentation for a type
 * @param {string} type
 * @returns {string}
 */
function getTypeDoc(type) {
  const docs = {
    float: 'Single-precision floating point number',
    int: 'Integer number',
    bool: 'Boolean value (true/false)',
    vec2: '2D vector (x, y) - often used for UV coordinates',
    vec3: '3D vector (x, y, z) - used for positions, normals, colors (RGB)',
    vec4: '4D vector (x, y, z, w) - used for colors (RGBA), homogeneous coordinates',
    mat2: '2×2 matrix',
    mat3: '3×3 matrix - used for normal transformation',
    mat4: '4×4 matrix - used for model/view/projection transforms',
    sampler2D: '2D texture sampler',
    samplerCube: 'Cubemap texture sampler',
    // Aliases
    color: 'Alias for vec4 (RGBA color)',
    color3: 'Alias for vec3 (RGB color)',
    point: 'Alias for vec3 (3D position)',
    point2: 'Alias for vec2 (2D position)',
    direction: 'Alias for vec3 (normalized direction vector)',
    normal: 'Alias for vec3 (surface normal)',
    matrix: 'Alias for mat4 (transformation matrix)',
    texture: 'Alias for sampler2D (2D texture)',
    cubemap: 'Alias for samplerCube (cubemap texture)',
  };
  return docs[type] || 'GLSL type';
}

export default registerPXSLLanguage;
