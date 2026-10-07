/*
 * ---------------------------------------------------------------
 *          PixoSpritz – Editor – DocumentRegistry
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-03) Typed document adapters, registered by declared document
 * kind.  Each adapter provides load / migrate / validate /
 * serialize.  Unknown kinds fall back to a raw passthrough adapter
 * so unfamiliar files remain inspectable instead of crashing tools.
 *
 * Document kinds used by the editor: map, tileset, sprite, script,
 * cutscene, image, audio, geometry, json, text, unknown.
 */

/**
 * @typedef {Object} DocumentAdapter
 * @property {string} kind
 * @property {(raw: string|Uint8Array, path: string) => *} load
 * @property {(data: *, path: string) => *} migrate
 * @property {(data: *, path: string) => Array<{severity:'error'|'warning', message:string, at?:string}>} validate
 * @property {(data: *, path: string) => string|Uint8Array} serialize
 */

const passthroughAdapter = {
  kind: 'unknown',
  load: raw => (typeof raw === 'string' ? raw : raw),
  migrate: data => data,
  validate: () => [],
  serialize: data => (typeof data === 'string' ? data : data),
};

export class DocumentRegistry {
  constructor() {
    /** @type {Map<string, DocumentAdapter>} */
    this.adapters = new Map();
    /** @type {Map<string, string>} extension -> kind */
    this.byExtension = new Map();
  }

  /**
   * @param {DocumentAdapter} adapter
   * @param {string[]} [extensions] e.g. ['.json']
   */
  register(adapter, extensions = []) {
    if (!adapter || typeof adapter.kind !== 'string') {
      throw new Error('DocumentRegistry: adapter must declare a string kind');
    }
    for (const key of ['load', 'migrate', 'validate', 'serialize']) {
      if (typeof adapter[key] !== 'function') {
        throw new Error(`DocumentRegistry: adapter "${adapter.kind}" missing ${key}()`);
      }
    }
    this.adapters.set(adapter.kind, adapter);
    for (const ext of extensions) this.byExtension.set(ext.toLowerCase(), adapter.kind);
    return this;
  }

  /** Resolve a kind from an explicit kind or a file path's extension. */
  resolveKind({ kind, path } = {}) {
    if (kind && this.adapters.has(kind)) return kind;
    if (path) {
      const dot = path.lastIndexOf('.');
      if (dot >= 0) {
        const hit = this.byExtension.get(path.slice(dot).toLowerCase());
        if (hit) return hit;
      }
    }
    return 'unknown';
  }

  adapterFor(kind) {
    return this.adapters.get(kind) || passthroughAdapter;
  }

  /** Load raw bytes into a migrated, validated model. */
  loadDocument(raw, { kind, path = '' } = {}) {
    const resolved = this.resolveKind({ kind, path });
    const adapter = this.adapterFor(resolved);
    const migrated = adapter.migrate(adapter.load(raw, path), path);
    const issues = adapter.validate(migrated, path);
    return { kind: resolved, data: migrated, issues };
  }

  serializeDocument(kind, data, path = '') {
    return this.adapterFor(kind).serialize(data, path);
  }

  validateDocument(kind, data, path = '') {
    return this.adapterFor(kind).validate(data, path);
  }

  kinds() {
    return [...this.adapters.keys()];
  }
}

/** Shared JSON helpers for adapters. */
export const jsonAdapterBase = {
  load(raw) {
    const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    return JSON.parse(text);
  },
  serialize(data) {
    return `${JSON.stringify(data, null, 2)}\n`;
  },
};

function issuesError(message, at) {
  return { severity: 'error', message, at };
}
function issuesWarning(message, at) {
  return { severity: 'warning', message, at };
}

