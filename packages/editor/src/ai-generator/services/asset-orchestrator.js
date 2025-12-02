/**
 * ---------------------------------------------------------------
 *                AI Generator - Asset Orchestrator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Orchestrates the generation of complete asset packages,
 * handling dependencies, file linking, and proper placement
 * in the package structure.
 */

import { analyzePrompt, DIRECTIONS } from './prompt-analyzer.js';
import { generatePortrait, generateSpritesheet, base64ToBlob } from './image-generator.js';
import { generateSpeech, createAudioBlob } from './audio-generator.js';
import { generateSpriteConfig, generateCutscene, generateScript, generateNPCStates } from './text-generator.js';

/**
 * Asset type to folder mapping for organizing generated files
 */
const FOLDER_MAP = {
  sprite: 'sprites',
  portrait: 'sprites',
  spritesheet: 'sprites',
  audio: 'audio',
  music: 'audio',
  sfx: 'audio',
  script: 'callbacks',
  cutscene: 'cutscenes',
  config: '',
  tileset: 'tilesets',
  map: 'maps',
  texture: 'textures',
  dialogue: 'dialogues',
};

/**
 * Generation status
 */
export const GenerationStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Asset Orchestrator class for managing complex multi-asset generation
 */
export class AssetOrchestrator {
  constructor(options = {}) {
    this.writeFile = options.writeFile;
    this.onProgress = options.onProgress || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.generatedAssets = [];
    this.errors = [];
  }

  /**
   * Generate assets based on a user prompt
   * @param {string} prompt - User's natural language prompt
   * @returns {Promise<object>} Generation results
   */
  async generateFromPrompt(prompt) {
    // Analyze the prompt
    this.onStatusChange({ phase: 'analyzing', message: 'Analyzing prompt...' });
    const analysis = analyzePrompt(prompt);
    
    // Generate based on analysis
    return this.executeGenerationPlan(analysis);
  }

  /**
   * Execute a generation plan from analyzed prompt
   * @param {object} analysis - Analyzed prompt data
   * @returns {Promise<object>} Generation results
   */
  async executeGenerationPlan(analysis) {
    const results = {
      success: true,
      assets: [],
      errors: [],
      analysis,
    };

    const { spriteConfig, audioConfig, textConfig, metadata } = analysis;

    try {
      // Generate sprite assets if needed
      if (spriteConfig) {
        this.onStatusChange({ phase: 'generating', message: 'Generating sprite assets...' });
        const spriteResults = await this.generateSpritePackage(
          analysis.originalPrompt,
          spriteConfig,
          metadata
        );
        results.assets.push(...spriteResults.assets);
        if (spriteResults.errors.length > 0) {
          results.errors.push(...spriteResults.errors);
        }
      }

      // Generate audio if needed
      if (audioConfig) {
        this.onStatusChange({ phase: 'generating', message: 'Generating audio...' });
        const audioResults = await this.generateAudioAsset(
          analysis.originalPrompt,
          audioConfig,
          metadata
        );
        if (audioResults.asset) {
          results.assets.push(audioResults.asset);
        }
        if (audioResults.error) {
          results.errors.push(audioResults.error);
        }
      }

      // Generate text content if needed
      if (textConfig) {
        this.onStatusChange({ phase: 'generating', message: 'Generating text content...' });
        const textResults = await this.generateTextAsset(
          analysis.originalPrompt,
          textConfig,
          metadata
        );
        if (textResults.asset) {
          results.assets.push(textResults.asset);
        }
        if (textResults.error) {
          results.errors.push(textResults.error);
        }
      }

      results.success = results.errors.length === 0;

    } catch (error) {
      results.success = false;
      results.errors.push({
        phase: 'orchestration',
        message: error.message,
        error,
      });
    }

    this.onStatusChange({ 
      phase: 'complete', 
      message: results.success ? 'Generation complete!' : 'Generation completed with errors',
      results,
    });

    return results;
  }

