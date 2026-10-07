/**
 * PixoSpritz package validator — P1-03.
 *
 * Compiles the JSON schemas in `../formats/*.schema.json` into validator
 * functions exposing validateManifest / validateMap / validateSave /
 * validateSprite. All validators return structured issues:
 *
 *   { valid: boolean, issues: Array<{ code, path, message, severity }> }
 *
 * Severity is one of 'error' | 'warning' | 'info'. `valid` is true only when
 * there are no 'error' issues.
 *
 * No console side effects: validation is pure. Pass `{ verbose: false }`
 * (default); callers format issues themselves.
 *
 * Compatibility policy hook (P1-02, held): pass `{ compatPolicy }` with
 * `{ checkFormatVersion(data) => issue[] }`. Until Kyle decides the policy,
 * the validator enforces structural validity only; unknown top-level fields
 * are allowed but reported as `unknown-field` info issues.
 *
 * Supported schema subset (covers every construct used in formats/*.schema.json):
 * type, const, enum, required, properties (recursive), items, pattern,
 * format:'uri', minItems, maxItems, minimum, maximum, additionalProperties.
 */

import manifestSchema from '../formats/manifest.schema.json' with { type: 'json' };
import mapSchema from '../formats/map.schema.json' with { type: 'json' };
import saveSchema from '../formats/save.schema.json' with { type: 'json' };
import spriteSchema from '../formats/sprite.schema.json' with { type: 'json' };

/** Stable, machine-readable issue codes. */
export const ISSUE_CODES = {
  MISSING_REQUIRED: 'missing-required',
  WRONG_TYPE: 'wrong-type',
  PATTERN_MISMATCH: 'pattern-mismatch',
  ENUM_MISMATCH: 'enum-mismatch',
  CONST_MISMATCH: 'const-mismatch',
  OUT_OF_RANGE: 'out-of-range',
  ARRAY_LENGTH: 'array-length',
  BAD_URI: 'bad-uri',
  UNKNOWN_FIELD: 'unknown-field',
  ADDITIONAL_FORBIDDEN: 'additional-forbidden',
  NOT_AN_OBJECT: 'not-an-object',
};

