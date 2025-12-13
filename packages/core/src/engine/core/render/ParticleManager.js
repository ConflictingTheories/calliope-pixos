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

import { Vector } from '../../utils/math/vector.js';

/**
 * @typedef {object} ParticleConfig
 * @property {number} [count=8] - Number of particles to emit.
 * @property {number} [life=1000] - Lifetime in milliseconds.
 * @property {number} [speed=0.02] - Initial speed.
 * @property {number} [spread=0.5] - Spread factor for direction.
 * @property {number} [size=0.5] - Particle size.
 * @property {number[]} [color=[1.0, 0.7, 0.2]] - RGB color array.
 * @property {number[]} [gravity=[0, -0.00098, 0]] - Gravity vector.
 * @property {number} [drag=0.995] - Drag coefficient.
 * @property {string} [preset] - Preset name for quick config.
 */

/**
 * @typedef {object} Particle
 * @property {number[]} pos - Position [x, y, z].
 * @property {number[]} vel - Velocity [vx, vy, vz].
 * @property {number} life - Total lifetime.
 * @property {number} age - Current age.
 * @property {number} size - Size scalar.
 * @property {number[]} color - RGB color.
 * @property {number[]} gravity - Gravity vector.
 * @property {number} drag - Drag coefficient.
 */

/**
 * ParticleManager - Manages particle effects in the Pixos game engine.
 * Handles emission, physics updates, and rendering of particles.
 */
