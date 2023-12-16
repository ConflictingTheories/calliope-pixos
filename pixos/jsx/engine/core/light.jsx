/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import GLEngine from './index.jsx';

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
   */
  addLight(id, pos, color, attentuation = [0.5, 0.1, 0.0], enabled = true) {
    const { shaderProgram } = this.engine;
    let index = this.lights.length;
    if (index >= shaderProgram.maxLights) return;
    this.lights.push(new PointLight(id, color, pos, attentuation, enabled));
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
    if(!lightUniforms) return;
    
    for (let i = 0; i < lightUniforms.length; i++) {
      if (!this.lights[i].enabled) continue;
      this.lights[i].draw(lightUniforms[i]);
    }
  }

  /** draw to frame
   */
  setMatrixUniforms() {
    const { gl, shaderProgram } = this.engine;
    // TODO - main - OLD direction lighting
    if (this.lights.length > 0) {
      gl.uniform3fv(shaderProgram.uLightPosition, this.lights[0].pos);
      gl.uniform3fv(shaderProgram.uLightColor, this.lights[0].color);
      gl.uniform3fv(shaderProgram.uLightDirection, this.lights[0].direction ?? []);
    }
    gl.uniform1f(shaderProgram.uLightIsDirectional, 0.0);
    gl.uniform1f(shaderProgram.useLighting, 0.0);

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
  constructor(id, color, position, attenuation, enabled) {
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
    for (var i = 0; i < 3; i++) {
      this.color[i] += Math.sin((0.000005 * this.frame * 180) / Math.PI) * 0.0002;
      // this.pos[i] += Math.sin((0.0005 * this.frame * 180) / Math.PI) * 0.002;
      // this.attenuation[i] += Math.sin((0.05 * this.frame * 180) / Math.PI) * 0.02;
    }
    this.frame++;
  }

  // draw light
  draw(lightUniforms) {
    const { gl } = this.engine;
    // todo: draw light
    gl.uniform1f(lightUniforms.enabled, this.enabled);
    gl.uniform3fv(lightUniforms.position, this.pos);
    gl.uniform3fv(lightUniforms.color, this.color);
    gl.uniform3fv(lightUniforms.attenuation, this.attenuation);
  }
}
