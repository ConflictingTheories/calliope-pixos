/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Absolute imports
import { AudioLoader } from '../utils/loaders/AudioLoader.jsx';

// Relative imports
import { Texture, ColorTexture } from './texture.jsx';
import Speech from './speech.jsx';

// Absolute imports
import { OBJ } from '../utils/obj';
import GLEngine from './index.jsx';

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
  
      // ASSETS
      this.textures = [];
      this.speeches = [];
  
      this.loadSpeech = this.loadSpeech.bind(this);
      this.loadTexture = this.loadTexture.bind(this);
      this.loadTextureFromZip = this.loadTextureFromZip.bind(this);
    }
    return ResourceManager._instance;
  }

  /**
   * load texture
   * @param {*} src
   * @returns
   */
  loadTexture(src) {
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
  async loadTextureFromZip(src, zip) {
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
  loadSpeech(src, canvas) {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this.engine, src);
    return this.speeches[src];
  }
}
