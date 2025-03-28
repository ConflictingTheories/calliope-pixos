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

import GLEngine from '../index.jsx';
import RenderManager from './manager.jsx';

export default class LightManager {
  /** Light Manager for Scene
   *
   * @param {GLEngine} engine
   */
  constructor() {
    this.lights = {};
    // methods
    this.addLight = this.addLight.bind(this);
    this.removeLight = this.removeLight.bind(this);
    this.tick = this.tick.bind(this);
    this.render = this.render.bind(this);
    this.setMatrixUniforms = this.setMatrixUniforms.bind(this);
  }

  /**
   * Get the instance of the Camera Manager
   * @returns {CameraManager} The Camera Manager instance
   */
  static getInstance() {
    if (!LightManager.instance) {
      LightManager.instance = new LightManager();
    }
    return LightManager.instance;
  }

  /**
   * Create a new camera instance
   * @param {RenderManager} renderManager The rendering manager
   * @returns {LightManager} The camera instance
   */
  createLightManager(renderManager) {
    if (!this.renderManager) {
      this.renderManager = renderManager;
      this.engine = renderManager.engine;
    }
    return LightManager.instance;
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   * @param {*} pos
   * @param {*} color
   * @param {*} attentuation
   * @param {*} direction
   * @param {*} density
   * @param {*} scatteringCoefficients
   * @param {*} enabled
   * @returns id
   */
  addLight(id, pos, color, attentuation = [0.8, 0.8, 0.8], direction = [1, 1, 1], density = 1.0, scatteringCoefficients = [1, 1, 1], enabled = true) {
    const { shaderProgram } = this.renderManager;
    let index = this.lights.length;
    if (index >= shaderProgram.maxLights) return;
    let light = new PointLight(this.renderManager.engine, id, color, pos, attentuation, direction, density, scatteringCoefficients, enabled);
    this.lights[id] = light;
    return id;
  }

  /**
   *
   * @param {*} id
   * @param {*} pos
   * @param {*} color
   * @param {*} attentuation
   * @param {*} direction
   * @param {*} density
   * @param {*} scatteringCoefficients
   * @param {*} enabled
   */
  updateLight(id, pos, color, attentuation, direction, density, scatteringCoefficients, enabled) {
    let light = this.lights[id];
    if (!light) return;
    if (pos) light.pos = pos;
    if (color) light.color = color;
    if (attentuation) light.attenuation = attentuation;
    if (direction) light.direction = direction;
    if (density) light.density = density;
    if (scatteringCoefficients) light.scatteringCoefficients = scatteringCoefficients;
    if (enabled) light.enabled = enabled;
    this.lights[id] = light;
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   */
  removeLight(id) {
    delete this.lights[id];
  }

  /**
   * Update Point lighting
   * @returns
   */
  tick() {
    let keys = Object.keys(this.lights);
    for (let i = 0; i < keys.length; i++) {
      this.lights[keys[i]].tick();
    }
  }

  // Draw Lights to scene
  render() {
    const { shaderProgram } = this.renderManager;
    let lightUniforms = shaderProgram.uLights;

    if (!lightUniforms) return;

    for (let i = 0; i < shaderProgram.maxLights; i++) {
      let keys = Object.keys(this.lights);

      if (!this.lights[keys[i]]) continue;
      if (!this.lights[keys[i]].enabled) continue;

      this.lights[keys[i]].draw(lightUniforms[i]);
    }
  }

  /** draw to frame
   */
  setMatrixUniforms() {
    // update lights
    this.tick();

    // render point lights to scene
    this.render();
  }
}

export class PointLight {
  /**
   * Point Light
   */
  constructor(engine, id, color, position, attenuation, direction, density, scatteringCoefficients, enabled) {
    this.engine = engine;
    this.id = id ?? 'light';
    this.color = color ?? [1.0, 1.0, 1.0];
    this.pos = position ?? [0.0, 0.0, 0.0];
    this.attenuation = attenuation ?? [0.5, 0.1, 0.0];
    this.density = density ?? 0.8;
    this.scatteringCoefficients = scatteringCoefficients ?? [0.5, 0.5, 0.5];
    this.direction = direction ?? [1.0, 1.0, 1.0];
    this.enabled = enabled ?? true;
    this.frame = 0;
    // methods
    this.draw = this.draw.bind(this);
    this.tick = this.tick.bind(this);
  }

  // update light (ex. for flicker)
  tick() {
    // for (var i = 0; i < 3; i++) this.color[i] += Math.sin((0.0005 * this.frame * 180) / Math.PI) * 0.002;
    this.frame++;
  }

  // draw light
  draw(lightUniforms) {
    const { gl } = this.engine;
    gl.uniform1f(lightUniforms.enabled, this.enabled);
    gl.uniform3fv(lightUniforms.position, this.pos);
    gl.uniform3fv(lightUniforms.color, this.color);
    gl.uniform3fv(lightUniforms.attenuation, this.attenuation);

    // Set new uniforms for volumetric lighting
    gl.uniform3fv(lightUniforms.direction, this.direction);
    gl.uniform3fv(lightUniforms.scatteringCoefficients, this.scatteringCoefficients);
    gl.uniform1f(lightUniforms.density, this.density);
  }
}