/** Very small URI sanity check (full RFC3986 validation is out of scope). */
function looksLikeUri(value) {
  return typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function checkType(value, expected, path, issues) {
  const actual = typeOf(value);
  if (expected === 'integer') {
    if (actual !== 'number' || !Number.isInteger(value)) {
      issues.push({
        code: ISSUE_CODES.WRONG_TYPE,
        path,
        severity: 'error',
        message: `Expected integer at ${path}, got ${actual}`,
      });
      return false;
    }
    return true;
  }
  if (actual !== expected) {
    issues.push({
      code: ISSUE_CODES.WRONG_TYPE,
      path,
      severity: 'error',
      message: `Expected ${expected} at ${path}, got ${actual}`,
    });
    return false;
  }
  return true;
}

/**
 * Validate a value against a (subset) JSON schema, appending issues.
 * @param {*} value - value under validation
 * @param {object} schema - schema node
 * @param {string} path - JSON-path-ish locator, e.g. "settings.resolution[0]"
 * @param {Array} issues - collector
 * @param {object} opts - { allowUnknownFields: boolean }
 */
function validateNode(value, schema, path, issues, opts) {
  if (!schema || typeof schema !== 'object') return;

  // const
  if ('const' in schema && value !== schema.const) {
    issues.push({
      code: ISSUE_CODES.CONST_MISMATCH,
      path,
      severity: 'error',
      message: `Expected constant ${JSON.stringify(schema.const)} at ${path}`,
    });
  }

  // enum
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    issues.push({
      code: ISSUE_CODES.ENUM_MISMATCH,
      path,
      severity: 'error',
      message: `Value at ${path} must be one of ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`,
    });
  }

  // type
  if (schema.type) {
    if (!checkType(value, schema.type, path, issues)) return;
  }

  // pattern
  if (schema.pattern && typeof value === 'string') {
    let re;
    try {
      re = new RegExp(schema.pattern);
    } catch {
      re = null;
    }
    if (re && !re.test(value)) {
      issues.push({
        code: ISSUE_CODES.PATTERN_MISMATCH,
        path,
        severity: 'error',
        message: `Value at ${path} does not match pattern ${schema.pattern}`,
      });
    }
  }

  // format: uri
  if (schema.format === 'uri' && typeof value === 'string' && !looksLikeUri(value)) {
    issues.push({
      code: ISSUE_CODES.BAD_URI,
      path,
      severity: 'error',
      message: `Value at ${path} is not a valid URI`,
    });
  }

  // numeric bounds
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      issues.push({
        code: ISSUE_CODES.OUT_OF_RANGE,
        path,
        severity: 'error',
        message: `Value at ${path} (${value}) is below minimum ${schema.minimum}`,
      });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      issues.push({
        code: ISSUE_CODES.OUT_OF_RANGE,
        path,
        severity: 'error',
        message: `Value at ${path} (${value}) is above maximum ${schema.maximum}`,
      });
    }
  }

  // arrays
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      issues.push({
        code: ISSUE_CODES.ARRAY_LENGTH,
        path,
        severity: 'error',
        message: `Array at ${path} has ${value.length} items, minimum is ${schema.minItems}`,
      });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      issues.push({
        code: ISSUE_CODES.ARRAY_LENGTH,
        path,
        severity: 'error',
        message: `Array at ${path} has ${value.length} items, maximum is ${schema.maxItems}`,
      });
    }
    if (schema.items && typeof schema.items === 'object') {
      value.forEach((item, i) => validateNode(item, schema.items, `${path}[${i}]`, issues, opts));
    }
    return;
  }

  // objects
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    if (Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in value)) {
          issues.push({
            code: ISSUE_CODES.MISSING_REQUIRED,
            path: path ? `${path}.${field}` : field,
            severity: 'error',
            message: `Missing required field: ${path ? `${path}.${field}` : field}`,
          });
        }
      }
    }
    const props = schema.properties || {};
    for (const [key, propSchema] of Object.entries(props)) {
      if (key in value) {
        validateNode(value[key], propSchema, path ? `${path}.${key}` : key, issues, opts);
      }
    }
    // Unknown fields: allowed but reported (P1-02 hook decides later whether to reject).
    for (const key of Object.keys(value)) {
      if (!(key in props)) {
        if (schema.additionalProperties === false) {
          issues.push({
            code: ISSUE_CODES.ADDITIONAL_FORBIDDEN,
            path: path ? `${path}.${key}` : key,
            severity: 'error',
            message: `Additional property not allowed: ${path ? `${path}.${key}` : key}`,
          });
        } else if (opts.reportUnknownFields !== false) {
          issues.push({
            code: ISSUE_CODES.UNKNOWN_FIELD,
            path: path ? `${path}.${key}` : key,
            severity: 'info',
            message: `Unknown field (allowed, pending P1-02 compatibility policy): ${path ? `${path}.${key}` : key}`,
          });
        }
      }
    }
  }
}

function compile(schema, name) {
  /**
   * @param {*} data - document to validate
   * @param {object} [opts] - { compatPolicy?: { checkFormatVersion?: (data) => issue[] }, reportUnknownFields?: boolean }
   * @returns {{ valid: boolean, issues: Array }}
   */
  return function validate(data, opts = {}) {
    const issues = [];
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      issues.push({
        code: ISSUE_CODES.NOT_AN_OBJECT,
        path: '',
        severity: 'error',
        message: `${name} document must be an object`,
      });
      return { valid: false, issues };
    }
    validateNode(data, schema, '', issues, opts);
    // P1-02 hook: compatibility policy plugs in here when decided.
    if (opts.compatPolicy && typeof opts.compatPolicy.checkFormatVersion === 'function') {
      for (const issue of opts.compatPolicy.checkFormatVersion(data) || []) {
        issues.push(issue);
      }
    }
    const valid = !issues.some(i => i.severity === 'error');
    return { valid, issues };
  };
}

export const validateManifest = compile(manifestSchema, 'manifest');
export const validateMap = compile(mapSchema, 'map');
export const validateSave = compile(saveSchema, 'save');
export const validateSprite = compile(spriteSchema, 'sprite');

export const schemas = {
  manifest: manifestSchema,
  map: mapSchema,
  save: saveSchema,
  sprite: spriteSchema,
};

export default {
  validateManifest,
  validateMap,
  validateSave,
  validateSprite,
  schemas,
  ISSUE_CODES,
};
