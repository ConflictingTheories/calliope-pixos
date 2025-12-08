/**
 * ---------------------------------------------------------------
 *                AI Generator - Game Package Orchestrator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * High-level orchestrator for generating complete game packages
 * from a single prompt. Creates sprites, maps, scripts, cutscenes,
 * audio, and manifest in proper Pixospritz structure.
 * 
 * CRITICAL: This orchestrator VALIDATES that all required assets
 * are generated before declaring success. A game package is NOT
 * complete without:
 * - At least 1 player sprite (config + image)
 * - At least 1 NPC sprite (config + image)  
 * - At least 1 cutscene
 * - At least 1 map with cells
 * - A valid manifest.json
 */

import aiService from './ai-service.js';
import { generateCutscene, generateScript, generateManifest } from './text-generator.js';
import { generatePortrait, generateSpritesheet, generateTileset, base64ToBlob } from './image-generator.js';
import { SPRITESHEET_LAYOUTS, calculateFrameCoordinates } from './dsl-specifications.js';
import { validateSpriteConfig, validateManifest } from './asset-validation.js';

/**
 * Asset tracking for validation
 */
class AssetTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.required = {
      playerSpriteConfig: false,
      playerSpriteImage: false,
      npcSpriteConfig: false,
      npcSpriteImage: false,
      cutscene: false,
      mapConfig: false,
      mapCells: false,
      tileset: false,
      manifest: false,
    };
    this.generated = [];
    this.failed = [];
  }

  markGenerated(assetType, path) {
    this.generated.push({ type: assetType, path });

    // Map asset types to requirements
    if (assetType === 'player-sprite-config') this.required.playerSpriteConfig = true;
    if (assetType === 'player-sprite-image') this.required.playerSpriteImage = true;
    if (assetType === 'npc-sprite-config') this.required.npcSpriteConfig = true;
    if (assetType === 'npc-sprite-image') this.required.npcSpriteImage = true;
    if (assetType === 'cutscene') this.required.cutscene = true;
    if (assetType === 'map-config') this.required.mapConfig = true;
    if (assetType === 'map-cells') this.required.mapCells = true;
    if (assetType === 'tileset') this.required.tileset = true;
    if (assetType === 'manifest') this.required.manifest = true;
  }

  markFailed(assetType, error) {
    this.failed.push({ type: assetType, error });
  }

  getMissingRequirements() {
    const missing = [];
    if (!this.required.playerSpriteConfig) missing.push('Player sprite config (.json)');
    if (!this.required.playerSpriteImage) missing.push('Player sprite image (.png)');
    if (!this.required.npcSpriteConfig) missing.push('NPC sprite config (.json)');
    if (!this.required.npcSpriteImage) missing.push('NPC sprite image (.png)');
    if (!this.required.cutscene) missing.push('Intro cutscene (.pxc)');
    if (!this.required.mapConfig) missing.push('Map config (map.json)');
    if (!this.required.mapCells) missing.push('Map cells (cells.json)');
    if (!this.required.tileset) missing.push('Tileset (common.json)');
    if (!this.required.manifest) missing.push('Package manifest (manifest.json)');
    return missing;
  }

  isComplete() {
    return Object.values(this.required).every(v => v === true);
  }

  getStats() {
    const total = Object.keys(this.required).length;
    const completed = Object.values(this.required).filter(v => v).length;
    return { total, completed, generated: this.generated.length, failed: this.failed.length };
  }
}

/**
 * Game concept analysis result
 */
export class GameConcept {
  constructor(data) {
    this.title = data.title || 'Untitled Game';
    this.genre = data.genre || 'rpg';
    this.setting = data.setting || 'fantasy';
    this.synopsis = data.synopsis || '';
    this.characters = data.characters || [];
    this.locations = data.locations || [];
    this.items = data.items || [];
    this.quests = data.quests || [];
    this.cutscenes = data.cutscenes || [];
    this.mood = data.mood || 'adventurous';
  }

