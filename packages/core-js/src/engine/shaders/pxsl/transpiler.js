/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Transpiler - PixoSpritz Shader Language
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Transpiles PXSL (.pxsl) files to WebGL GLSL shaders.
 * Supports both vertex and fragment shaders in a single file.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  PXSL_BUILTINS,
  PXSL_HEADERS,
  PXSL_TYPE_ALIASES,
  PXSL_INPUT_MAPPINGS,
  PXSL_UNIFORM_MAPPINGS,
} from './specification.js';

/**
 * Token types for the PXSL lexer
 */
const TokenType = {
  DIRECTIVE: 'DIRECTIVE', // @vertex, @fragment, @shader, @effect
  KEYWORD: 'KEYWORD', // input, output, uniform, const, let, main
  IDENTIFIER: 'IDENTIFIER', // Variable/function names
  TYPE: 'TYPE', // vec3, float, mat4, etc.
  NUMBER: 'NUMBER', // 1.0, 42, etc.
  STRING: 'STRING', // "shader_name"
  OPERATOR: 'OPERATOR', // =, +, -, *, /, etc.
  PUNCTUATION: 'PUNCTUATION', // :, {, }, (, ), etc.
  COMMENT: 'COMMENT', // // or /* */
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
};

/**
 * PXSL Lexer - Tokenizes PXSL source code
 */
class PXSLLexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  peek(offset = 0) {
    return this.source[this.pos + offset];
  }

  advance() {
    const char = this.source[this.pos++];
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return char;
  }

  isAtEnd() {
    return this.pos >= this.source.length;
  }

  isAlpha(char) {
    return /[a-zA-Z_]/.test(char);
  }

  isAlphaNumeric(char) {
    return /[a-zA-Z0-9_]/.test(char);
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  isWhitespace(char) {
    return /[ \t\r]/.test(char);
  }

  skipWhitespace() {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  readString() {
    const quote = this.advance(); // consume opening quote
    let value = '';
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        value += this.advance();
      } else {
        value += this.advance();
      }
    }
    if (!this.isAtEnd()) this.advance(); // consume closing quote
    return { type: TokenType.STRING, value, line: this.line, col: this.col };
  }

  readNumber() {
    let value = '';
    const startCol = this.col;

    // Handle negative numbers
    if (this.peek() === '-') {
      value += this.advance();
    }

    while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.')) {
      value += this.advance();
    }

    // Handle scientific notation
    if (this.peek() === 'e' || this.peek() === 'E') {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    return { type: TokenType.NUMBER, value, line: this.line, col: startCol };
  }

  readIdentifier() {
    let value = '';
    const startCol = this.col;

    while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check for keywords
    const keywords = [
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
    const types = Object.keys(PXSL_TYPE_ALIASES);

    if (keywords.includes(value)) {
      return { type: TokenType.KEYWORD, value, line: this.line, col: startCol };
    } else if (types.includes(value)) {
      return { type: TokenType.TYPE, value, line: this.line, col: startCol };
    }

    return { type: TokenType.IDENTIFIER, value, line: this.line, col: startCol };
  }

  readDirective() {
    this.advance(); // consume @
    let value = '@';
    while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.DIRECTIVE, value, line: this.line, col: this.col };
  }

  readLineComment() {
    let value = '';
    this.advance(); // consume first /
    this.advance(); // consume second /
    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }
    return { type: TokenType.COMMENT, value: '//' + value, line: this.line, col: this.col };
  }

  readBlockComment() {
    let value = '';
    this.advance(); // consume /
    this.advance(); // consume *
    while (!this.isAtEnd() && !(this.peek() === '*' && this.peek(1) === '/')) {
      value += this.advance();
    }
    if (!this.isAtEnd()) {
      this.advance(); // consume *
      this.advance(); // consume /
    }
    return { type: TokenType.COMMENT, value: '/*' + value + '*/', line: this.line, col: this.col };
  }

  tokenize() {
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const char = this.peek();

      // Newline
      if (char === '\n') {
        this.tokens.push({ type: TokenType.NEWLINE, value: '\n', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Comments
      if (char === '/' && this.peek(1) === '/') {
        this.tokens.push(this.readLineComment());
        continue;
      }
      if (char === '/' && this.peek(1) === '*') {
        this.tokens.push(this.readBlockComment());
        continue;
      }

      // Directives (@vertex, @fragment, etc.)
      if (char === '@') {
        this.tokens.push(this.readDirective());
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        this.tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (
        this.isDigit(char) ||
        (char === '-' && this.isDigit(this.peek(1))) ||
        (char === '.' && this.isDigit(this.peek(1)))
      ) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Identifiers and keywords
      if (this.isAlpha(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Multi-character operators
      const twoChar = char + (this.peek(1) || '');
      const multiOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='];
      if (multiOps.includes(twoChar)) {
        this.tokens.push({
          type: TokenType.OPERATOR,
          value: twoChar,
          line: this.line,
          col: this.col,
        });
        this.advance();
        this.advance();
        continue;
      }

      // Single-character operators
      const ops = '=+-*/<>!&|^~%';
      if (ops.includes(char)) {
        this.tokens.push({ type: TokenType.OPERATOR, value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Punctuation
      const punct = '{}[]():;,.';
      if (punct.includes(char)) {
        this.tokens.push({
          type: TokenType.PUNCTUATION,
          value: char,
          line: this.line,
          col: this.col,
        });
        this.advance();
        continue;
      }

      // Unknown character - skip it
      this.advance();
    }

    this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, col: this.col });
    return this.tokens;
  }
}

/**
 * PXSL Parser - Parses tokens into an AST
 */
class PXSLParser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE && t.type !== TokenType.COMMENT);
    this.pos = 0;
    this.ast = {
      shaderName: null,
      vertex: null,
      fragment: null,
      effects: [],
    };
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset];
  }

  advance() {
    return this.tokens[this.pos++];
  }

  isAtEnd() {
    return this.pos >= this.tokens.length || this.peek().type === TokenType.EOF;
  }

  expect(type, value = null) {
    const token = this.peek();
    if (token.type !== type || (value !== null && token.value !== value)) {
      throw new Error(
        `PXSL Parse Error at line ${token.line}: Expected ${type}${value ? ` '${value}'` : ''}, got ${token.type} '${token.value}'`
      );
    }
    return this.advance();
  }

  match(type, value = null) {
    const token = this.peek();
    if (token.type === type && (value === null || token.value === value)) {
      return this.advance();
    }
    return null;
  }

  parse() {
    while (!this.isAtEnd()) {
      const token = this.peek();

      if (token.type === TokenType.DIRECTIVE) {
        this.parseDirective();
      } else {
        // Skip unexpected tokens
        this.advance();
      }
    }

    return this.ast;
  }

  parseDirective() {
    const directive = this.advance();

    switch (directive.value) {
      case '@shader':
        this.ast.shaderName = this.expect(TokenType.STRING).value;
        break;

      case '@vertex':
        this.ast.vertex = this.parseShaderBlock('vertex');
        break;

      case '@fragment':
        this.ast.fragment = this.parseShaderBlock('fragment');
        break;

      case '@effect':
        this.ast.effects.push(this.parseEffectBlock());
        break;

      default:
        throw new Error(`Unknown directive: ${directive.value}`);
    }
  }

  parseShaderBlock(type) {
    const block = {
      type,
      inputs: [],
      outputs: [],
      uniforms: [],
      constants: [],
      locals: [],
      mainBody: '',
      functions: [],
    };

    // Parse declarations until we hit main or another directive
    while (!this.isAtEnd()) {
      const token = this.peek();

      if (token.type === TokenType.DIRECTIVE) {
        break; // New section starting
      }

      if (token.type === TokenType.KEYWORD) {
        switch (token.value) {
          case 'input':
            block.inputs.push(this.parseVariableDecl('input'));
            break;
          case 'output':
            block.outputs.push(this.parseVariableDecl('output'));
            break;
          case 'uniform':
            block.uniforms.push(this.parseVariableDecl('uniform'));
            break;
          case 'const':
            block.constants.push(this.parseConstDecl());
            break;
          case 'let':
            block.locals.push(this.parseVariableDecl('local'));
            break;
          case 'main':
            block.mainBody = this.parseMainBlock();
            break;
          default:
            this.advance();
        }
      } else {
        this.advance();
      }
    }

    return block;
  }

  parseVariableDecl(kind) {
    this.advance(); // consume keyword (input/output/uniform/let)
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.PUNCTUATION, ':');
    const typeToken = this.advance();
    const type = typeToken.value;

    // Check for array notation
    let arraySize = null;
    if (this.match(TokenType.PUNCTUATION, '[')) {
      arraySize = this.expect(TokenType.NUMBER).value;
      this.expect(TokenType.PUNCTUATION, ']');
    }

    // Check for default value
    let defaultValue = null;
    if (this.match(TokenType.OPERATOR, '=')) {
      defaultValue = this.parseExpression();
    }

    return { kind, name, type, arraySize, defaultValue };
  }

  parseConstDecl() {
    this.advance(); // consume 'const'
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.OPERATOR, '=');
    const value = this.parseExpression();
    return { name, value };
  }

  parseMainBlock() {
    this.advance(); // consume 'main'
    this.expect(TokenType.PUNCTUATION, '{');

    let body = '';
    let braceDepth = 1;

    while (!this.isAtEnd() && braceDepth > 0) {
      const token = this.advance();

      if (token.type === TokenType.PUNCTUATION && token.value === '{') {
        braceDepth++;
        body += '{ ';
      } else if (token.type === TokenType.PUNCTUATION && token.value === '}') {
        braceDepth--;
        if (braceDepth > 0) body += '} ';
      } else {
        body += token.value + ' ';
      }
    }

    return body.trim();
  }

  parseExpression() {
    // Simple expression parser - collects tokens until we hit a statement terminator
    let expr = '';
    let parenDepth = 0;
    let braceDepth = 0;

    while (!this.isAtEnd()) {
      const token = this.peek();

      if (token.type === TokenType.PUNCTUATION) {
        if (token.value === '(') parenDepth++;
        else if (token.value === ')') parenDepth--;
        else if (token.value === '{') braceDepth++;
        else if (token.value === '}') braceDepth--;
      }

      // End of expression
      if (parenDepth === 0 && braceDepth === 0) {
        if (token.type === TokenType.KEYWORD || token.type === TokenType.DIRECTIVE) {
          break;
        }
      }

      if (parenDepth < 0 || braceDepth < 0) {
        break;
      }

      expr += this.advance().value + ' ';
    }

    return expr.trim();
  }

  parseEffectBlock() {
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.PUNCTUATION, '{');

    const properties = {};
    let braceDepth = 1;

    while (!this.isAtEnd() && braceDepth > 0) {
      const token = this.peek();

      if (token.type === TokenType.PUNCTUATION && token.value === '}') {
        braceDepth--;
        this.advance();
        continue;
      }

      if (token.type === TokenType.IDENTIFIER) {
        const propName = this.advance().value;
        this.expect(TokenType.PUNCTUATION, ':');
        properties[propName] = this.parseExpression();
      } else {
        this.advance();
      }
    }

    return { name, properties };
  }
}