export default class ParticleManager {
  /**
   * Creates an instance of ParticleManager.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;
    /** @type {import('../index.js').default} */
    this.engine = renderManager.engine;
    /** @type {Particle[]} */
    this.particles = [];
    /** @type {boolean} */
    this.initialized = false;
    /** @type {WebGLBuffer|null} */
    this.vertexPosBuf = null;
    /** @type {WebGLBuffer|null} */
    this.vertexTexBuf = null;
    /** @type {number|null} */
    this.lastUpdateTime = null;
  }

  /**
   * Initializes GL buffers. Called after RenderManager has initialized shaders/GL.
   * @returns {void}
   */
  init = () => {
    /** @type {WebGL2RenderingContext} */
    const gl = this.engine.gl;
    if (!gl) return;

    // A simple unit quad centered at origin (two triangles)
    const quad = [
      -0.5, -0.5, 0,
      -0.5, 0.5, 0,
      0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, 0.5, 0,
      0.5, -0.5, 0,
    ];
    // Simple UVs (not used when not texturing)
    const uvs = [
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,
    ];

    this.vertexPosBuf = this.renderManager.createBuffer(quad, gl.STATIC_DRAW, 3);
    this.vertexTexBuf = this.renderManager.createBuffer(uvs, gl.STATIC_DRAW, 2);
    this.initialized = true;
  };

  /**
   * Emits particles based on a config object.
   * @param {number[]|Vector} [position=[0, 0, 0]] - Position [x, y, z] or Vector.
   * @param {ParticleConfig} [config={}] - Configuration for particles.
   * @returns {void}
   */
  emit = (position = [0, 0, 0], config = {}) => {
    /** @type {number[]} */
    let pos = Array.isArray(position) ? position : position.toArray ? position.toArray() : [0, 0, 0];
    let x = pos[0], y = pos[1], zOffset = pos[2] || 0;
    /** @type {import('../../scene/zone.js').Zone|null} */
    let zone = this.engine.spritz.world.zoneContaining(x, y);
    let z = zOffset;
    if (zone) {
      z += zone.getHeight(x, y);
    }

    pos = [x, y, z];

    /** @type {ParticleConfig} */
    const c = Object.assign(
      {
        count: 8,
        life: 1000, // ms
        speed: 0.02,
        spread: 0.5,
        size: 0.5,
        color: [1.0, 0.7, 0.2],
        gravity: [0, -0.00098, 0],
        drag: 0.995,
      },
      config
    );

    for (let i = 0; i < c.count; i++) {
      // random direction in unit sphere
      const rx = (Math.random() * 2 - 1) * c.spread;
      const ry = (Math.random() * 2 - 1) * c.spread;
      const rz = (Math.random() * 2 - 1) * c.spread;
      const vx = rx * c.speed * (0.5 + Math.random() * 1.5);
      const vy = ry * c.speed * (0.5 + Math.random() * 1.5);
      const vz = rz * c.speed * (0.5 + Math.random() * 1.5);

      /** @type {Particle} */
      const particle = {
        pos: [pos[0], pos[1], pos[2]],
        vel: [vx, vy, vz],
        life: c.life,
        age: 0,
        size: c.size * (0.8 + Math.random() * 0.8),
        color: c.color,
        gravity: c.gravity,
        drag: c.drag,
      };
      this.particles.push(particle);
    }
  };

  /**
   * Returns a preset configuration for particles.
   * @param {string} name - The preset name.
   * @returns {ParticleConfig|null} The preset config or null if not found.
   */
  preset = (name) => {
    switch ((name || '').toLowerCase()) {
      case 'sparks':
        return { count: 12, life: 700, speed: 0.06, spread: 1.2, size: 0.15, color: [1, 0.8, 0.2], gravity: [0, -0.002, 0] };
      case 'flame':
        return { count: 200, life: 2000, speed: 0.02, spread: 0.8, size: 0.06, color: [1, 0.5, 0.1], gravity: [0, -0.0003, 0], drag: 0.995 };
      case 'water':
        return { count: 20, life: 800, speed: 0.05, spread: 1.5, size: 0.12, color: [0.6, 0.7, 1.0], gravity: [0, -0.003, 0], drag: 0.996 };
      case 'weapon':
        return { count: 6, life: 600, speed: 0.08, spread: 0.3, size: 0.18, color: [1, 1, 0.6], gravity: [0, -0.001, 0] };
      default:
        return null;
    }
  };

  /**
   * Updates particle physics. Timestamp in ms.
   * @param {number} timestamp - Current timestamp.
   * @returns {void}
   */
  update = (timestamp) => {
    if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
    const dt = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;
    if (!dt) return;

    // Update particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      /** @type {Particle} */
      const p = this.particles[i];
      // apply gravity
      p.vel[0] += (p.gravity[0] || 0) * dt;
      p.vel[1] += (p.gravity[1] || 0) * dt;
      p.vel[2] += (p.gravity[2] || 0) * dt;
      // apply drag
      p.vel[0] *= Math.pow(p.drag || 1, dt / 16.6667);
      p.vel[1] *= Math.pow(p.drag || 1, dt / 16.6667);
      p.vel[2] *= Math.pow(p.drag || 1, dt / 16.6667);
      // integrate
      p.pos[0] += p.vel[0] * dt;
      p.pos[1] += p.vel[1] * dt;
      p.pos[2] += p.vel[2] * dt;
      p.age += dt;
      if (p.age >= p.life) {
        this.particles.splice(i, 1);
      }
    }
  };

  /**
   * Renders particles using the dedicated particle shader as proper billboards.
   * Particles are sorted back-to-front for correct alpha blending.
   * @returns {void}
   */
  render = () => {
    if (!this.initialized) this.init();
    if (!this.initialized) return;
    if (!this.particles.length) return;

    /** @type {import('./manager.js').default} */
    const rm = this.renderManager;
    /** @type {WebGL2RenderingContext} */
    const gl = this.engine.gl;
    /** @type {WebGLProgram} */
    const shader = rm.particleShaderProgram;
    if (!shader) return;

    // Reset all vertex attrib arrays to prevent errors from other shaders
    for (let i = 0; i < 8; i++) {
      gl.disableVertexAttribArray(i);
    }

    // Use particle shader
    gl.useProgram(shader);

    // Enable blending for transparency - additive blending for glow effects
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    // Disable depth writing (but keep depth test) for proper transparency
    gl.depthMask(false);

    // Enable vertex attributes for particle shader
    gl.enableVertexAttribArray(shader.aVertexPosition);
    gl.enableVertexAttribArray(shader.aTextureCoord);

    // Sort particles back-to-front based on distance from camera
    const cameraPos = rm.camera.cameraPosition;
    const sortedParticles = [...this.particles].sort((a, b) => {
      const distA = Math.pow(a.pos[0] - cameraPos.x, 2) + 
                    Math.pow(a.pos[1] - cameraPos.y, 2) + 
                    Math.pow(a.pos[2] - cameraPos.z, 2);
      const distB = Math.pow(b.pos[0] - cameraPos.x, 2) + 
                    Math.pow(b.pos[1] - cameraPos.y, 2) + 
                    Math.pow(b.pos[2] - cameraPos.z, 2);
      return distB - distA; // Back to front
    });

    for (const p of sortedParticles) {
      rm.mvPushMatrix();
      
      // Set model matrix translation only (billboarding handled in shader)
      const m = rm.uModelMat;
      // Reset to identity
      for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
      // Set translation
      m[12] = p.pos[0];
      m[13] = p.pos[1];
      m[14] = p.pos[2];

      // Calculate alpha based on particle age (fade out towards end of life)
      const lifeRatio = p.age / p.life;
      const alpha = Math.max(0, 1.0 - lifeRatio * lifeRatio); // Quadratic fade

      // Set scale and matrix uniforms with alpha
      const scaleVec = new Vector(p.size, p.size, p.size);
      shader.setMatrixUniforms({ scale: scaleVec, color: p.color, alpha: alpha });

      // Bind buffers and draw
      rm.bindBuffer(this.vertexPosBuf, shader.aVertexPosition);
      rm.bindBuffer(this.vertexTexBuf, shader.aTextureCoord);
      gl.drawArrays(gl.TRIANGLES, 0, this.vertexPosBuf.numItems);

      rm.mvPopMatrix();
    }

    // Restore depth mask and blending
    gl.depthMask(true);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Disable vertex attrib arrays to prevent WebGL state issues
    gl.disableVertexAttribArray(shader.aVertexPosition);
    gl.disableVertexAttribArray(shader.aTextureCoord);
    
    // cleanup
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  };
}