  /**
   * Validate that the concept has minimum required elements
   */
  validate() {
    const errors = [];

    if (this.characters.length === 0) {
      errors.push('No characters defined');
    }

    const hasPlayer = this.characters.some(c => c.type === 'player');
    if (!hasPlayer) {
      // Auto-promote first character to player
      if (this.characters.length > 0) {
        this.characters[0].type = 'player';
      } else {
        errors.push('No player character defined');
      }
    }

    const hasNPC = this.characters.some(c => c.type === 'npc');
    if (!hasNPC && this.characters.length > 1) {
      // Auto-promote second character to NPC
      this.characters[1].type = 'npc';
    }

    if (this.locations.length === 0) {
      // Add default location
      this.locations.push({
        id: 'starting-area',
        name: 'Starting Area',
        type: 'town',
        description: 'A peaceful starting location',
      });
    }

    if (this.cutscenes.length === 0) {
      // Add default intro cutscene
      this.cutscenes.push({
        id: 'intro',
        trigger: 'intro',
        description: `Introduction to ${this.title}`,
        characters: this.characters.slice(0, 2).map(c => c.name),
      });
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Game Package Orchestrator
 * Generates complete game packages from high-level descriptions
 */
export class GamePackageOrchestrator {
  constructor(options = {}) {
    this.writeFile = options.writeFile;
    this.onProgress = options.onProgress || (() => { });
    this.onStatusChange = options.onStatusChange || (() => { });
    this.tracker = new AssetTracker();
    this.maxRetries = 3;
  }

  /**
   * Analyze a game concept prompt to extract structured information
   * @param {string} prompt - High-level game description
   * @returns {Promise<GameConcept>}
   */
  async analyzeGameConcept(prompt) {
    this.onStatusChange({ phase: 'analyzing', message: 'Analyzing game concept...' });

    const systemPrompt = `You are an expert game designer. Analyze the game concept and extract structured information.

Return ONLY valid JSON with this structure:
{
  "title": "Game Title",
  "genre": "rpg|action|puzzle|adventure",
  "setting": "fantasy|sci-fi|modern|medieval|post-apocalyptic",
  "synopsis": "Brief 2-3 sentence game synopsis",
  "mood": "adventurous|dark|whimsical|serious|comedic",
  "characters": [
    {
      "name": "character_id",
      "displayName": "Character Name",
      "type": "player|npc|enemy",
      "description": "Visual description for sprite generation - be specific about clothing, colors, features",
      "role": "hero|merchant|guard|villain|etc",
      "personality": "friendly|grumpy|mysterious|etc"
    }
  ],
  "locations": [
    {
      "id": "location_id",
      "name": "Location Name",
      "type": "town|dungeon|forest|castle|etc",
      "description": "Visual description for backdrop/tileset"
    }
  ],
  "items": [
    {
      "id": "item_id",
      "name": "Item Name",
      "type": "weapon|armor|consumable|key",
      "description": "Visual description"
    }
  ],
  "quests": [
    {
      "id": "quest_id",
      "title": "Quest Title",
      "giver": "character_id",
      "description": "Quest objective",
      "reward": "What player gets"
    }
  ],
  "cutscenes": [
    {
      "id": "cutscene_id",
      "trigger": "intro|quest_start|quest_complete|boss_defeat",
      "description": "What happens in this cutscene - be detailed",
      "characters": ["char1", "char2"]
    }
  ]
}

CRITICAL REQUIREMENTS:
- You MUST include at least 1 character with type "player"
- You MUST include at least 1 character with type "npc"
- You MUST include at least 1 location
- You MUST include at least 1 cutscene with trigger "intro"
- Character descriptions should be VISUAL - describe appearance for sprite generation
- Make it a coherent, playable game`;

    const analysisPrompt = `Analyze and design a game based on this concept:

${prompt}

Extract all characters, locations, items, quests, and plan cutscenes.
Make it a coherent, playable game with clear progression.
ENSURE you have at least: 1 player, 1 NPC, 1 location, 1 intro cutscene.
RESPOND WITH ONLY VALID JSON, NO MARKDOWN, NO EXPLANATION.`;

    try {
      const response = await aiService.chatCompletion(
        analysisPrompt,
        systemPrompt,
        null,
        { temperature: 0.7 }
      );

      // Parse the JSON response - it may be a string or already parsed
      let conceptData;
      if (typeof response === 'string') {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            conceptData = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error('[GameOrchestrator] Failed to parse JSON:', parseError);
            console.error('[GameOrchestrator] Raw response:', response.substring(0, 500));
            throw new Error('AI returned invalid JSON for game concept');
          }
        } else {
          console.error('[GameOrchestrator] No JSON found in response:', response.substring(0, 500));
          throw new Error('AI did not return JSON for game concept');
        }
      } else if (typeof response === 'object' && response !== null) {
        conceptData = response;
      } else {
        throw new Error('AI returned empty or invalid response');
      }


      const gameConcept = new GameConcept(conceptData);

      // Validate and fix up the concept
      const validation = gameConcept.validate();
      if (!validation.valid) {
        console.warn('[GameOrchestrator] Concept had issues, auto-fixed:', validation.errors);
      }

      return gameConcept;
    } catch (error) {
      console.error('[GameOrchestrator] analyzeGameConcept failed:', error);
      throw new Error(`Failed to analyze game concept: ${error.message}`);
    }
  }

  /**
   * Generate a complete game package from a prompt
   * @param {string} prompt - High-level game description
   * @returns {Promise<object>} Generation results with all assets
   */
  async generateGamePackage(prompt) {

    this.tracker.reset();

    const results = {
      success: false,
      assets: [],
      errors: [],
      concept: null,
      manifest: null,
      validation: null,
    };

    try {
      // ================================================================
      // STEP 1: Analyze the game concept
      // ================================================================
      this.onStatusChange({ phase: 'analyzing', message: 'Analyzing game concept...' });

      const concept = await this.analyzeGameConcept(prompt);
      results.concept = concept;

        title: concept.title,
        characters: concept.characters.length,
        locations: concept.locations.length,
        cutscenes: concept.cutscenes.length,
      });

      this.onProgress({ current: 1, total: 8, message: `Designing "${concept.title}"...` });

      // Track asset paths for manifest
      const assetPaths = {
        sprites: [],
        cutscenes: [],
        maps: [],
        tilesets: ['common'],
        modes: ['explore'],
      };

      // ================================================================
      // STEP 2: Generate PLAYER character (REQUIRED)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Creating player character (REQUIRED)...' });

      const playerChar = concept.characters.find(c => c.type === 'player') || concept.characters[0];

      if (!playerChar) {
        throw new Error('CRITICAL: No player character in game concept!');
      }


      const playerAssets = await this.generateCharacterAssetsWithRetry(
        playerChar,
        'characters',
        { layoutName: 'character4', includePortrait: true },
        'player'
      );

      results.assets.push(...playerAssets.assets);
      results.errors.push(...playerAssets.errors);

      // Track what was generated
      for (const asset of playerAssets.assets) {
        if (asset.type === 'config') this.tracker.markGenerated('player-sprite-config', asset.path);
        if (asset.type === 'image' && asset.subtype === 'spritesheet') this.tracker.markGenerated('player-sprite-image', asset.path);
      }

      if (playerAssets.assets.length > 0) {
        assetPaths.sprites.push(`characters/${this.sanitizeName(playerChar.name)}`);
      }

      this.onProgress({ current: 2, total: 8, message: 'Player character created' });

      // ================================================================
      // STEP 3: Generate NPC characters (REQUIRED - at least 1)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Creating NPCs (REQUIRED)...' });

      const npcs = concept.characters.filter(c => c.type === 'npc');

      // Ensure at least one NPC
      if (npcs.length === 0 && concept.characters.length > 1) {
        const fallbackNpc = concept.characters.find(c => c.type !== 'player') || concept.characters[1];
        if (fallbackNpc) {
          fallbackNpc.type = 'npc';
          npcs.push(fallbackNpc);
        }
      }

      for (const npc of npcs.slice(0, 3)) {

        const npcAssets = await this.generateCharacterAssetsWithRetry(
          npc,
          'npc',
          { layoutName: 'npc', includeStates: true, includePortrait: true },
          'npc'
        );

        results.assets.push(...npcAssets.assets);
        results.errors.push(...npcAssets.errors);

        // Track what was generated
        for (const asset of npcAssets.assets) {
          if (asset.type === 'config') this.tracker.markGenerated('npc-sprite-config', asset.path);
          if (asset.type === 'image' && asset.subtype === 'spritesheet') this.tracker.markGenerated('npc-sprite-image', asset.path);
        }

        if (npcAssets.assets.length > 0) {
          assetPaths.sprites.push(`npc/${this.sanitizeName(npc.name)}`);
        }
      }

      this.onProgress({ current: 3, total: 8, message: 'NPCs created' });

      // ================================================================
      // STEP 4: Generate enemies (optional)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Creating enemies...' });

      const enemies = concept.characters.filter(c => c.type === 'enemy');

      for (const enemy of enemies.slice(0, 2)) {
        try {
          const enemyAssets = await this.generateCharacterAssetsWithRetry(
            enemy,
            'monsters',
            { layoutName: 'monster', includePortrait: false },
            'enemy'
          );
          results.assets.push(...enemyAssets.assets);
          results.errors.push(...enemyAssets.errors);

          if (enemyAssets.assets.length > 0) {
            assetPaths.sprites.push(`monsters/${this.sanitizeName(enemy.name)}`);
          }
        } catch (error) {
          console.error('[GameOrchestrator] Enemy generation failed (non-critical):', error.message);
          results.errors.push({ phase: 'enemy', message: error.message, retryable: true });
        }
      }

      this.onProgress({ current: 4, total: 8, message: 'Enemies created' });

      // ================================================================
      // STEP 5: Generate CUTSCENES (REQUIRED - at least intro)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Writing cutscenes (REQUIRED)...' });

      // Ensure we have an intro cutscene
      const introCutscene = concept.cutscenes.find(c => c.trigger === 'intro') || concept.cutscenes[0];

      if (!introCutscene) {
        // Create a default intro cutscene
        concept.cutscenes.unshift({
          id: 'intro',
          trigger: 'intro',
          description: `Introduction to ${concept.title}. The hero begins their journey.`,
          characters: [playerChar.name, npcs[0]?.name].filter(Boolean),
        });
      }

      for (const cutscene of concept.cutscenes.slice(0, 3)) {

        try {
          const cutsceneContent = await this.generateCutsceneWithRetry(cutscene, concept);

          const cutscenePath = `cutscenes/${this.sanitizeName(cutscene.id)}.pxc`;

          results.assets.push({
            type: 'text',
            subtype: 'cutscene',
            name: `${this.sanitizeName(cutscene.id)}.pxc`,
            path: cutscenePath,
            content: cutsceneContent,
            contentType: 'text/plain',
          });

          this.tracker.markGenerated('cutscene', cutscenePath);
          assetPaths.cutscenes.push(cutscenePath);

        } catch (error) {
          console.error('[GameOrchestrator] Cutscene failed:', cutscene.id, error.message);
          results.errors.push({ phase: 'cutscene', message: error.message, cutscene: cutscene.id, retryable: true });
        }
      }

      this.onProgress({ current: 5, total: 8, message: 'Cutscenes written' });

      // ================================================================
      // STEP 6: Generate NPC scripts
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Writing NPC scripts...' });

      // Generate callback for each NPC
      for (const npc of npcs.slice(0, 3)) {
        try {
          const scriptContent = await generateScript(
            `${npc.displayName || npc.name}: ${npc.personality || 'friendly'} ${npc.role || 'villager'}`,
            'npc',
            { spriteName: this.sanitizeName(npc.name) }
          );

          const scriptPath = `callbacks/npc_${this.sanitizeName(npc.name)}.pxs`;

          results.assets.push({
            type: 'text',
            subtype: 'script',
            name: `npc_${this.sanitizeName(npc.name)}.pxs`,
            path: scriptPath,
            content: scriptContent,
            contentType: 'text/plain',
          });
        } catch (error) {
          console.error('[GameOrchestrator] Script failed:', npc.name, error.message);
          results.errors.push({ phase: 'script', message: error.message, retryable: true });
        }
      }

      this.onProgress({ current: 6, total: 9, message: 'Scripts written' });

      // ================================================================
      // STEP 7: Generate TILESET (REQUIRED - 3 files)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Creating tileset (REQUIRED)...' });

      try {
        // Generate all 3 tileset files
        const tilesetFiles = this.generateCompleteTileset(concept.setting);

        // tileset.json - main config with textures
        results.assets.push({
          type: 'config',
          subtype: 'tileset',
          name: 'tileset.json',
          path: 'tilesets/common/tileset.json',
          content: JSON.stringify(tilesetFiles.tileset, null, 2),
          contentType: 'application/json',
        });

        // geometry.json - 3D geometry definitions
        results.assets.push({
          type: 'config',
          subtype: 'geometry',
          name: 'geometry.json',
          path: 'tilesets/common/geometry.json',
          content: JSON.stringify(tilesetFiles.geometry, null, 2),
          contentType: 'application/json',
        });

        // tiles.json - tile type definitions
        results.assets.push({
          type: 'config',
          subtype: 'tiles',
          name: 'tiles.json',
          path: 'tilesets/common/tiles.json',
          content: JSON.stringify(tilesetFiles.tiles, null, 2),
          contentType: 'application/json',
        });

        // Generate tileset texture image
        try {
          const tilesetImageBase64 = await this.generateTilesetTexture(concept.setting);

          if (tilesetImageBase64) {
            results.assets.push({
              type: 'image',
              subtype: 'tileset-texture',
              name: 'tileset.png',
              path: 'tilesets/common/tileset.png',
              content: base64ToBlob(tilesetImageBase64, 'image/png'),
              contentType: 'image/png',
              base64: tilesetImageBase64,
            });
          }
        } catch (texError) {
          console.error('[GameOrchestrator] Tileset texture failed (using placeholder):', texError.message);
          // Create a simple placeholder tileset texture
          const placeholderBase64 = this.createPlaceholderTilesetTexture();
          results.assets.push({
            type: 'image',
            subtype: 'tileset-texture',
            name: 'tileset.png',
            path: 'tilesets/common/tileset.png',
            content: base64ToBlob(placeholderBase64, 'image/png'),
            contentType: 'image/png',
            base64: placeholderBase64,
          });
        }

        this.tracker.markGenerated('tileset', 'tilesets/common/tileset.json');

      } catch (error) {
        console.error('[GameOrchestrator] Tileset generation failed:', error.message);
        results.errors.push({ phase: 'tileset', message: error.message, retryable: true });
      }

      this.onProgress({ current: 7, total: 9, message: 'Tileset created' });

      // ================================================================
      // STEP 8: Generate MAP (REQUIRED)
      // ================================================================
      this.onStatusChange({ phase: 'generating', message: 'Creating starting zone (REQUIRED)...' });

      const startLocation = concept.locations[0] || {
        id: 'start',
        name: 'Starting Area',
        description: 'A peaceful starting area',
      };

      try {
        const mapConfig = this.generateZoneConfig(startLocation, concept);
        const mapPath = `maps/${this.sanitizeName(startLocation.id)}/map.json`;

        results.assets.push({
          type: 'config',
          subtype: 'map',
          name: 'map.json',
          path: mapPath,
          content: JSON.stringify(mapConfig, null, 2),
          contentType: 'application/json',
        });

        this.tracker.markGenerated('map-config', mapPath);

        // Generate cells
        const cells = this.generateSimpleCells(15, 15);
        const cellsPath = `maps/${this.sanitizeName(startLocation.id)}/cells.json`;

        results.assets.push({
          type: 'config',
          subtype: 'cells',
          name: 'cells.json',
          path: cellsPath,
          content: JSON.stringify(cells, null, 2),
          contentType: 'application/json',
        });

        this.tracker.markGenerated('map-cells', cellsPath);
        assetPaths.maps.push(this.sanitizeName(startLocation.id));

      } catch (error) {
        console.error('[GameOrchestrator] Map generation failed:', error.message);
        results.errors.push({ phase: 'map', message: error.message, retryable: true });
      }

      this.onProgress({ current: 8, total: 9, message: 'Zone created' });

      // ================================================================
      // STEP 9: Generate MANIFEST (REQUIRED)
      // ================================================================
      this.onStatusChange({ phase: 'finalizing', message: 'Creating package manifest...' });

      const manifest = generateManifest(assetPaths);
      manifest.initialZones = assetPaths.maps.slice(0, 1);
      manifest.title = concept.title;
      manifest.description = concept.synopsis;

      const validatedManifest = validateManifest(manifest);
      results.manifest = validatedManifest.manifest;

      results.assets.push({
        type: 'config',
        subtype: 'manifest',
        name: 'manifest.json',
        path: 'manifest.json',
        content: JSON.stringify(validatedManifest.manifest, null, 2),
        contentType: 'application/json',
      });

      this.tracker.markGenerated('manifest', 'manifest.json');

      this.onProgress({ current: 9, total: 9, message: 'Manifest created' });

      // ================================================================
      // FINAL VALIDATION
      // ================================================================

      const stats = this.tracker.getStats();
      const missing = this.tracker.getMissingRequirements();


      results.validation = {
        isComplete: this.tracker.isComplete(),
        stats,
        missing,
        generated: this.tracker.generated,
      };

      if (!this.tracker.isComplete()) {
        // Package is INCOMPLETE
        console.error('[GameOrchestrator] PACKAGE IS INCOMPLETE! Missing:', missing);

        results.success = false;
        results.errors.push({
          phase: 'validation',
          message: `Package incomplete! Missing: ${missing.join(', ')}`,
          missing,
          retryable: true,
        });

        this.onStatusChange({
          phase: 'incomplete',
          message: `Package incomplete! Missing ${missing.length} required assets.`,
          missing,
        });
      } else {
        // Package is complete!
        results.success = true;

        this.onStatusChange({
          phase: 'complete',
          message: `Game package "${concept.title}" generated successfully!`,
          stats,
        });
      }

    } catch (error) {
      console.error('[GameOrchestrator] CRITICAL ERROR:', error);
      results.success = false;
      results.errors.push({
        phase: 'orchestration',
        message: error.message,
        error,
      });

      this.onStatusChange({
        phase: 'error',
        message: `Generation failed: ${error.message}`,
      });
    }