/**
 * PXSL Code Generator - Generates GLSL from AST
 */
class PXSLCodeGenerator {
  constructor(ast) {
    this.ast = ast;
    this.usedBuiltins = new Set();
  }

  generate() {
    const result = {
      name: this.ast.shaderName,
      vs: null,
      fs: null,
    };

    if (this.ast.vertex) {
      result.vs = this.generateShader(this.ast.vertex, 'vertex');
    }

    if (this.ast.fragment) {
      result.fs = this.generateShader(this.ast.fragment, 'fragment');
    }

    return result;
  }

  generateShader(block, type) {
    const lines = [];
    this.usedBuiltins.clear();

    // Add precision header
    lines.push(PXSL_HEADERS[type]);

    // Scan main body for builtin function usage
    this.scanForBuiltins(block.mainBody);

    // Add used builtins first (for dependencies like noise -> fbm)
    const builtinCode = this.generateBuiltins();
    if (builtinCode) {
      lines.push('// PXSL Built-in Functions');
      lines.push(builtinCode);
      lines.push('');
    }

    // Generate constants
    for (const c of block.constants) {
      lines.push(`const float ${c.name} = ${c.value};`);
    }
    if (block.constants.length > 0) lines.push('');

    // Generate inputs (attributes for vertex, varyings for fragment)
    for (const input of block.inputs) {
      const glslType = PXSL_TYPE_ALIASES[input.type] || input.type;
      const glslName = PXSL_INPUT_MAPPINGS[input.name] || input.name;

      if (type === 'vertex') {
        // Vertex shader inputs are attributes
        lines.push(`attribute ${glslType} ${glslName};`);
      } else {
        // Fragment shader inputs are varyings (received from vertex)
        lines.push(`varying ${glslType} ${input.name};`);
      }
    }
    if (block.inputs.length > 0) lines.push('');

    // Generate outputs (varyings for vertex, nothing special for fragment)
    for (const output of block.outputs) {
      const glslType = PXSL_TYPE_ALIASES[output.type] || output.type;

      if (type === 'vertex') {
        // Vertex outputs become varyings
        lines.push(`varying ${glslType} ${output.name};`);
      }
      // Fragment outputs use gl_FragColor directly
    }
    if (block.outputs.length > 0) lines.push('');

    // Generate uniforms
    for (const uniform of block.uniforms) {
      const glslType = PXSL_TYPE_ALIASES[uniform.type] || uniform.type;
      const glslName =
        PXSL_UNIFORM_MAPPINGS[uniform.name] ||
        `u${uniform.name.charAt(0).toUpperCase()}${uniform.name.slice(1)}`;
      const arrayPart = uniform.arraySize ? `[${uniform.arraySize}]` : '';
      lines.push(`uniform ${glslType} ${glslName}${arrayPart};`);
    }
    if (block.uniforms.length > 0) lines.push('');

    // Generate local variables
    for (const local of block.locals) {
      const glslType = PXSL_TYPE_ALIASES[local.type] || local.type;
      const init = local.defaultValue ? ` = ${local.defaultValue}` : '';
      lines.push(`${glslType} ${local.name}${init};`);
    }

    // Generate main function
    lines.push('void main(void) {');
    lines.push(this.transformMainBody(block.mainBody, block, type));
    lines.push('}');

    return lines.join('\n');
  }

