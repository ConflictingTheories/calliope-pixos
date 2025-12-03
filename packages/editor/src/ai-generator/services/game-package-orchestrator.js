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
import { generatePortrait, generateSpritesheet, base64ToBlob } from './image-generator.js';
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
    this.onProgress = options.onProgress || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
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
      
      console.log('[GameOrchestrator] Parsed concept data:', JSON.stringify(conceptData).substring(0, 200));
      
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
    console.log('[GameOrchestrator] ========================================');
    console.log('[GameOrchestrator] STARTING FULL GAME GENERATION');
    console.log('[GameOrchestrator] ========================================');
    
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
      console.log('[GameOrchestrator] STEP 1: Analyzing game concept...');
      this.onStatusChange({ phase: 'analyzing', message: 'Analyzing game concept...' });
      
      const concept = await this.analyzeGameConcept(prompt);
      results.concept = concept;
      
      console.log('[GameOrchestrator] Concept:', {
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
      console.log('[GameOrchestrator] STEP 2: Generating PLAYER character...');
      this.onStatusChange({ phase: 'generating', message: 'Creating player character (REQUIRED)...' });
      
      const playerChar = concept.characters.find(c => c.type === 'player') || concept.characters[0];
      
      if (!playerChar) {
        throw new Error('CRITICAL: No player character in game concept!');
      }
      
      console.log('[GameOrchestrator] Player:', playerChar.name, '-', playerChar.description?.substring(0, 50));
      
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
      console.log('[GameOrchestrator] STEP 3: Generating NPC characters...');
      this.onStatusChange({ phase: 'generating', message: 'Creating NPCs (REQUIRED)...' });
      
      const npcs = concept.characters.filter(c => c.type === 'npc');
      console.log('[GameOrchestrator] Found', npcs.length, 'NPCs');
      
      // Ensure at least one NPC
      if (npcs.length === 0 && concept.characters.length > 1) {
        const fallbackNpc = concept.characters.find(c => c.type !== 'player') || concept.characters[1];
        if (fallbackNpc) {
          fallbackNpc.type = 'npc';
          npcs.push(fallbackNpc);
          console.log('[GameOrchestrator] Auto-promoted character to NPC:', fallbackNpc.name);
        }
      }
      
      for (const npc of npcs.slice(0, 3)) {
        console.log('[GameOrchestrator] Generating NPC:', npc.name);
        
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
      console.log('[GameOrchestrator] STEP 4: Generating enemies (optional)...');
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
      console.log('[GameOrchestrator] STEP 5: Generating cutscenes (REQUIRED)...');
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
        console.log('[GameOrchestrator] Generating cutscene:', cutscene.id);
        
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
      console.log('[GameOrchestrator] STEP 6: Generating scripts...');
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
      // STEP 7: Generate TILESET (REQUIRED)
      // ================================================================
      console.log('[GameOrchestrator] STEP 7: Generating tileset (REQUIRED)...');
      this.onStatusChange({ phase: 'generating', message: 'Creating tileset (REQUIRED)...' });
      
      try {
        const tilesetConfig = this.generateDefaultTileset(concept.setting);
        
        results.assets.push({
          type: 'config',
          subtype: 'tileset',
          name: 'common.json',
          path: 'tilesets/common.json',
          content: JSON.stringify(tilesetConfig, null, 2),
          contentType: 'application/json',
        });
        
        this.tracker.markGenerated('tileset', 'tilesets/common.json');
        
      } catch (error) {
        console.error('[GameOrchestrator] Tileset generation failed:', error.message);
        results.errors.push({ phase: 'tileset', message: error.message, retryable: true });
      }
      
      this.onProgress({ current: 7, total: 9, message: 'Tileset created' });

      // ================================================================
      // STEP 8: Generate MAP (REQUIRED)
      // ================================================================
      console.log('[GameOrchestrator] STEP 8: Generating map (REQUIRED)...');
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
      console.log('[GameOrchestrator] STEP 9: Generating manifest (REQUIRED)...');
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
      console.log('[GameOrchestrator] ========================================');
      console.log('[GameOrchestrator] VALIDATING PACKAGE COMPLETENESS');
      console.log('[GameOrchestrator] ========================================');
      
      const stats = this.tracker.getStats();
      const missing = this.tracker.getMissingRequirements();
      
      console.log('[GameOrchestrator] Stats:', stats);
      console.log('[GameOrchestrator] Assets generated:', results.assets.length);
      console.log('[GameOrchestrator] Errors:', results.errors.length);
      console.log('[GameOrchestrator] Missing requirements:', missing);
      
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
        console.log('[GameOrchestrator] ✓ PACKAGE IS COMPLETE!');
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

    console.log('[GameOrchestrator] ========================================');
    console.log('[GameOrchestrator] GENERATION COMPLETE');
    console.log('[GameOrchestrator] Success:', results.success);
    console.log('[GameOrchestrator] Assets:', results.assets.length);
    console.log('[GameOrchestrator] Errors:', results.errors.length);
    console.log('[GameOrchestrator] ========================================');

    return results;
  }

  /**
   * Generate character assets with retry logic
   */
  async generateCharacterAssetsWithRetry(character, folder, options = {}, charType = 'character') {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[GameOrchestrator] Attempt ${attempt}/${this.maxRetries} for ${character.name}`);
        
        const result = await this.generateCharacterAssets(character, folder, options);
        
        // Verify we got at least config + image
        const hasConfig = result.assets.some(a => a.type === 'config');
        const hasImage = result.assets.some(a => a.type === 'image');
        
        if (hasConfig && hasImage) {
          console.log(`[GameOrchestrator] ✓ Successfully generated ${character.name}`);
          return result;
        }
        
        // If we got config but no image, that's a partial success - try again for image
        if (hasConfig && !hasImage && attempt < this.maxRetries) {
          console.log(`[GameOrchestrator] Partial success for ${character.name}, retrying for image...`);
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
          console.log(`[GameOrchestrator] Waiting ${delay}ms before retry...`);
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
    console.log(`[GameOrchestrator] Generating spritesheet for ${name}...`);
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
      
      console.log(`[GameOrchestrator] ✓ Spritesheet generated for ${name}`);
      
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
      console.log(`[GameOrchestrator] Generating portrait for ${name}...`);
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
          console.log(`[GameOrchestrator] ✓ Portrait generated for ${name}`);
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
   * Generate a default tileset configuration
   * This creates a basic tileset that can be used for maps
   */
  generateDefaultTileset(setting = 'fantasy') {
    // Basic tile definitions that work with the engine
    const tiles = {
      'FLOOR': {
        walkable: true,
        texture: 'floor',
        height: 0,
      },
      'N_WALL': {
        walkable: false,
        texture: 'wall_north',
        height: 1,
      },
      'S_WALL': {
        walkable: false,
        texture: 'wall_south', 
        height: 1,
      },
      'L_WALL': {
        walkable: false,
        texture: 'wall_west',
        height: 1,
      },
      'R_WALL': {
        walkable: false,
        texture: 'wall_east',
        height: 1,
      },
      'NLW_CORNER': {
        walkable: false,
        texture: 'corner_nw',
        height: 1,
      },
      'NRW_CORNER': {
        walkable: false,
        texture: 'corner_ne',
        height: 1,
      },
      'SLW_CORNER': {
        walkable: false,
        texture: 'corner_sw',
        height: 1,
      },
      'SRW_CORNER': {
        walkable: false,
        texture: 'corner_se',
        height: 1,
      },
      'DOOR': {
        walkable: true,
        texture: 'door',
        height: 0,
        trigger: true,
      },
      'STAIRS_UP': {
        walkable: true,
        texture: 'stairs_up',
        height: 0.5,
      },
      'STAIRS_DOWN': {
        walkable: true,
        texture: 'stairs_down',
        height: -0.5,
      },
      'WATER': {
        walkable: false,
        texture: 'water',
        height: -0.2,
        animated: true,
      },
      'GRASS': {
        walkable: true,
        texture: 'grass',
        height: 0,
      },
      'PATH': {
        walkable: true,
        texture: 'path',
        height: 0,
      },
    };

    // Color palettes based on setting
    const palettes = {
      fantasy: {
        floor: '#8B7355',
        wall: '#4A4A4A',
        accent: '#DAA520',
      },
      'sci-fi': {
        floor: '#2C3E50',
        wall: '#1A1A2E',
        accent: '#00D9FF',
      },
      medieval: {
        floor: '#8B4513',
        wall: '#696969',
        accent: '#CD853F',
      },
      modern: {
        floor: '#D3D3D3',
        wall: '#808080',
        accent: '#4682B4',
      },
    };

    return {
      name: 'common',
      tileSize: [32, 32],
      tiles,
      palette: palettes[setting] || palettes.fantasy,
      defaultTile: 'FLOOR',
    };
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