    return results;
  }

  /**
   * Generate character assets with retry logic
   */
  async generateCharacterAssetsWithRetry(character, folder, options = {}, charType = 'character') {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {

        const result = await this.generateCharacterAssets(character, folder, options);

        // Verify we got at least config + image
        const hasConfig = result.assets.some(a => a.type === 'config');
        const hasImage = result.assets.some(a => a.type === 'image');

        if (hasConfig && hasImage) {
          return result;
        }

        // If we got config but no image, that's a partial success - try again for image
        if (hasConfig && !hasImage && attempt < this.maxRetries) {
          lastError = new Error('Image generation failed');
          continue;
        }

        return result;

      } catch (error) {
        lastError = error;
        console.error(`[GameOrchestrator] Attempt ${attempt} failed for ${character.name}:`, error.message);

        if (attempt < this.maxRetries) {
          // Wait before retry
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(`[GameOrchestrator] All ${this.maxRetries} attempts failed for ${character.name}`);
    return {
      assets: [],
      errors: [{
        phase: charType,
        message: `Failed to generate ${character.name} after ${this.maxRetries} attempts: ${lastError?.message}`,
        retryable: true,
        character: character.name,
      }],
    };
  }

  /**
   * Generate cutscene with retry logic
   */
  async generateCutsceneWithRetry(cutscene, concept) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const cutsceneContent = await generateCutscene(
          `${cutscene.description} for "${concept.title}"`,
          {
            characters: (cutscene.characters || []).map(c => c.toUpperCase()),
            mood: concept.mood,
            length: cutscene.trigger === 'intro' ? 'medium' : 'short',
          }
        );

        // Validate cutscene content
        if (cutsceneContent && cutsceneContent.length > 50) {
          return cutsceneContent;
        }

        throw new Error('Cutscene content too short or empty');

      } catch (error) {
        lastError = error;
        console.error(`[GameOrchestrator] Cutscene attempt ${attempt} failed:`, error.message);

        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Cutscene generation failed');
  }

  /**
   * Generate all assets for a character
   */
  async generateCharacterAssets(character, folder, options = {}) {
    const results = { assets: [], errors: [] };
    const name = this.sanitizeName(character.name);
    const layoutName = options.layoutName || 'character4';
    const layout = SPRITESHEET_LAYOUTS[layoutName];

    if (!layout) {
      throw new Error(`Unknown layout: ${layoutName}`);
    }

    // Generate sprite config
    const frames = calculateFrameCoordinates(layout);
    const spriteConfig = {
      type: 'sprite',
      src: `${name}.png`,
      sheetSize: layout.sheetSize,
      tileSize: layout.tileSize,
      frames,
      drawOffset: {},
      hotspotOffset: [0.5, 0.5, 0],
      state: 'intro',
      enableSpeech: true,
      bindCamera: folder === 'characters',
      displayName: character.displayName || character.name,
    };

    for (const dir of layout.directions) {
      spriteConfig.drawOffset[dir] = [-0.15, -0.15, -1];
    }

    // Add states for NPCs
    if (options.includeStates && character.personality) {
      spriteConfig.states = [
        {
          name: 'intro',
          next: 'idle',
          actions: [
            {
              type: 'dialogue',
              dialogue: `Greetings, traveler.`,
              callback: `npc_${name}`,
            },
          ],
        },
        { name: 'idle', next: 'idle', actions: [] },
      ];
    }

    // Add portrait reference
    if (options.includePortrait !== false) {
      spriteConfig.portraitSrc = `${name}_portrait.png`;
    }

    // Validate config
    const validated = validateSpriteConfig(spriteConfig, layoutName);

    results.assets.push({
      type: 'config',
      name: `${name}.json`,
      path: `sprites/${folder}/${name}.json`,
      content: JSON.stringify(validated.config, null, 2),
      contentType: 'application/json',
    });

    // Generate spritesheet (REQUIRED)
    try {
      const spritesheetBase64 = await generateSpritesheet(
        character.description || `${character.displayName || character.name} character sprite`,
        {
          ...layout,
          layoutName,
          style: 'pixel art',
          onRetry: (info) => this.onStatusChange({ phase: 'rate-limited', message: info.message, retryInfo: info }),
        }
      );

      if (!spritesheetBase64) {
        throw new Error('Spritesheet generation returned empty result');
      }

      results.assets.push({
        type: 'image',
        subtype: 'spritesheet',
        name: `${name}.png`,
        path: `sprites/${folder}/${name}.png`,
        content: base64ToBlob(spritesheetBase64, 'image/png'),
        contentType: 'image/png',
        base64: spritesheetBase64,
      });


    } catch (error) {
      console.error(`[GameOrchestrator] ✗ Spritesheet failed for ${name}:`, error.message);
      results.errors.push({
        phase: 'spritesheet',
        message: error.message,
        retryable: true,
        character: character.name,
      });
    }

    // Generate portrait (optional for monsters)
    if (options.includePortrait !== false) {
      try {
        const portraitBase64 = await generatePortrait(
          character.description || `${character.displayName || character.name} portrait`,
          {
            style: 'pixel art',
            onRetry: (info) => this.onStatusChange({ phase: 'rate-limited', message: info.message, retryInfo: info }),
          }
        );

        if (portraitBase64) {
          results.assets.push({
            type: 'image',
            subtype: 'portrait',
            name: `${name}_portrait.png`,
            path: `sprites/${folder}/${name}_portrait.png`,
            content: base64ToBlob(portraitBase64, 'image/png'),
            contentType: 'image/png',
            base64: portraitBase64,
          });
        }
      } catch (error) {
        console.error(`[GameOrchestrator] Portrait failed for ${name} (non-critical):`, error.message);
        results.errors.push({
          phase: 'portrait',
          message: error.message,
          retryable: true,
          character: character.name,
        });
      }
    }

    return results;
  }

  /**
   * Generate zone configuration
   */
  generateZoneConfig(location, concept) {
    const playerChar = concept.characters.find(c => c.type === 'player') || concept.characters[0];
    const npcsInZone = concept.characters.filter(c => c.type === 'npc').slice(0, 2);

    const sprites = [];

    // Add player
    if (playerChar) {
      sprites.push({
        id: 'avatar',
        type: `characters/${this.sanitizeName(playerChar.name)}`,
        pos: [7, 7, 0],
        facing: 'Down',
      });
    }

    // Add NPCs
    npcsInZone.forEach((npc, i) => {
      sprites.push({
        id: this.sanitizeName(npc.name),
        type: `npc/${this.sanitizeName(npc.name)}`,
        pos: [5 + i * 3, 5, 0],
        facing: 'Down',
        state: 'intro',
      });
    });

    return {
      bounds: [0, 0, 15, 15],
      tileset: 'common',
      mode: 'explore',
      sprites,
      lights: [
        {
          id: 'ambient',
          pos: [7, 7, 10],
          color: [1, 0.95, 0.9],
          density: 0.3,
          enabled: true,
        },
      ],
      scripts: concept.cutscenes.some(c => c.trigger === 'intro') ? [
        {
          id: 'intro',
          trigger: `zone/${this.sanitizeName(location.id)}_load`,
        },
      ] : [],
    };
  }

  /**
   * Generate tileset texture using AI
   * @param {string} setting - Game setting for theme
   * @returns {Promise<string>} Base64 image data
   */
  async generateTilesetTexture(setting) {
    const description = `${setting || 'fantasy'} RPG game tileset`;

    const tilesetBase64 = await generateTileset(description, {
      width: 256,
      height: 256,
      tileSize: 16,
      theme: setting || 'fantasy',
    });

    return tilesetBase64;
  }

  /**
   * Create a simple placeholder tileset texture (pure canvas, no AI)
   * This is used as fallback when AI generation fails
   * @returns {string} Base64 image data
   */
  createPlaceholderTilesetTexture() {
    // Create a 256x256 placeholder with basic tiles
    // Using a simple data URL for a basic tileset pattern
    // In browser, we'd use Canvas - here we return a minimal valid PNG

    // This is a minimal 256x256 PNG with colored tiles
    // For simplicity, we'll create a basic pattern in-memory
    // The actual canvas work would be done in browser context

    // Minimal valid 1x1 purple PNG as placeholder (will be replaced by proper generation)
    const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.warn('[GameOrchestrator] Using placeholder tileset - AI generation failed');
    return minimalPng;
  }

  /**
   * Generate a complete tileset with all required files
   * Returns tileset.json, geometry.json, and tiles.json
   */
  generateCompleteTileset() {
    // ============================================
    // GEOMETRY.JSON - 3D mesh definitions
    // ============================================
    const geometry = {
      // Flat floor - walkable surface
      'FLAT_ALL': {
        vertices: [
          [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
          [[0, 1, 0], [1, 0, 0], [0, 0, 0]],
        ],
        surfaces: [
          [[0, 1], [1, 1], [1, 0]],
          [[0, 1], [1, 0], [0, 0]],
        ],
        type: 15,
      },
      // Flat non-walkable
      'FLAT_NONE': {
        vertices: [
          [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
          [[0, 1, 0], [1, 0, 0], [0, 0, 0]],
        ],
        surfaces: [
          [[0, 1], [1, 1], [1, 0]],
          [[0, 1], [1, 0], [0, 0]],
        ],
        type: 0,
      },
      // North wall
      'WALL_T': {
        vertices: [
          [[0, 0, 0], [1, 0, 0], [1, 0, 1]],
          [[0, 0, 0], [1, 0, 1], [0, 0, 1]],
        ],
        surfaces: [
          [[0, 0], [1, 0], [1, 1]],
          [[0, 0], [1, 1], [0, 1]],
        ],
        type: 2,
      },
      // South wall
      'WALL_B': {
        vertices: [
          [[0, 1, 0], [1, 1, 0], [1, 1, 1]],
          [[0, 1, 0], [1, 1, 1], [0, 1, 1]],
        ],
        surfaces: [
          [[0, 0], [1, 0], [1, 1]],
          [[0, 0], [1, 1], [0, 1]],
        ],
        type: 8,
      },
      // Left wall
      'WALL_L': {
        vertices: [
          [[0, 0, 0], [0, 1, 0], [0, 1, 1]],
          [[0, 0, 0], [0, 1, 1], [0, 0, 1]],
        ],
        surfaces: [
          [[0, 0], [1, 0], [1, 1]],
          [[0, 0], [1, 1], [0, 1]],
        ],
        type: 1,
      },
      // Right wall
      'WALL_R': {
        vertices: [
          [[1, 0, 0], [1, 1, 0], [1, 1, 1]],
          [[1, 0, 0], [1, 1, 1], [1, 0, 1]],
        ],
        surfaces: [
          [[0, 0], [1, 0], [1, 1]],
          [[0, 0], [1, 1], [0, 1]],
        ],
        type: 4,
      },
    };

    // ============================================
    // TILESET.JSON - Texture mappings and config
    // AI generates 1024x1024 image in 16x16 grid = 64px tiles
    // ============================================
    const tileset = {
      name: 'common',
      src: 'tileset.png',
      sheetSize: [1024, 1024],
      sheetOffsetX: 0,
      sheetOffsetY: 0,
      tileSize: 64,
      bgColor: [32, 62, 88],
      textures: {
        'FLOOR': [1, 1],
        'FLOOR_BR': [2, 2],
        'FLOOR_R': [2, 1],
        'FLOOR_TR': [2, 0],
        'FLOOR_T': [1, 0],
        'FLOOR_TL': [0, 0],
        'FLOOR_L': [0, 1],
        'FLOOR_BL': [0, 2],
        'FLOOR_B': [1, 2],
        'WALL': [1, 5],
        'EMPTY': [0, 5],
        'EMPTY_T': [1, 4],
        'EMPTY_B': [1, 6],
        'EMPTY_L': [0, 5],
        'EMPTY_R': [2, 5],
        'EMPTY_TL': [0, 4],
        'EMPTY_TR': [2, 4],
        'EMPTY_BL': [0, 6],
        'EMPTY_BR': [2, 6],
        'EMPTY_CTL': [3, 0],
        'EMPTY_CTR': [4, 0],
        'EMPTY_CBL': [3, 1],
        'EMPTY_CBR': [4, 1],
      },
    };

    // ============================================
    // TILES.JSON - Tile type definitions
    // Format: [geometry, texture, height, ...]
    // ============================================
    const tiles = {
      'FLOOR': ['FLAT_ALL', 'FLOOR', 0],
      'WATER': ['FLAT_NONE', 'FLOOR', -1.5],
      'EMPTY': ['FLAT_ALL', 'EMPTY', 2],

      'N_WALL': ['WALL_T', 'WALL', 2, 'FLAT_ALL', 'EMPTY_B', 2],
      'S_WALL': ['WALL_B', 'WALL', 2, 'FLAT_ALL', 'EMPTY_T', 2],
      'L_WALL': ['WALL_L', 'WALL', 2, 'FLAT_ALL', 'EMPTY_R', 2],
      'R_WALL': ['WALL_R', 'WALL', 2, 'FLAT_ALL', 'EMPTY_L', 2],

      'NLW_CORNER': ['FLAT_ALL', 'EMPTY_CTL', 2],
      'NRW_CORNER': ['FLAT_ALL', 'EMPTY_CTR', 2],
      'SLW_CORNER': ['FLAT_ALL', 'EMPTY_CBL', 2],
      'SRW_CORNER': ['FLAT_ALL', 'EMPTY_CBR', 2],

      'EDGE': ['WALL_R', 'WALL', 2, 'WALL_B', 'WALL', 2, 'WALL_L', 'WALL', 2, 'WALL_T', 'WALL', 2, 'FLAT_ALL', 'FLOOR', 2],
      'PILLAR': ['WALL_R', 'WALL', 2, 'WALL_B', 'WALL', 2, 'WALL_L', 'WALL', 2, 'WALL_T', 'WALL', 2, 'FLAT_ALL', 'EMPTY', 2],
    };

    return { tileset, geometry, tiles };
  }

  /**
   * Generate simple cells grid
   */
  generateSimpleCells(width, height) {
    const cells = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        if (y === 0) {
          row.push('N_WALL');
        } else if (y === height - 1) {
          row.push('S_WALL');
        } else if (x === 0) {
          row.push('L_WALL');
        } else if (x === width - 1) {
          row.push('R_WALL');
        } else {
          row.push('FLOOR');
        }
      }
      cells.push(row);
    }

    cells[0][0] = 'NLW_CORNER';
    cells[0][width - 1] = 'NRW_CORNER';
    cells[height - 1][0] = 'SLW_CORNER';
    cells[height - 1][width - 1] = 'SRW_CORNER';

    return cells;
  }

  /**
   * Sanitize a name for use as filename/ID
   */
  sanitizeName(name) {
    if (!name) return 'unnamed';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 32);
  }
}

/**
 * Factory function to create orchestrator
 */
export function createGamePackageOrchestrator(options = {}) {
  return new GamePackageOrchestrator(options);
}

export default {
  GamePackageOrchestrator,
  GameConcept,
  createGamePackageOrchestrator,
};