/** Register the editor's built-in document kinds. */
export function registerBuiltins(registry) {
  registry.register(
    {
      kind: 'json',
      ...jsonAdapterBase,
      migrate: d => d,
      validate: () => [],
    },
    ['.json']
  );

  registry.register(
    {
      kind: 'text',
      load: raw => (typeof raw === 'string' ? raw : new TextDecoder().decode(raw)),
      migrate: d => d,
      validate: () => [],
      serialize: d => String(d),
    },
    ['.txt', '.md']
  );

  registry.register(
    {
      kind: 'script',
      ...jsonAdapterBase,
      load(raw) {
        // Scripts may be raw source text (.pxs/.pxsl) or JSON descriptors.
        const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
        const trimmed = text.trimStart();
        if (trimmed.startsWith('{')) return JSON.parse(text);
        return { source: text, language: 'pixoscript' };
      },
      migrate(data) {
        if (typeof data === 'string') return { source: data, language: 'pixoscript' };
        return { language: 'pixoscript', ...data };
      },
      validate(data) {
        const issues = [];
        if (!data || typeof data.source !== 'string') issues.push(issuesError('script has no source text', 'source'));
        return issues;
      },
      serialize(data) {
        if (data && typeof data.source === 'string' && Object.keys(data).length <= 2) {
          return data.source.endsWith('\n') ? data.source : `${data.source}\n`;
        }
        return `${JSON.stringify(data, null, 2)}\n`;
      },
    },
    ['.pxs', '.pxsl', '.js']
  );

  registry.register(
    {
      kind: 'map',
      ...jsonAdapterBase,
      migrate(data) {
        const m = { ...data };
        if (!Array.isArray(m.layers)) m.layers = [];
        if (typeof m.width !== 'number') m.width = 16;
        if (typeof m.height !== 'number') m.height = 16;
        return m;
      },
      validate(data) {
        const issues = [];
        if (!data || typeof data !== 'object') return [issuesError('map is not an object')];
        for (const [i, layer] of (data.layers || []).entries()) {
          if (!Array.isArray(layer.cells)) {
            issues.push(issuesError(`layer ${i} has no cells array`, `layers[${i}].cells`));
          }
        }
        if (data.width <= 0 || data.height <= 0) {
          issues.push(issuesWarning('map has non-positive dimensions', 'width/height'));
        }
        return issues;
      },
    },
    ['.pixomap.json']
  );

  registry.register(
    {
      kind: 'tileset',
      ...jsonAdapterBase,
      migrate: d => ({ tiles: [], ...d }),
      validate(data) {
        const issues = [];
        if (!Array.isArray(data?.tiles)) issues.push(issuesError('tileset has no tiles array', 'tiles'));
        return issues;
      },
    },
    ['.tileset.json']
  );

  registry.register(
    {
      kind: 'sprite',
      ...jsonAdapterBase,
      migrate: d => ({ frames: [], ...d }),
      validate(data) {
        const issues = [];
        if (!Array.isArray(data?.frames)) issues.push(issuesError('sprite has no frames array', 'frames'));
        return issues;
      },
    },
    ['.sprite.json']
  );

  registry.register(
    {
      kind: 'cutscene',
      ...jsonAdapterBase,
      migrate: d => ({ events: [], ...d }),
      validate(data) {
        const issues = [];
        if (!Array.isArray(data?.events)) issues.push(issuesError('cutscene has no events array', 'events'));
        return issues;
      },
    },
    ['.pxc', '.cutscene.json']
  );

  for (const kind of ['image', 'audio', 'geometry']) {
    registry.register(
      {
        kind,
        load: raw => raw,
        migrate: d => d,
        validate: () => [],
        serialize: d => d,
      },
      []
    );
  }
  registry.byExtension.set('.png', 'image');
  registry.byExtension.set('.jpg', 'image');
  registry.byExtension.set('.jpeg', 'image');
  registry.byExtension.set('.wav', 'audio');
  registry.byExtension.set('.mp3', 'audio');
  registry.byExtension.set('.ogg', 'audio');
  registry.byExtension.set('.obj', 'geometry');

  return registry;
}

export function createDefaultRegistry() {
  return registerBuiltins(new DocumentRegistry());
}
