"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PXSLTranspiler = void 0;
var _specification = require("./specification.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Transpiler - PixoSpritz Shader Language
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Transpiles PXSL (.pxsl) files to WebGL GLSL shaders.
 * Supports both vertex and fragment shaders in a single file.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/**
 * Token types for the PXSL lexer
 */
var TokenType = {
  DIRECTIVE: 'DIRECTIVE',
  // @vertex, @fragment, @shader, @effect
  KEYWORD: 'KEYWORD',
  // input, output, uniform, const, let, main
  IDENTIFIER: 'IDENTIFIER',
  // Variable/function names
  TYPE: 'TYPE',
  // vec3, float, mat4, etc.
  NUMBER: 'NUMBER',
  // 1.0, 42, etc.
  STRING: 'STRING',
  // "shader_name"
  OPERATOR: 'OPERATOR',
  // =, +, -, *, /, etc.
  PUNCTUATION: 'PUNCTUATION',
  // :, {, }, (, ), etc.
  COMMENT: 'COMMENT',
  // // or /* */
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

/**
 * PXSL Lexer - Tokenizes PXSL source code
 */
var PXSLLexer = /*#__PURE__*/function () {
  function PXSLLexer(source) {
    _classCallCheck(this, PXSLLexer);
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }
  return _createClass(PXSLLexer, [{
    key: "peek",
    value: function peek() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return this.source[this.pos + offset];
    }
  }, {
    key: "advance",
    value: function advance() {
      var _char = this.source[this.pos++];
      if (_char === '\n') {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
      return _char;
    }
  }, {
    key: "isAtEnd",
    value: function isAtEnd() {
      return this.pos >= this.source.length;
    }
  }, {
    key: "isAlpha",
    value: function isAlpha(_char2) {
      return /[a-zA-Z_]/.test(_char2);
    }
  }, {
    key: "isAlphaNumeric",
    value: function isAlphaNumeric(_char3) {
      return /[a-zA-Z0-9_]/.test(_char3);
    }
  }, {
    key: "isDigit",
    value: function isDigit(_char4) {
      return /[0-9]/.test(_char4);
    }
  }, {
    key: "isWhitespace",
    value: function isWhitespace(_char5) {
      return /[ \t\r]/.test(_char5);
    }
  }, {
    key: "skipWhitespace",
    value: function skipWhitespace() {
      while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
        this.advance();
      }
    }
  }, {
    key: "readString",
    value: function readString() {
      var quote = this.advance(); // consume opening quote
      var value = '';
      while (!this.isAtEnd() && this.peek() !== quote) {
        if (this.peek() === '\\') {
          this.advance();
          value += this.advance();
        } else {
          value += this.advance();
        }
      }
      if (!this.isAtEnd()) this.advance(); // consume closing quote
      return {
        type: TokenType.STRING,
        value: value,
        line: this.line,
        col: this.col
      };
    }
  }, {
    key: "readNumber",
    value: function readNumber() {
      var value = '';
      var startCol = this.col;

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
      return {
        type: TokenType.NUMBER,
        value: value,
        line: this.line,
        col: startCol
      };
    }
  }, {
    key: "readIdentifier",
    value: function readIdentifier() {
      var value = '';
      var startCol = this.col;
      while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
        value += this.advance();
      }

      // Check for keywords
      var keywords = ['input', 'output', 'uniform', 'const', 'let', 'main', 'if', 'else', 'for', 'while', 'return', 'discard', 'struct'];
      var types = Object.keys(_specification.PXSL_TYPE_ALIASES);
      if (keywords.includes(value)) {
        return {
          type: TokenType.KEYWORD,
          value: value,
          line: this.line,
          col: startCol
        };
      } else if (types.includes(value)) {
        return {
          type: TokenType.TYPE,
          value: value,
          line: this.line,
          col: startCol
        };
      }
      return {
        type: TokenType.IDENTIFIER,
        value: value,
        line: this.line,
        col: startCol
      };
    }
  }, {
    key: "readDirective",
    value: function readDirective() {
      this.advance(); // consume @
      var value = '@';
      while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
        value += this.advance();
      }
      return {
        type: TokenType.DIRECTIVE,
        value: value,
        line: this.line,
        col: this.col
      };
    }
  }, {
    key: "readLineComment",
    value: function readLineComment() {
      var value = '';
      this.advance(); // consume first /
      this.advance(); // consume second /
      while (!this.isAtEnd() && this.peek() !== '\n') {
        value += this.advance();
      }
      return {
        type: TokenType.COMMENT,
        value: '//' + value,
        line: this.line,
        col: this.col
      };
    }
  }, {
    key: "readBlockComment",
    value: function readBlockComment() {
      var value = '';
      this.advance(); // consume /
      this.advance(); // consume *
      while (!this.isAtEnd() && !(this.peek() === '*' && this.peek(1) === '/')) {
        value += this.advance();
      }
      if (!this.isAtEnd()) {
        this.advance(); // consume *
        this.advance(); // consume /
      }
      return {
        type: TokenType.COMMENT,
        value: '/*' + value + '*/',
        line: this.line,
        col: this.col
      };
    }
  }, {
    key: "tokenize",
    value: function tokenize() {
      while (!this.isAtEnd()) {
        this.skipWhitespace();
        if (this.isAtEnd()) break;
        var _char6 = this.peek();

        // Newline
        if (_char6 === '\n') {
          this.tokens.push({
            type: TokenType.NEWLINE,
            value: '\n',
            line: this.line,
            col: this.col
          });
          this.advance();
          continue;
        }

        // Comments
        if (_char6 === '/' && this.peek(1) === '/') {
          this.tokens.push(this.readLineComment());
          continue;
        }
        if (_char6 === '/' && this.peek(1) === '*') {
          this.tokens.push(this.readBlockComment());
          continue;
        }

        // Directives (@vertex, @fragment, etc.)
        if (_char6 === '@') {
          this.tokens.push(this.readDirective());
          continue;
        }

        // Strings
        if (_char6 === '"' || _char6 === "'") {
          this.tokens.push(this.readString());
          continue;
        }

        // Numbers
        if (this.isDigit(_char6) || _char6 === '-' && this.isDigit(this.peek(1)) || _char6 === '.' && this.isDigit(this.peek(1))) {
          this.tokens.push(this.readNumber());
          continue;
        }

        // Identifiers and keywords
        if (this.isAlpha(_char6)) {
          this.tokens.push(this.readIdentifier());
          continue;
        }

        // Multi-character operators
        var twoChar = _char6 + (this.peek(1) || '');
        var multiOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='];
        if (multiOps.includes(twoChar)) {
          this.tokens.push({
            type: TokenType.OPERATOR,
            value: twoChar,
            line: this.line,
            col: this.col
          });
          this.advance();
          this.advance();
          continue;
        }

        // Single-character operators
        var ops = '=+-*/<>!&|^~%';
        if (ops.includes(_char6)) {
          this.tokens.push({
            type: TokenType.OPERATOR,
            value: _char6,
            line: this.line,
            col: this.col
          });
          this.advance();
          continue;
        }

        // Punctuation
        var punct = '{}[]():;,.';
        if (punct.includes(_char6)) {
          this.tokens.push({
            type: TokenType.PUNCTUATION,
            value: _char6,
            line: this.line,
            col: this.col
          });
          this.advance();
          continue;
        }

        // Unknown character - skip it
        this.advance();
      }
      this.tokens.push({
        type: TokenType.EOF,
        value: '',
        line: this.line,
        col: this.col
      });
      return this.tokens;
    }
  }]);
}();
/**
 * PXSL Parser - Parses tokens into an AST
 */
