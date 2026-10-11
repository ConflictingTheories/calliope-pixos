/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

// Shaders
import DynamicSpritz from '@Engine/dynamic/spritz.js';
import SpritzBase from '@Engine/core/scene/spritz.js';
import World from '@Engine/core/scene/world.js';
import JSZip from 'jszip';
import { debug } from '@Engine/utils/debug-logger.js';
import Resources from '@Engine/utils/resources.js';
import { validateManifest } from 'pixospritz-specs/validator';
import { migrateManifest } from 'pixospritz-specs/migrations';
import { validateSemantics } from 'pixospritz-specs/semantic';
import { buildAssetGraph } from 'pixospritz-specs/asset-graph';

/**
 * Typed error for package validation failures — P1-09.
 * Invalid or future packages fail with this (carrying structured issues),
 * never with partial scene state.
 */
export class PackageValidationError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = 'PackageValidationError';
    this.code = 'PACKAGE_VALIDATION_FAILED';
    this.issues = issues;
  }
}

/**
 * PixozinePlayer — the real pixozine package player (P1-09).
 *
 * Replaces the former 18-line stub. Every load path validates the manifest
 * with the shared specs validator and migrates it to the canonical format
 * BEFORE any scene is created. `inspectArchive` / `inspectManifest` provide
 * an inspection mode that never executes scripts.
 *
 * User-facing naming uses "pixozine"; internal identifiers (manifest.json,
 * .pxz, initialZones) are unchanged (PIXOZINE_FORMAT.md).
 */
export default class SpritzPlayer extends DynamicSpritz {
  /** The validated + migrated manifest for the loaded package (null until loaded). */
  validatedManifest = null;

  /**
   * Validate and migrate a manifest document. Pure: never executes scripts.
   * @param {object} manifest - raw manifest JSON
   * @returns {{ manifest: object, warnings: Array, info: Array, migration: string }}
   * @throws {PackageValidationError} on structural or semantic errors
   */
  static prepareManifest(manifest) {
    let migrated;
    let applied = [];
    try {
      const result = migrateManifest(manifest);
      migrated = result.manifest;
      applied = result.applied;
    } catch (e) {
      throw new PackageValidationError(`Package migration failed: ${e.message}`, [
        { code: 'migration-failed', path: '', severity: 'error', message: e.message },
      ]);
    }

    const structural = validateManifest(migrated);
    const errors = structural.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      throw new PackageValidationError(
        `Invalid pixozine manifest: ${errors.length} error(s)`,
        structural.issues
      );
    }

    const semantic = validateSemantics(migrated);
    const semErrors = semantic.issues.filter(i => i.severity === 'error');
    if (semErrors.length > 0) {
      throw new PackageValidationError(
        `Pixozine manifest failed semantic checks: ${semErrors.length} error(s)`,
        [...structural.issues, ...semantic.issues]
      );
    }

