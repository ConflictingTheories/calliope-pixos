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
import GLEngine from '../index.js';

export default class ResourceManager {
  /** Rendering Manager for Engine
   *
   * @param {GLEngine} engine
   */
  constructor(engine) {
    if (!ResourceManager._instance) {
      this.engine = engine;

      this.objLoader = OBJ;
      this.audioLoader = new AudioLoader(this);

      // todo - need to move all resources into this class
      // --> tilesets
      // --> textures
      // --> audio
      // --> models
      // --> fonts
      // --> possibly shaders....

      // ASSETS
      this.textures = [];
      this.speeches = [];

      ResourceManager._instance = this;
    }
    return ResourceManager._instance;
  }

  /**
   * load texture
   * @param {*} src
   * @returns
   */
  loadTexture = (src) => {
    if (this.textures[src]) return this.textures[src];
    this.textures[src] = new Texture(src, this.engine);
    return this.textures[src];
  }

  /**
   * load texture from zip
   * @param {*} src
   * @param {*} zip
   * @returns
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
   * load speech
   * @param {*} src
   * @param {*} canvas
   * @returns
   */
  loadSpeech = (src, canvas) => {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this.engine, src);
    return this.speeches[src];
  }
}
