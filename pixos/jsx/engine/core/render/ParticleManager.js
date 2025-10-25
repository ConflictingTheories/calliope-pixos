import { create, set } from '../../utils/math/matrix4.js';
import { Vector } from '../../utils/math/vector.js';

export default class ParticleManager {
  constructor(renderManager) {
    this.renderManager = renderManager;
    this.engine = renderManager.engine;
    this.particles = [];
    this.initialized = false;
    this.vertexPosBuf = null;
    this.vertexTexBuf = null;
    this.lastUpdateTime = null;
  }

  /**
   * Initialize GL buffers. Called after RenderManager has initialized shaders/GL.
   */
  init = () => {
    const gl = this.engine.gl;
    if (!gl) return;

    // A simple unit quad centered at origin (two triangles)
    const quad = [
      -0.5, -0.5, 0,
      -0.5,  0.5, 0,
       0.5,  0.5, 0,
      -0.5, -0.5, 0,
       0.5,  0.5, 0,
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
   * Emit particles based on a config object.
   * position: [x,y,z] or Vector
   * config: { count, life, speed, spread, size, color, gravity, drag, preset }
   */
  emit = (position = [0, 0, 0], config = {}) => {
    const pos = Array.isArray(position) ? position : position.toArray ? position.toArray() : [0, 0, 0];
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

      this.particles.push({
        pos: [pos[0], pos[1], pos[2]],
        vel: [vx, vy, vz],
        life: c.life,
        age: 0,
        size: c.size * (0.8 + Math.random() * 0.8),
        color: c.color,
        gravity: c.gravity,
        drag: c.drag,
      });
    }
  };

  /**
   * Some handy presets
   */
  preset = (name) => {
    switch ((name || '').toLowerCase()) {
      case 'sparks':
        return { count: 12, life: 700, speed: 0.06, spread: 1.2, size: 0.15, color: [1, 0.8, 0.2], gravity: [0, -0.002, 0] };
      case 'flame':
        return { count: 20, life: 2000, speed: 0.02, spread: 0.8, size: 0.6, color: [1, 0.5, 0.1], gravity: [0, -0.0003, 0], drag: 0.995 };
      case 'water':
        return { count: 20, life: 800, speed: 0.05, spread: 1.5, size: 0.12, color: [0.6, 0.7, 1.0], gravity: [0, -0.003, 0], drag: 0.996 };
      case 'weapon':
        return { count: 6, life: 600, speed: 0.08, spread: 0.3, size: 0.18, color: [1, 1, 0.6], gravity: [0, -0.001, 0] };
      default:
        return null;
    }
  };

  /**
   * Update physics. timestamp in ms.
   */
  update = (timestamp) => {
    if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
    const dt = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;
    if (!dt) return;

    // Update particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
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
   * Render particles using the dedicated particle shader as proper billboards.
   */
  render = () => {
    if (!this.initialized) this.init();
    if (!this.initialized) return;
    if (!this.particles.length) return;

    const rm = this.renderManager;
    const gl = this.engine.gl;
    const shader = rm.particleShaderProgram;
    if (!shader) return;

    // Use particle shader
    gl.useProgram(shader);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // We will draw each particle as a small quad using the particle shader.
    gl.enableVertexAttribArray(shader.aVertexPosition);
    gl.enableVertexAttribArray(shader.aTextureCoord);

    for (const p of this.particles) {
      rm.mvPushMatrix();
      // translate to particle position
      const m = rm.uModelMat;
      m[12] = p.pos[0];
      m[13] = p.pos[1];
      m[14] = p.pos[2];

      // Set scale and matrix uniforms - uniform scale for proper billboarding
      const scaleVec = new Vector(p.size, p.size, p.size);
      shader.setMatrixUniforms({ scale: scaleVec, color: p.color });

      // Bind buffers and draw
      rm.bindBuffer(this.vertexPosBuf, shader.aVertexPosition);
      rm.bindBuffer(this.vertexTexBuf, shader.aTextureCoord);
      gl.drawArrays(gl.TRIANGLES, 0, this.vertexPosBuf.numItems);

      rm.mvPopMatrix();
    }

    // cleanup
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  };
}
