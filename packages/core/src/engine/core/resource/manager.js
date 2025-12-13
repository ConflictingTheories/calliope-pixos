/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Absolute imports
import { AudioLoader } from '../../utils/loaders/AudioLoader.js';

// Relative imports
import { Texture, ColorTexture } from './texture.js';
import Speech from '../scene/speech.js';

// Absolute imports
import { OBJ } from '../../utils/obj/index.js';
import ObjHelper from '../../utils/ObjHelper.js';
import GLEngine from '../index.js';

/**
 * ResourceManager - Manages loading and caching of game resources like textures, audio, models, etc.
 */
export default class ResourceManager {
  /**
   * Creates an instance of ResourceManager.
   * @param {GLEngine} engine - The game engine instance.
   * @returns {ResourceManager} The singleton instance.
   */
  constructor(engine) {
    if (!ResourceManager._instance) {
      /** @type {GLEngine} */
      this.engine = engine;

      /** @type {OBJ} */
      this.objLoader = OBJ;
      /** @type {ObjHelper} */
      this.objHelper = new ObjHelper(engine.gl);
        /**
         * Loads an OBJ model using ObjHelper (modern loader).
         * @param {string} objText - OBJ file content (string)
         * @param {string} [mtlText] - MTL file content (string, optional)
         * @param {Object} [textureMap] - Map of texture names to data URIs (optional)
         * @returns {Promise<ParsedMesh[]>} Array of parsed and initialized meshes
         */
        async loadModel(objText, mtlText = null, textureMap = null) {
          // Parse OBJ and MTL
          const meshes = this.objHelper.parseOBJ(objText);
          let materials = {};
          if (mtlText) {
            materials = this.objHelper.parseMTL(mtlText);
            this.objHelper.assignMaterials(meshes, materials);
          }
          // Load textures if provided
          if (textureMap) {
            await this.objHelper.loadTextures(meshes, textureMap);
          }
          // Initialize WebGL buffers
          this.objHelper.initBuffers(meshes);
          return meshes;
        }

        /**
         * Clean up WebGL resources for meshes loaded with ObjHelper.
         * @param {ParsedMesh[]} meshes
         */
        deleteModelBuffers(meshes) {
          this.objHelper.deleteMeshBuffers(meshes);
        }
      /** @type {AudioLoader} */
      this.audioLoader = new AudioLoader(this);

      // TODO: Move all resources into this class (tilesets, textures, audio, models, fonts, shaders).

      // ASSETS
      /** @type {Object.<string, Texture>} */
      this.textures = {};
      /** @type {Object.<string, Speech>} */
      this.speeches = {};

      ResourceManager._instance = this;
    }
    return ResourceManager._instance;
  }

  /**
   * Loads a texture from a source URL.
   * @param {string} src - The texture source URL.
   * @returns {Texture} The loaded texture.
   */
  loadTexture = (src) => {
    if (this.textures[src]) return this.textures[src];
    this.textures[src] = new Texture(src, this.engine);
    return this.textures[src];
  }

  /**
   * Loads a texture from a zip file.
   * @param {string} src - The texture filename in the zip.
   * @param {JSZip} zip - The zip file instance.
   * @returns {Promise<Texture>} The loaded texture.
   */
  loadTextureFromZip = async (src, zip) => {
    if (this.textures[src]) return this.textures[src];
    let imageData = await zip.file(`textures/${src}`).async('arrayBuffer');
    let buffer = new Uint8Array(imageData);
    let blob = new Blob([buffer.buffer]);
    let dataUrl = URL.createObjectURL(blob);
    this.textures[src] = new Texture(dataUrl, this.engine);
    return this.textures[src];
  }

  /**
   * Loads a speech instance.
   * @param {string} src - The speech source.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @returns {Speech} The loaded speech instance.
   */
  loadSpeech = (src, canvas) => {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this.engine, src);
    return this.speeches[src];
  }
}