var PXSLParser = /*#__PURE__*/function () {
  function PXSLParser(tokens) {
    _classCallCheck(this, PXSLParser);
    this.tokens = tokens.filter(function (t) {
      return t.type !== TokenType.NEWLINE && t.type !== TokenType.COMMENT;
    });
    this.pos = 0;
    this.ast = {
      shaderName: null,
      vertex: null,
      fragment: null,
      effects: []
    };
  }
  return _createClass(PXSLParser, [{
    key: "peek",
    value: function peek() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return this.tokens[this.pos + offset];
    }
  }, {
    key: "advance",
    value: function advance() {
      return this.tokens[this.pos++];
    }
  }, {
    key: "isAtEnd",
    value: function isAtEnd() {
      return this.pos >= this.tokens.length || this.peek().type === TokenType.EOF;
    }
  }, {
    key: "expect",
    value: function expect(type) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var token = this.peek();
      if (token.type !== type || value !== null && token.value !== value) {
        throw new Error("PXSL Parse Error at line ".concat(token.line, ": Expected ").concat(type).concat(value ? " '".concat(value, "'") : '', ", got ").concat(token.type, " '").concat(token.value, "'"));
      }
      return this.advance();
    }
  }, {
    key: "match",
    value: function match(type) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var token = this.peek();
      if (token.type === type && (value === null || token.value === value)) {
        return this.advance();
      }
      return null;
    }
  }, {
    key: "parse",
    value: function parse() {
      while (!this.isAtEnd()) {
        var token = this.peek();
        if (token.type === TokenType.DIRECTIVE) {
          this.parseDirective();
        } else {
          // Skip unexpected tokens
          this.advance();
        }
      }
      return this.ast;
    }
  }, {
    key: "parseDirective",
    value: function parseDirective() {
      var directive = this.advance();
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
          throw new Error("Unknown directive: ".concat(directive.value));
      }
    }
  }, {
    key: "parseShaderBlock",
    value: function parseShaderBlock(type) {
      var block = {
        type: type,
        inputs: [],
        outputs: [],
        uniforms: [],
        constants: [],
        locals: [],
        mainBody: '',
        functions: []
      };

      // Parse declarations until we hit main or another directive
      while (!this.isAtEnd()) {
        var token = this.peek();
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
  }, {
    key: "parseVariableDecl",
    value: function parseVariableDecl(kind) {
      this.advance(); // consume keyword (input/output/uniform/let)
      var name = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.PUNCTUATION, ':');
      var typeToken = this.advance();
      var type = typeToken.value;

      // Check for array notation
      var arraySize = null;
      if (this.match(TokenType.PUNCTUATION, '[')) {
        arraySize = this.expect(TokenType.NUMBER).value;
        this.expect(TokenType.PUNCTUATION, ']');
      }

      // Check for default value
      var defaultValue = null;
      if (this.match(TokenType.OPERATOR, '=')) {
        defaultValue = this.parseExpression();
      }
      return {
        kind: kind,
        name: name,
        type: type,
        arraySize: arraySize,
        defaultValue: defaultValue
      };
    }
  }, {
    key: "parseConstDecl",
    value: function parseConstDecl() {
      this.advance(); // consume 'const'
      var name = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.OPERATOR, '=');
      var value = this.parseExpression();
      return {
        name: name,
        value: value
      };
    }
  }, {
    key: "parseMainBlock",
    value: function parseMainBlock() {
      this.advance(); // consume 'main'
      this.expect(TokenType.PUNCTUATION, '{');
      var body = '';
      var braceDepth = 1;
      while (!this.isAtEnd() && braceDepth > 0) {
        var token = this.advance();
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
  }, {
    key: "parseExpression",
    value: function parseExpression() {
      // Simple expression parser - collects tokens until we hit a statement terminator
      var expr = '';
      var parenDepth = 0;
      var braceDepth = 0;
      while (!this.isAtEnd()) {
        var token = this.peek();
        if (token.type === TokenType.PUNCTUATION) {
          if (token.value === '(') parenDepth++;else if (token.value === ')') parenDepth--;else if (token.value === '{') braceDepth++;else if (token.value === '}') braceDepth--;
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
  }, {
    key: "parseEffectBlock",
    value: function parseEffectBlock() {
      var name = this.expect(TokenType.STRING).value;
      this.expect(TokenType.PUNCTUATION, '{');
      var properties = {};
      var braceDepth = 1;
      while (!this.isAtEnd() && braceDepth > 0) {
        var token = this.peek();
        if (token.type === TokenType.PUNCTUATION && token.value === '}') {
          braceDepth--;
          this.advance();
          continue;
        }
        if (token.type === TokenType.IDENTIFIER) {
          var propName = this.advance().value;
          this.expect(TokenType.PUNCTUATION, ':');
          properties[propName] = this.parseExpression();
        } else {
          this.advance();
        }
      }
      return {
        name: name,
        properties: properties
      };
    }
  }]);
}();
/**
 * PXSL Code Generator - Generates GLSL from AST
 */
var PXSLCodeGenerator = /*#__PURE__*/function () {
  function PXSLCodeGenerator(ast) {
    _classCallCheck(this, PXSLCodeGenerator);
    this.ast = ast;
    this.usedBuiltins = new Set();
  }
  return _createClass(PXSLCodeGenerator, [{
    key: "generate",
    value: function generate() {
      var result = {
        name: this.ast.shaderName,
        vs: null,
        fs: null
      };
      if (this.ast.vertex) {
        result.vs = this.generateShader(this.ast.vertex, 'vertex');
      }
      if (this.ast.fragment) {
        result.fs = this.generateShader(this.ast.fragment, 'fragment');
      }
      return result;
    }
  }, {
    key: "generateShader",
    value: function generateShader(block, type) {
      var lines = [];
      this.usedBuiltins.clear();

      // Add precision header
      lines.push(_specification.PXSL_HEADERS[type]);

      // Scan main body for builtin function usage
      this.scanForBuiltins(block.mainBody);

      // Add used builtins first (for dependencies like noise -> fbm)
      var builtinCode = this.generateBuiltins();
      if (builtinCode) {
        lines.push('// PXSL Built-in Functions');
        lines.push(builtinCode);
        lines.push('');
      }

      // Generate constants
      var _iterator = _createForOfIteratorHelper(block.constants),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var c = _step.value;
          lines.push("const float ".concat(c.name, " = ").concat(c.value, ";"));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (block.constants.length > 0) lines.push('');

      // Generate inputs (attributes for vertex, varyings for fragment)
      var _iterator2 = _createForOfIteratorHelper(block.inputs),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var input = _step2.value;
          var glslType = _specification.PXSL_TYPE_ALIASES[input.type] || input.type;
          var glslName = _specification.PXSL_INPUT_MAPPINGS[input.name] || input.name;
          if (type === 'vertex') {
            // Vertex shader inputs are attributes
            lines.push("attribute ".concat(glslType, " ").concat(glslName, ";"));
          } else {
            // Fragment shader inputs are varyings (received from vertex)
            lines.push("varying ".concat(glslType, " ").concat(input.name, ";"));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (block.inputs.length > 0) lines.push('');

      // Generate outputs (varyings for vertex, nothing special for fragment)
      var _iterator3 = _createForOfIteratorHelper(block.outputs),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var output = _step3.value;
          var _glslType = _specification.PXSL_TYPE_ALIASES[output.type] || output.type;
          if (type === 'vertex') {
            // Vertex outputs become varyings
            lines.push("varying ".concat(_glslType, " ").concat(output.name, ";"));
          }
          // Fragment outputs use gl_FragColor directly
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      if (block.outputs.length > 0) lines.push('');

      // Generate uniforms
      var _iterator4 = _createForOfIteratorHelper(block.uniforms),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var uniform = _step4.value;
          var _glslType2 = _specification.PXSL_TYPE_ALIASES[uniform.type] || uniform.type;
          var _glslName = _specification.PXSL_UNIFORM_MAPPINGS[uniform.name] || "u".concat(uniform.name.charAt(0).toUpperCase()).concat(uniform.name.slice(1));
          var arrayPart = uniform.arraySize ? "[".concat(uniform.arraySize, "]") : '';
          lines.push("uniform ".concat(_glslType2, " ").concat(_glslName).concat(arrayPart, ";"));
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      if (block.uniforms.length > 0) lines.push('');

      // Generate local variables
      var _iterator5 = _createForOfIteratorHelper(block.locals),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var local = _step5.value;
          var _glslType3 = _specification.PXSL_TYPE_ALIASES[local.type] || local.type;
          var init = local.defaultValue ? " = ".concat(local.defaultValue) : '';
          lines.push("".concat(_glslType3, " ").concat(local.name).concat(init, ";"));
        }

        // Generate main function
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      lines.push('void main(void) {');
      lines.push(this.transformMainBody(block.mainBody, block, type));
      lines.push('}');
      return lines.join('\n');
    }
  }, {
    key: "scanForBuiltins",
    value: function scanForBuiltins(code) {
      // List of PXSL builtin function names
      var builtinNames = Object.keys(_specification.PXSL_BUILTINS);
      for (var _i = 0, _builtinNames = builtinNames; _i < _builtinNames.length; _i++) {
        var name = _builtinNames[_i];
        // Check if function is called in the code
        var regex = new RegExp("\\b".concat(name, "\\s*\\("), 'g');
        if (regex.test(code)) {
          this.usedBuiltins.add(name);

          // fbm depends on noise
          if (name === 'fbm') {
            this.usedBuiltins.add('noise');
          }
        }
      }
    }
  }, {
    key: "generateBuiltins",
    value: function generateBuiltins() {
      var code = [];

      // Order matters for dependencies
      var ordered = ['noise', 'fbm'].concat(_toConsumableArray(Array.from(this.usedBuiltins).filter(function (n) {
        return n !== 'noise' && n !== 'fbm';
      })));
      var _iterator6 = _createForOfIteratorHelper(ordered),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var name = _step6.value;
          if (this.usedBuiltins.has(name) && _specification.PXSL_BUILTINS[name]) {
            code.push(_specification.PXSL_BUILTINS[name]);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return code.join('\n\n');
    }
  }, {
    key: "transformMainBody",
    value: function transformMainBody(body, block, type) {
      var code = body;

      // Replace PXSL input names with GLSL names
      var _iterator7 = _createForOfIteratorHelper(block.inputs),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var input = _step7.value;
          if (type === 'vertex') {
            var glslName = _specification.PXSL_INPUT_MAPPINGS[input.name] || input.name;
            if (glslName !== input.name) {
              code = code.replace(new RegExp("\\b".concat(input.name, "\\b"), 'g'), glslName);
            }
          }
        }

        // Replace uniform names with GLSL conventions
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      var _iterator8 = _createForOfIteratorHelper(block.uniforms),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var uniform = _step8.value;
          var _glslName2 = _specification.PXSL_UNIFORM_MAPPINGS[uniform.name] || "u".concat(uniform.name.charAt(0).toUpperCase()).concat(uniform.name.slice(1));
          if (_glslName2 !== uniform.name) {
            code = code.replace(new RegExp("\\b".concat(uniform.name, "\\b"), 'g'), _glslName2);
          }
        }

        // Replace PXSL function calls with pxsl_ prefixed versions
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
      var _iterator9 = _createForOfIteratorHelper(this.usedBuiltins),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var name = _step9.value;
          code = code.replace(new RegExp("\\b".concat(name, "\\s*\\("), 'g'), "pxsl_".concat(name, "("));
        }

        // Handle fragment output (fragColor -> gl_FragColor)
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      if (type === 'fragment') {
        var _iterator0 = _createForOfIteratorHelper(block.outputs),
          _step0;
        try {
          for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
            var output = _step0.value;
            if (output.name.toLowerCase().includes('color') || output.name.toLowerCase().includes('frag')) {
              code = code.replace(new RegExp("\\b".concat(output.name, "\\b"), 'g'), 'gl_FragColor');
            }
          }
        } catch (err) {
          _iterator0.e(err);
        } finally {
          _iterator0.f();
        }
      }

      // Replace 'sample' with 'texture2D' if not already a builtin
      if (!this.usedBuiltins.has('sample')) {
        code = code.replace(/\bsample\s*\(/g, 'texture2D(');
      }

      // Indent each line
      return code.split('\n').map(function (line) {
        return '  ' + line.trim();
      }).join('\n');
    }
  }]);
}();
/**
 * Main PXSL Transpiler class
 */
