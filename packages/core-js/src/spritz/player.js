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
export default class PixozinePlayer extends DynamicSpritz {
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
      const prepared = PixozinePlayer.prepareManifest(raw);
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
    const prepared = PixozinePlayer.prepareManifest(raw);
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
    const prepared = PixozinePlayer.prepareManifest(JSON.parse(await entry.async('string')));
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
}