  /**
   * Generate a complete sprite package
   * @param {string} description - Sprite description
   * @param {object} config - Sprite configuration
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>}
   */
  async generateSpritePackage(description, config, metadata = {}) {
    const results = {
      assets: [],
      errors: [],
    };

    const spriteName = this.sanitizeName(metadata.name || this.extractName(description) || 'new-sprite');
    const folderPath = `sprites/${config.preset || 'characters'}`;

    try {
      // Step 1: Generate sprite configuration JSON
      this.onProgress({ step: 1, total: 4, message: 'Generating sprite configuration...' });
      
      const spriteJson = await this.generateSpriteJson(description, config, spriteName);
      
      const jsonPath = `${folderPath}/${spriteName}.json`;
      const jsonContent = JSON.stringify(spriteJson, null, 2);
      
      results.assets.push({
        type: 'config',
        name: `${spriteName}.json`,
        path: jsonPath,
        content: jsonContent,
        contentType: 'text/json',
      });

      // Step 2: Generate portrait if needed
      if (config.needsPortrait || config.includePortrait) {
        this.onProgress({ step: 2, total: 4, message: 'Generating portrait...' });
        
        try {
          const portraitBase64 = await generatePortrait(description, {
            style: config.style || 'pixel art',
            size: '512x512',
          });

          const portraitPath = `${folderPath}/${spriteName}_portrait.png`;
          const portraitBlob = base64ToBlob(portraitBase64, 'image/png');

          results.assets.push({
            type: 'image',
            subtype: 'portrait',
            name: `${spriteName}_portrait.png`,
            path: portraitPath,
            content: portraitBlob,
            contentType: 'image/png',
            base64: portraitBase64,
          });

          // Update JSON to reference portrait
          spriteJson.portraitSrc = `${spriteName}_portrait.png`;

        } catch (error) {
          results.errors.push({
            phase: 'portrait',
            message: `Failed to generate portrait: ${error.message}`,
          });
        }
      }

      // Step 3: Generate spritesheet
      this.onProgress({ step: 3, total: 4, message: 'Generating spritesheet...' });
      
      try {
        const spritesheetBase64 = await generateSpritesheet(description, config);
        
        const sheetPath = `${folderPath}/${spriteName}.png`;
        const sheetBlob = base64ToBlob(spritesheetBase64, 'image/png');

        results.assets.push({
          type: 'image',
          subtype: 'spritesheet',
          name: `${spriteName}.png`,
          path: sheetPath,
          content: sheetBlob,
          contentType: 'image/png',
          base64: spritesheetBase64,
        });

        // Update JSON to reference spritesheet
        spriteJson.src = `${spriteName}.png`;

      } catch (error) {
        results.errors.push({
          phase: 'spritesheet',
          message: `Failed to generate spritesheet: ${error.message}`,
        });
      }

      // Step 4: Generate callbacks/hooks if needed
      if (config.needsHooks) {
        this.onProgress({ step: 4, total: 4, message: 'Generating behavior scripts...' });
        
        try {
          const states = await generateNPCStates(description, {
            role: config.preset,
            personality: metadata.style || 'neutral',
          });

          if (states && states.states) {
            spriteJson.states = states.states;
          }

        } catch (error) {
          results.errors.push({
            phase: 'scripts',
            message: `Failed to generate scripts: ${error.message}`,
          });
        }
      }

      // Update the JSON asset with final content
      const jsonAsset = results.assets.find(a => a.type === 'config');
      if (jsonAsset) {
        jsonAsset.content = JSON.stringify(spriteJson, null, 2);
      }

    } catch (error) {
      results.errors.push({
        phase: 'sprite-package',
        message: error.message,
        error,
      });
    }

    return results;
  }

  /**
   * Generate sprite configuration JSON with proper frame coordinates
   * @param {string} description - Sprite description
   * @param {object} config - Sprite configuration
   * @param {string} name - Sprite name
   * @returns {Promise<object>}
   */
  async generateSpriteJson(description, config, name) {
    const { tileSize, sheetSize, directions, framesPerDirection } = config;
    
    // Calculate frame positions based on layout
    const frames = {};
    const directionOrder = directions === 8 
      ? ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']  // Standard 8-direction layout
      : ['S', 'E', 'N', 'W'];  // Standard 4-direction layout

    for (let d = 0; d < directionOrder.length; d++) {
      const direction = directionOrder[d];
      const row = d;
      frames[direction] = [];
      
      for (let f = 0; f < framesPerDirection; f++) {
        const x = f * tileSize[0];
        const y = row * tileSize[1];
        frames[direction].push([x, y]);
      }
    }

    // Build draw offsets
    const drawOffset = {};
    const offsetValue = [-0.15, -0.15, -1];
    for (const dir of DIRECTIONS) {
      if (frames[dir]) {
        drawOffset[dir] = [...offsetValue];
      }
    }

    // Create base configuration
    const spriteConfig = {
      type: 'sprite',
      src: `${name}.png`,
      sheetSize,
      tileSize,
      state: 'intro',
      frames,
      drawOffset,
      hotspotOffset: [0.5, 0.5, 0],
      bindCamera: config.preset === 'character',
      enableSpeech: true,
    };

    // Add portrait if configured
    if (config.needsPortrait || config.includePortrait) {
      spriteConfig.portraitSrc = `${name}_portrait.png`;
    }

    // Try to get AI-enhanced configuration
    try {
      const aiConfig = await generateSpriteConfig(description, config);
      
      // Merge AI suggestions with our calculated values
      // Keep our calculated frames but take other suggestions
      return {
        ...spriteConfig,
        ...aiConfig,
        frames: spriteConfig.frames, // Always use calculated frames
        sheetSize: spriteConfig.sheetSize,
        tileSize: spriteConfig.tileSize,
      };
    } catch {
      // Fall back to calculated config
      return spriteConfig;
    }
  }