var PXSLTranspiler = exports.PXSLTranspiler = /*#__PURE__*/function () {
  function PXSLTranspiler() {
    _classCallCheck(this, PXSLTranspiler);
  }
  return _createClass(PXSLTranspiler, null, [{
    key: "transpile",
    value:
    /**
     * Transpile PXSL source code to GLSL
     * @param {string} source - PXSL source code
     * @returns {{ name: string, vs: string, fs: string }} - Compiled shaders
     */
    function transpile(source) {
      // Lexer
      var lexer = new PXSLLexer(source);
      var tokens = lexer.tokenize();

      // Parser
      var parser = new PXSLParser(tokens);
      var ast = parser.parse();

      // Code Generator
      var generator = new PXSLCodeGenerator(ast);
      return generator.generate();
    }

    /**
     * Check if source appears to be PXSL (contains directives)
     * @param {string} source - Shader source code
     * @returns {boolean}
     */
  }, {
    key: "isPXSL",
    value: function isPXSL(source) {
      return /@(vertex|fragment|shader|effect)\b/.test(source);
    }

    /**
     * Validate PXSL syntax without generating code
     * @param {string} source - PXSL source code
     * @returns {{ valid: boolean, errors: string[] }}
     */
  }, {
    key: "validate",
    value: function validate(source) {
      var errors = [];
      try {
        var lexer = new PXSLLexer(source);
        var tokens = lexer.tokenize();
        var parser = new PXSLParser(tokens);
        parser.parse();
      } catch (e) {
        errors.push(e.message);
      }
      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  }]);
}();
var _default = exports["default"] = PXSLTranspiler;