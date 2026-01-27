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

import GLEngine from '../index.js';
import RenderManager from './manager.js';

/**
 * LightManager - Manages lighting in the scene, including point lights and rendering.
 */
export default class LightManager {
  /**
   * Creates an instance of LightManager.
   * @param {RenderManager} renderManager - The render manager instance.
   * @returns {LightManager} The singleton instance.
   */
  constructor(renderManager) {
    if (!LightManager.instance) {
      /** @type {Object.<string, PointLight>} */
      this.lights = {};
      /** @type {RenderManager} */
      this.renderManager = renderManager;
      /** @type {GLEngine} */
      this.engine = renderManager.engine;
      LightManager.instance = this;
    }

    return LightManager.instance;
  }

  /**
   * Adds a light source to the renderer.
   * @param {string} id - The unique identifier for the light.
   * @param {number[]} pos - The position [x, y, z].
   * @param {number[]} color - The color [r, g, b].
   * @param {number[]} [attenuation=[0.8,0.8,0.8]] - The attenuation factors.
   * @param {number[]} [direction=[1,1,1]] - The direction vector.
   * @param {number} [density=1.0] - The density.
   * @param {number[]} [scatteringCoefficients=[1,1,1]] - The scattering coefficients.
   * @param {boolean} [enabled=true] - Whether the light is enabled.
   * @returns {string} The light ID.
   */
  addLight = (
    id,
    pos,
    color,
    attenuation = [0.8, 0.8, 0.8],
    direction = [1, 1, 1],
    density = 1.0,
    scatteringCoefficients = [1, 1, 1],
    enabled = true
  ) => {
    const { shaderProgram } = this.renderManager;
    let index = this.lights.length;
    if (index >= shaderProgram.maxLights) return;
    let light = new PointLight(
      this.renderManager.engine,
      id,
      color,
      pos,
      attenuation,
      direction,
      density,
      scatteringCoefficients,
      enabled
    );
    this.lights[id] = light;
    return id;
  };

  /**
   * Updates an existing light source.
   * @param {string} id - The light ID.
   * @param {number[]} [pos] - The new position.
   * @param {number[]} [color] - The new color.
   * @param {number[]} [attenuation] - The new attenuation.
   * @param {number[]} [direction] - The new direction.
   * @param {number} [density] - The new density.
   * @param {number[]} [scatteringCoefficients] - The new scattering coefficients.
   * @param {boolean} [enabled] - Whether to enable/disable.
   */
  updateLight = (
    id,
    pos,
    color,
    attenuation,
    direction,
    density,
    scatteringCoefficients,
    enabled
  ) => {
    let light = this.lights[id];
    if (!light) return;
    if (pos) light.pos = pos;
    if (color) light.color = color;
    if (attenuation) light.attenuation = attenuation;
    if (direction) light.direction = direction;
    if (density) light.density = density;
    if (scatteringCoefficients) light.scatteringCoefficients = scatteringCoefficients;
    if (enabled) light.enabled = enabled;
    this.lights[id] = light;
  };

  /**
   * Removes a light source from the renderer.
   * @param {string} id - The light ID to remove.
   */
  removeLight = id => {
    delete this.lights[id];
  };

  /**
   * Updates point lighting for all lights.
   */
  tick = () => {
    let keys = Object.keys(this.lights);
    for (let i = 0; i < keys.length; i++) {
      this.lights[keys[i]].tick();
    }
  };

  /**
   * Renders lights to the scene.
   */
  render = () => {
    const { shaderProgram } = this.renderManager;
    let lightUniforms = shaderProgram.uLights;

    if (!lightUniforms) return;

    for (let i = 0; i < shaderProgram.maxLights; i++) {
      let keys = Object.keys(this.lights);

      if (!this.lights[keys[i]]) continue;
      if (!this.lights[keys[i]].enabled) continue;

      this.lights[keys[i]].draw(lightUniforms[i]);
    }
  };

  /**
   * Sets matrix uniforms and renders lights to the frame.
   */
  setMatrixUniforms = () => {
    // update lights
    this.tick();

    // render point lights to scene
    this.render();
  };
}

/**
 * PointLight - Represents a point light source in the scene.
 */
export class PointLight {
  /**
   * Creates an instance of PointLight.
   * @param {GLEngine} engine - The game engine instance.
   * @param {string} id - The light ID.
   * @param {number[]} color - The color [r, g, b].
   * @param {number[]} position - The position [x, y, z].
   * @param {number[]} attenuation - The attenuation factors.
   * @param {number[]} direction - The direction vector.
   * @param {number} density - The density.
   * @param {number[]} scatteringCoefficients - The scattering coefficients.
   * @param {boolean} enabled - Whether the light is enabled.
   */
  constructor(
    engine,
    id,
    color,
    position,
    attenuation,
    direction,
    density,
    scatteringCoefficients,
    enabled
  ) {
    /** @type {GLEngine} */
    this.engine = engine;
    /** @type {string} */
    this.id = id ?? 'light';
    /** @type {number[]} */
    this.color = color ?? [1.0, 1.0, 1.0];
    /** @type {number[]} */
    this.pos = position ?? [0.0, 0.0, 0.0];
    /** @type {number[]} */
    this.attenuation = attenuation ?? [0.5, 0.1, 0.0];
    /** @type {number} */
    this.density = density ?? 0.8;
    /** @type {number[]} */
    this.scatteringCoefficients = scatteringCoefficients ?? [0.5, 0.5, 0.5];
    /** @type {number[]} */
    this.direction = direction ?? [1.0, 1.0, 1.0];
    /** @type {boolean} */
    this.enabled = enabled ?? true;
    /** @type {number} */
    this.frame = 0;
  }

  /**
   * Updates the light (e.g., for flicker effects).
   */
  tick = () => {
    // for (var i = 0; i < 3; i++) this.color[i] += Math.sin((0.0005 * this.frame * 180) / Math.PI) * 0.002;
    this.frame++;
  };

  /**
   * Draws the light to the scene.
   * @param {Object} lightUniforms - The light uniforms object.
   */
  draw = lightUniforms => {
    const { gl } = this.engine;
    gl.uniform1f(lightUniforms.enabled, this.enabled);
    gl.uniform3fv(lightUniforms.position, this.pos);
    gl.uniform3fv(lightUniforms.color, this.color);
    gl.uniform3fv(lightUniforms.attenuation, this.attenuation);

    // Set new uniforms for volumetric lighting
    gl.uniform3fv(lightUniforms.direction, this.direction);
    gl.uniform3fv(lightUniforms.scatteringCoefficients, this.scatteringCoefficients);
    gl.uniform1f(lightUniforms.density, this.density);
  };
}
