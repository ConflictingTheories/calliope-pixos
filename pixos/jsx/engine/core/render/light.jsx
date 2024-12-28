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
import { rotate, translate } from '@Engine/utils/math/matrix4.jsx';
import { degToRad } from '../../utils/math/vector.jsx';

export default class LightManager {
  /** Light Manager for Scene
   *
   * @param {GLEngine} engine
   */
  constructor(engine) {
    this.engine = engine;
    this.lights = [];
    // methods
    this.addLight = this.addLight.bind(this);
    this.removeLight = this.removeLight.bind(this);
    this.tick = this.tick.bind(this);
    this.render = this.render.bind(this);
    this.setMatrixUniforms = this.setMatrixUniforms.bind(this);
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   * @param {*} pos
   * @param {*} color
   * @param {*} attentuation
   * @param {*} enabled
   * @returns index
   */
  addLight(id, pos, color, attentuation = [0.5, 0.1, 0.0], enabled = true) {
    const { shaderProgram } = this.engine;
    let index = this.lights.length;
    if (index >= shaderProgram.maxLights) return;
    let light = new PointLight(this.engine, id, color, pos, attentuation, enabled);
    this.lights.push(light);
    return index;
  }

  /**
   *
   * @param {*} id
   * @param {*} pos
   * @param {*} color
   * @param {*} attentuation
   * @param {*} enabled
   */
  updateLight(id, pos, color, attentuation, enabled) {
    this.lights = this.lights.map((light) => {
      if (light.id === id) {
        if (pos) light.pos = pos;
        if (color) light.color = color;
        if (attentuation) light.attenuation = attentuation;
        if (enabled) light.enabled = enabled;
      }
      return light;
    });
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   */
  removeLight(id) {
    this.lights = this.lights.filter((light) => light.id !== id);
  }

  /**
   * Update Point lighting
   * @returns
   */
  tick() {
    for (let i = 0; i < this.lights.length; i++) {
      this.lights[i].tick();
    }
  }

  // Draw Lights to scene
  render() {
    const { gl, shaderProgram } = this.engine;
    let lightUniforms = shaderProgram.uLights;

    if (!lightUniforms) return;

    for (let i = 0; i < shaderProgram.maxLights; i++) {
      if (!this.lights[i]) continue;
      if (!this.lights[i].enabled) continue;
      this.lights[i].draw(lightUniforms[i]);
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
  constructor(engine, id, color, position, attenuation, enabled) {
    this.engine = engine;
    this.id = id ?? 'light';
    this.color = color ? color : [1.0, 1.0, 1.0];
    this.pos = position ? position : [0.0, 0.0, 0.0];
    this.attenuation = attenuation ? attenuation : [0.5, 0.1, 0.0];
    this.enabled = enabled ? enabled : true;
    this.frame = 0;
    // methods
    this.draw = this.draw.bind(this);
    this.tick = this.tick.bind(this);
  }

  // update light (ex. for flicker)
  tick() {
    for (var i = 0; i < 3; i++) this.color[i] += Math.sin((0.0005 * this.frame * 180) / Math.PI) * 0.002;

    this.frame++;
  }

  // draw light
  draw(lightUniforms) {
    const { gl, renderManager, camera } = this.engine;
    gl.uniform1f(lightUniforms.enabled, this.enabled);
    gl.uniform3fv(lightUniforms.position, this.pos);
    gl.uniform3fv(lightUniforms.color, this.color);
    gl.uniform3fv(lightUniforms.attenuation, this.attenuation);
  }
}