    return {
      manifest: migrated,
      warnings: [...structural.issues, ...semantic.issues].filter(i => i.severity === 'warning'),
      info: [...structural.issues, ...semantic.issues].filter(i => i.severity === 'info'),
      migration: applied.join(', ') || 'no-op',
    };
  }

  /**
   * Inspect a pixozine archive WITHOUT executing anything — P1-09.
   * @param {ArrayBuffer|Uint8Array} data - raw .pxz bytes
   * @returns {Promise<object>} inspection report (never throws for invalid
   *   packages; reports valid:false with issues instead)
   */
  static async inspectArchive(data) {
    const zip = await JSZip.loadAsync(data);
    const entry = zip.file('manifest.json');
    if (!entry) {
      return {
        valid: false,
        scriptsNotExecuted: true,
        issues: [
          {
            code: 'missing-manifest',
            path: '',
            severity: 'error',
            message: 'Archive has no manifest.json',
          },
        ],
      };
    }
    let raw;
    try {
      raw = JSON.parse(await entry.async('string'));
    } catch (e) {
      return {
        valid: false,
        scriptsNotExecuted: true,
        issues: [
          { code: 'bad-json', path: 'manifest.json', severity: 'error', message: e.message },
        ],
      };
    }
    const files = Object.keys(zip.files)
      .filter(n => !zip.files[n].dir)
      .sort();
    try {
      const prepared = SpritzPlayer.prepareManifest(raw);
      const sem = validateSemantics(prepared.manifest, { archiveFiles: files });
      const graph = buildAssetGraph(prepared.manifest, files);
      return {
        valid: sem.valid,
        scriptsNotExecuted: true,
        title: prepared.manifest.title,
        formatVersion: prepared.manifest.formatVersion,
        migration: prepared.migration,
        graphHash: graph.hash,
        assetCount: graph.nodes.length,
        issues: [...prepared.warnings, ...prepared.info, ...sem.issues],
      };
    } catch (e) {
      if (e instanceof PackageValidationError) {
        return { valid: false, scriptsNotExecuted: true, issues: e.issues };
      }
      throw e;
    }
  }

  /**
   * Validated manifest-URL load: fetch -> validate/migrate -> scene creation.
   * @param {string} url - URL to manifest.json
   */
  loadValidatedFromManifest = async url => {
    debug('PixozinePlayer', 'Loading from manifest URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new PackageValidationError(`Failed to fetch manifest: ${response.status} ${response.statusText}`, [
        { code: 'fetch-failed', path: '', severity: 'error', message: `${response.status} ${response.statusText}` },
      ]);
    }
    const raw = await response.json();
    const prepared = SpritzPlayer.prepareManifest(raw);
    this.validatedManifest = prepared.manifest;
    debug('PixozinePlayer', `Manifest valid (${prepared.migration})`, prepared.manifest.title);

    const basePath = url.substring(0, url.lastIndexOf('/'));
    Resources.setBasePath(basePath);
    const manifest = prepared.manifest;

    if (manifest.network && manifest.network.url) {
      debug('PixozinePlayer', 'Network connection found -- attempting connection');
      this.engine.networkManager.connect(manifest.network.url);
    }

    const world = (SpritzBase._instance.world = new World(SpritzBase._instance, 'dynamic'));
    for (const zone of manifest.initialZones) {
      await world.loadZone(zone, true, false, { effect: 'cross', duration: 500 });
    }
    world.isPaused = false;
    SpritzBase._instance.loaded = true;
  };

  /**
   * Override: route manifest-URL loads through validation.
   */
  loadFromManifest = async url => {
    try {
      await this.loadValidatedFromManifest(url);
    } catch (e) {
      debug('PixozinePlayer', 'Validated load failed:', e.message);
      if (this.engine.triggerError) this.engine.triggerError(e);
      throw e;
    }
  };

  /**
   * Validated zip load: manifest is validated BEFORE any zone is created.
   * @param {File|Blob} file - .pxz file
   * @param {object|null} menu - start menu to complete
   */
  loadValidatedZip = async (file, menu) => {
    const zip = await JSZip.loadAsync(file);
    SpritzBase._instance.zip = zip;

    const entry = zip.file('manifest.json');
    if (!entry) {
      throw new PackageValidationError('Archive has no manifest.json', [
        { code: 'missing-manifest', path: '', severity: 'error', message: 'Archive has no manifest.json' },
      ]);
    }
    const prepared = SpritzPlayer.prepareManifest(JSON.parse(await entry.async('string')));
    this.validatedManifest = prepared.manifest;
    const manifest = prepared.manifest;
    debug('PixozinePlayer', `Zip manifest valid (${prepared.migration})`, manifest.title);

    if (manifest.network && manifest.network.url) {
      this.engine.networkManager.connect(manifest.network.url);
    }

    const world = SpritzBase._instance.world;
    for (const zone of manifest.initialZones) {
      await world.loadZoneFromZip(zone, zip, true, { effect: 'cross', duration: 500 });
    }
    world.isPaused = false;
    if (menu) menu.completed = true;
    SpritzBase._instance.loaded = true;
  };

  init = async engine => {
    SpritzBase._instance.loaded = false;
    SpritzBase._instance.engine = engine;
    SpritzBase._instance.world = new World(SpritzBase._instance, 'dynamic');
    const world = SpritzBase._instance.world;

    // Manifest-URL path: validated load.
    if (engine.manifestUrl && !engine.manifestUrl.endsWith('/null')) {
      try {
        await this.loadValidatedFromManifest(engine.manifestUrl);
      } catch (e) {
        if (engine.triggerError) engine.triggerError(e);
      }
      return;
    }

    // Zip path: same start-menu flow as the base class, but the manifest is
    // validated before any zone is created (P1-09).
    const loadZipFile = (menu, skipClick = false) => {
      if (!skipClick || engine.fileUpload.files.length === 0) {
        engine.fileUpload.click();
        engine.fileUpload.onchange = async () => {
          try {
            await this.loadValidatedZip(engine.fileUpload.files[0], menu);
          } catch (e) {
            debug('PixozinePlayer', 'Zip load failed:', e.message);
            if (engine.triggerError) engine.triggerError(e);
          }
        };
        return;
      }
      this.loadValidatedZip(engine.fileUpload.files[0], menu).catch(e => {
        if (engine.triggerError) engine.triggerError(e);
      });
    };

    world.startMenu({
      start: {
        pausable: false,
        text: 'Load Pixozine File',
        prompt: 'Please select a pixozine (.pxz) file...',
        x: engine.screenSize().width / 2 - 75,
        y: engine.screenSize().height / 2 - 50,
        w: 150,
        h: 75,
        quittable: false,
        colours: { top: '#333', bottom: '#777', background: '#999', text: '#fff' },
        onEnter: true,
        onOpen: () => {
          this.isPaused = true;
        },
        trigger: menu => {
          loadZipFile(menu);
        },
      },
    });
  };

  /**
   * Mount a spritz bundle into a DOM element for embedded playback.
   * Used by SVRN reader's PlayableEmbed to run games inside zines.
   * Creates a full engine instance (no React required) and starts the game loop.
   *
   * @param {HTMLElement} el - DOM element to mount into
   * @param {ArrayBuffer|Uint8Array} bundleData - Raw .spritz bundle bytes
   * @param {object} [options] - Mount options
   * @param {string} [options.manifestHash] - Expected SHA-256 hash for verification
   * @param {number} [options.width=480] - Viewport width
   * @param {number} [options.height=640] - Viewport height
   * @returns {Promise<{ player: SpritzPlayer, engine: GLEngine, manifest: object, dispose: Function }>}
   */
  static async mountBundle(el, bundleData, options = {}) {
    if (!el) throw new Error('mountBundle: element is required');
    if (!bundleData) throw new Error('mountBundle: bundle data is required');

    const width = options.width || 480;
    const height = options.height || 640;

    // Verify hash if provided
    if (options.manifestHash) {
      const hash = await crypto.subtle.digest('SHA-256', bundleData);
      const hex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const expected = options.manifestHash.replace(/^sha256:/, '');
      if (hex !== expected) {
        throw new Error(`mountBundle: hash mismatch (expected ${expected}, got ${hex})`);
      }
    }

    // Load and validate the bundle
    const zip = await JSZip.loadAsync(bundleData);
    const manifestEntry = zip.file('manifest.json') || zip.file('spritz.json');
    if (!manifestEntry) {
      throw new Error('mountBundle: bundle has no manifest.json');
    }

    const rawManifest = JSON.parse(await manifestEntry.async('string'));
    const prepared = SpritzPlayer.prepareManifest(rawManifest);

    // Create canvases (main, hud, mipmap, gamepad)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const hudCanvas = document.createElement('canvas');
    hudCanvas.width = width;
    hudCanvas.height = height;
    hudCanvas.style.position = 'absolute';
    hudCanvas.style.top = '0';
    hudCanvas.style.left = '0';
    hudCanvas.style.width = '100%';
    hudCanvas.style.height = '100%';
    hudCanvas.style.pointerEvents = 'none';

    const mipmapCanvas = document.createElement('canvas');
    const gamepadCanvas = document.createElement('canvas');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    // Container for relative positioning
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.appendChild(canvas);
    container.appendChild(hudCanvas);
    el.appendChild(container);

    // Dynamically import engine to avoid circular deps
    const { default: GLEngine } = await import('@Engine/core/index.js');

    // Create engine
    const engine = new GLEngine(canvas, hudCanvas, mipmapCanvas, gamepadCanvas, fileInput, width, height);
    engine.manifestUrl = null; // Bundle is provided directly, not via URL

    // Create player (SpritzProvider)
    const player = new SpritzPlayer();
    player.manifest = prepared.manifest;
    player.bundleZip = zip; // Provide zip for asset loading

    // Error handler
    engine.triggerError = err => {
      console.error('SpritzPlayer mountBundle error:', err);
    };

    // Initialize engine with player
    await engine.init(player);

    // Set up input listeners on hud canvas
    const onKey = e => {
      try {
        if (player.onKeyEvent) player.onKeyEvent(e);
      } catch (err) {}
    };
    const onTouch = e => {
      try {
        if (player.onTouchEvent) player.onTouchEvent(e);
      } catch (err) {}
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    hudCanvas.addEventListener('touchstart', onTouch, { passive: false });
    hudCanvas.addEventListener('touchmove', onTouch, { passive: false });
    hudCanvas.addEventListener('touchend', onTouch, { passive: false });
    hudCanvas.addEventListener('mousedown', onTouch);
    hudCanvas.addEventListener('mouseup', onTouch);
    hudCanvas.addEventListener('mousemove', onTouch);

    // Start the game loop
    engine.render();

    const dispose = () => {
      // Stop the render loop
      if (engine.requestId) {
        cancelAnimationFrame(engine.requestId);
        engine.requestId = null;
      }
      // Remove listeners
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      // Remove DOM
      if (container.parentNode === el) {
        el.removeChild(container);
      }
      // Close engine
      if (engine.close) engine.close();
    };

    return {
      player,
      engine,
      manifest: prepared.manifest,
      warnings: prepared.warnings,
      canvas,
      dispose,
    };
  }
}