  scanForBuiltins(code) {
    // List of PXSL builtin function names
    const builtinNames = Object.keys(PXSL_BUILTINS);

    for (const name of builtinNames) {
      // Check if function is called in the code
      const regex = new RegExp(`\\b${name}\\s*\\(`, 'g');
      if (regex.test(code)) {
        this.usedBuiltins.add(name);

        // fbm depends on noise
        if (name === 'fbm') {
          this.usedBuiltins.add('noise');
        }
      }
    }
  }

  generateBuiltins() {
    const code = [];

    // Order matters for dependencies
    const ordered = [
      'noise',
      'fbm',
      ...Array.from(this.usedBuiltins).filter(n => n !== 'noise' && n !== 'fbm'),
    ];

    for (const name of ordered) {
      if (this.usedBuiltins.has(name) && PXSL_BUILTINS[name]) {
        code.push(PXSL_BUILTINS[name]);
      }
    }

    return code.join('\n\n');
  }

  transformMainBody(body, block, type) {
    let code = body;

    // Replace PXSL input names with GLSL names
    for (const input of block.inputs) {
      if (type === 'vertex') {
        const glslName = PXSL_INPUT_MAPPINGS[input.name] || input.name;
        if (glslName !== input.name) {
          code = code.replace(new RegExp(`\\b${input.name}\\b`, 'g'), glslName);
        }
      }
    }

    // Replace uniform names with GLSL conventions
    for (const uniform of block.uniforms) {
      const glslName =
        PXSL_UNIFORM_MAPPINGS[uniform.name] ||
        `u${uniform.name.charAt(0).toUpperCase()}${uniform.name.slice(1)}`;
      if (glslName !== uniform.name) {
        code = code.replace(new RegExp(`\\b${uniform.name}\\b`, 'g'), glslName);
      }
    }

    // Replace PXSL function calls with pxsl_ prefixed versions
    for (const name of this.usedBuiltins) {
      code = code.replace(new RegExp(`\\b${name}\\s*\\(`, 'g'), `pxsl_${name}(`);
    }

    // Handle fragment output (fragColor -> gl_FragColor)
    if (type === 'fragment') {
      for (const output of block.outputs) {
        if (
          output.name.toLowerCase().includes('color') ||
          output.name.toLowerCase().includes('frag')
        ) {
          code = code.replace(new RegExp(`\\b${output.name}\\b`, 'g'), 'gl_FragColor');
        }
      }
    }

    // Replace 'sample' with 'texture2D' if not already a builtin
    if (!this.usedBuiltins.has('sample')) {
      code = code.replace(/\bsample\s*\(/g, 'texture2D(');
    }

    // Indent each line
    return code
      .split('\n')
      .map(line => '  ' + line.trim())
      .join('\n');
  }
}

/**
 * Main PXSL Transpiler class
 */
export class PXSLTranspiler {
  /**
   * Transpile PXSL source code to GLSL
   * @param {string} source - PXSL source code
   * @returns {{ name: string, vs: string, fs: string }} - Compiled shaders
   */
  static transpile(source) {
    // Lexer
    const lexer = new PXSLLexer(source);
    const tokens = lexer.tokenize();

    // Parser
    const parser = new PXSLParser(tokens);
    const ast = parser.parse();

    // Code Generator
    const generator = new PXSLCodeGenerator(ast);
    return generator.generate();
  }

  /**
   * Check if source appears to be PXSL (contains directives)
   * @param {string} source - Shader source code
   * @returns {boolean}
   */
  static isPXSL(source) {
    return /@(vertex|fragment|shader|effect)\b/.test(source);
  }

  /**
   * Validate PXSL syntax without generating code
   * @param {string} source - PXSL source code
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(source) {
    const errors = [];

    try {
      const lexer = new PXSLLexer(source);
      const tokens = lexer.tokenize();
      const parser = new PXSLParser(tokens);
      parser.parse();
    } catch (e) {
      errors.push(e.message);
    }

    return { valid: errors.length === 0, errors };
  }
}

export default PXSLTranspiler;