  /**
   * Generate an audio asset
   * @param {string} description - Audio description
   * @param {object} config - Audio configuration
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>}
   */
  async generateAudioAsset(description, config, metadata = {}) {
    const result = { asset: null, error: null };

    try {
      const name = this.sanitizeName(metadata.name || this.extractName(description) || 'audio');
      const folder = config.type === 'music' ? 'audio/music' : 'audio/sfx';

      if (config.type === 'voice') {
        // Generate speech from the prompt/description
        const audioBuffer = await generateSpeech(description, {
          voice: config.voice || 'alloy',
          format: config.format || 'mp3',
        });

        const audioBlob = createAudioBlob(audioBuffer, config.format || 'mp3');

        result.asset = {
          type: 'audio',
          subtype: config.type,
          name: `${name}.${config.format || 'mp3'}`,
          path: `${folder}/${name}.${config.format || 'mp3'}`,
          content: audioBlob,
          contentType: `audio/${config.format || 'mpeg'}`,
        };
      } else {
        // For music/SFX, we'd need a different API
        // For now, return a placeholder or error
        result.error = {
          phase: 'audio',
          message: 'Music and SFX generation requires a specialized audio generation API',
        };
      }

    } catch (error) {
      result.error = {
        phase: 'audio',
        message: error.message,
      };
    }

    return result;
  }

  /**
   * Generate a text asset (script, cutscene, dialogue)
   * @param {string} description - Content description
   * @param {object} config - Text configuration
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>}
   */
  async generateTextAsset(description, config, metadata = {}) {
    const result = { asset: null, error: null };

    try {
      const name = this.sanitizeName(metadata.name || this.extractName(description) || 'content');
      let content = '';
      let ext = '';

      switch (config.type) {
      case 'cutscene':
        ext = 'pxc';
        content = await generateCutscene(description, {
          mood: metadata.style,
          length: 'medium',
        });
        break;

      case 'script':
        ext = 'pxs';
        content = await generateScript(description, 'callback');
        break;

      case 'config':
        ext = 'json';
        const configObj = await generateSpriteConfig(description, {
          tileSize: [24, 32],
          sheetSize: [96, 128],
          directions: 4,
          framesPerDirection: 4,
          preset: 'character',
        });
        content = JSON.stringify(configObj, null, 2);
        break;

      default:
        ext = 'pxc';
        content = await generateCutscene(description);
      }

      const folder = FOLDER_MAP[config.type] || 'dialogues';

      result.asset = {
        type: 'text',
        subtype: config.type,
        name: `${name}.${ext}`,
        path: folder ? `${folder}/${name}.${ext}` : `${name}.${ext}`,
        content,
        contentType: ext === 'json' ? 'application/json' : 'text/plain',
      };

    } catch (error) {
      result.error = {
        phase: 'text',
        message: error.message,
      };
    }

    return result;
  }

  /**
   * Write all generated assets to the zip filesystem
   * @param {Array} assets - Array of generated assets
   * @param {function} writeFile - Function to write files to zip
   * @returns {Promise<object>} Write results
   */
  async writeAssetsToZip(assets, writeFile) {
    const results = {
      success: [],
      failed: [],
    };

    for (const asset of assets) {
      try {
        let content = asset.content;
        
        // Convert Blob to appropriate format if needed
        if (content instanceof Blob) {
          if (asset.contentType.startsWith('text/') || asset.contentType === 'application/json') {
            content = await content.text();
          }
          // For binary files, the writeFile function should handle Blob
        }

        await writeFile(asset.path, content);
        results.success.push(asset);
        
      } catch (error) {
        results.failed.push({
          asset,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Sanitize a name for use as a filename
   * @param {string} name - Raw name
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  /**
   * Extract a potential name from description
   * @param {string} description - Description text
   * @returns {string|null}
   */
  extractName(description) {
    // Look for quoted names
    const quotedMatch = description.match(/["']([^"']+)["']/);
    if (quotedMatch) return quotedMatch[1];

    // Look for "named X" or "called X"
    const namedMatch = description.match(/(?:named|called)\s+(\w+)/i);
    if (namedMatch) return namedMatch[1];

    // Extract first noun-like word
    const words = description.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && /^[a-z]+$/i.test(word)) {
        const lower = word.toLowerCase();
        if (!['create', 'generate', 'make', 'build', 'with', 'that', 'this', 'have', 'has'].includes(lower)) {
          return lower;
        }
      }
    }

    return null;
  }
}

/**
 * Create an orchestrator instance with the given options
 * @param {object} options - Orchestrator options
 * @returns {AssetOrchestrator}
 */
export function createOrchestrator(options) {
  return new AssetOrchestrator(options);
}

export default AssetOrchestrator;
