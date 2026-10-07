import { describe, it, expect } from 'vitest';
import {
  fnv1aHex,
  stableStringify,
  buildBundleManifest,
  slugify,
  buildSvrnBundle,
  SVRN_BUNDLE_FORMAT,
  SVRN_BUNDLE_FORMAT_VERSION,
  PINNED_PLAYER_VERSION,
  BUNDLE_EXTENSION,
} from '../bundle.js';
import {
  uploadBundle,
  localDownloadTarget,
  createHubTarget,
  SvrnHubNotAvailableError,
} from '../upload.js';

describe('fnv1aHex', () => {
  it('matches the FNV-1a 32-bit test vectors', () => {
    expect(fnv1aHex('')).toBe('811c9dc5');
    expect(fnv1aHex('hello')).toBe('4f9f2cab');
  });

  it('accepts Uint8Array input identically to strings', () => {
    expect(fnv1aHex(new TextEncoder().encode('hello'))).toBe(fnv1aHex('hello'));
  });
});

describe('buildBundleManifest', () => {
  const files = [
    { path: 'b.txt', hash: '22222222', size: 2 },
    { path: 'a.txt', hash: '11111111', size: 1 },
  ];

  it('builds a well-formed manifest with sorted files', () => {
    const m = buildBundleManifest({ title: 'My Game', creator: 'kyle', files });
    expect(m.bundleFormat).toBe(SVRN_BUNDLE_FORMAT);
    expect(m.bundleFormatVersion).toBe(SVRN_BUNDLE_FORMAT_VERSION);
    expect(m.title).toBe('My Game');
    expect(m.creator).toBe('kyle');
    expect(m.playerVersion).toBe(PINNED_PLAYER_VERSION);
    expect(m.fileCount).toBe(2);
    expect(m.files.map(f => f.path)).toEqual(['a.txt', 'b.txt']);
    expect(typeof m.createdAt).toBe('string');
  });

  it('requires a title and a semver player version', () => {
    expect(() => buildBundleManifest({ title: '  ', files: [] })).toThrow(/title is required/);
    expect(() => buildBundleManifest({ title: 'T', files: [], playerVersion: 'latest' })).toThrow(
      /playerVersion must be semver/
    );
  });

  it('stableStringify is deterministic regardless of key order', () => {
    const a = stableStringify({ z: 1, a: { y: 2, b: 3 } });
    const b = stableStringify({ a: { b: 3, y: 2 }, z: 1 });
    expect(a).toBe(b);
  });
});

describe('slugify', () => {
  it('produces filename-safe slugs', () => {
    expect(slugify('My Cool Game!')).toBe('my-cool-game');
    expect(slugify('  --Hi--  ')).toBe('hi');
    expect(slugify('')).toBe('untitled');
  });
});

describe('buildSvrnBundle', () => {
  // Minimal fake zip: records files, returns canned bytes.
  function fakeZipImpl(record) {
    return async () => {
      return class {
        constructor() {
          this.files = record;
        }
        file(path, data) {
          this.files[path] = data;
        }
        async generateAsync() {
          return new Uint8Array([1, 2, 3]);
        }
      };
    };
  }

  function fakeRepository(entries) {
    return {
      async list() {
        return Object.keys(entries);
      },
      async exists(path) {
        return path in entries;
      },
      async read(path, options = {}) {
        const data = entries[path];
        if (data === undefined) throw new Error('not found');
        if (options.as === 'bytes') {
          return typeof data === 'string' ? new TextEncoder().encode(data) : data;
        }
        return typeof data === 'string' ? data : new TextDecoder().decode(data);
      },
    };
  }

  it('builds a bundle with payload/ entries and a manifest', async () => {
    const record = {};
    const repo = fakeRepository({
      'manifest.json': JSON.stringify({ formatVersion: '1.1.0', title: 'T' }),
      'maps/zone1.json': '{"tileset":"t"}',
    });
    const { bytes, manifest, filename } = await buildSvrnBundle({
      repository: repo,
      meta: { title: 'My Game', creator: 'kyle', tags: ['demo'] },
      zipImpl: fakeZipImpl(record),
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(filename).toBe(`my-game${BUNDLE_EXTENSION}`);
    expect(record['payload/manifest.json']).toBeDefined();
    expect(record['payload/maps/zone1.json']).toBeDefined();
    expect(typeof record['manifest.json']).toBe('string');
    const written = JSON.parse(record['manifest.json']);
    expect(written.title).toBe('My Game');
    expect(written.sourceFormatVersion).toBe('1.1.0');
    expect(written.files.find(f => f.path === 'maps/zone1.json').hash).toBe(
      fnv1aHex('{"tileset":"t"}')
    );
    expect(manifest.fileCount).toBe(2);
  });

  it('requires meta.title', async () => {
    await expect(
      buildSvrnBundle({ repository: fakeRepository({}), meta: { title: '' }, zipImpl: fakeZipImpl({}) })
    ).rejects.toThrow(/meta.title is required/);
  });
});

describe('uploadBundle', () => {
  const bundle = {
    bytes: new Uint8Array([1, 2, 3]),
    manifest: { title: 'T' },
    filename: 't.svrn',
  };

  it('delegates to the target upload function', async () => {
    const calls = [];
    const target = {
      name: 'test',
      async upload(args) {
        calls.push(args);
        return { url: 'https://hub.example/b/1' };
      },
    };
    const res = await uploadBundle(bundle, target, { onProgress: () => {} });
    expect(res.url).toBe('https://hub.example/b/1');
    expect(calls[0].bytes).toBe(bundle.bytes);
    expect(calls[0].filename).toBe('t.svrn');
    expect(typeof calls[0].onProgress).toBe('function');
  });

  it('rejects invalid bundles and targets', async () => {
    await expect(uploadBundle(null, localDownloadTarget)).rejects.toThrow(/bundle.bytes/);
    await expect(uploadBundle(bundle, {})).rejects.toThrow(/target/);
  });

  it('the hub target stub throws a typed not-available error', async () => {
    const hub = createHubTarget({ endpoint: 'https://hub.svrn.example' });
    expect(hub.name).toBe('svrn-hub');
    await expect(uploadBundle(bundle, hub)).rejects.toBeInstanceOf(SvrnHubNotAvailableError);
  });
});
