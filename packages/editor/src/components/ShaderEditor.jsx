/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import { useState, useEffect, useRef } from 'react';

/**
 * ShaderEditor: write and preview custom GLSL shaders.
 *
 * - Vertex + fragment shader editors
 * - Live compile check
 * - Preview on a quad
 * - Save as preset
 */

const DEFAULT_VS = `attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjMat * uViewMat * uModelMat * vec4(aPosition, 1.0);
}`;

const DEFAULT_FS = `precision mediump float;
varying vec2 vTexCoord;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = vTexCoord;
  vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(uTime));
  gl_FragColor = vec4(col, 1.0);
}`;

export default function ShaderEditor({ shader, onSave, onClose }) {
  const [name, setName] = useState(shader?.name || 'custom-shader');
  const [vertexSrc, setVertexSrc] = useState(shader?.vs || DEFAULT_VS);
  const [fragmentSrc, setFragmentSrc] = useState(shader?.fs || DEFAULT_FS);
  const [errors, setErrors] = useState([]);
  const [compiling, setCompiling] = useState(false);
  const canvasRef = useRef(null);
  const glRef = useRef(null);

  // Compile check
  const compile = () => {
    setCompiling(true);
    setErrors([]);
    const errs = [];

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');

      let gl = glRef.current;
      if (!gl) {
        gl = canvas.getContext('webgl');
        if (!gl) throw new Error('WebGL not supported');
        glRef.current = gl;
      }

      // Compile vertex
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, vertexSrc);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        errs.push(`Vertex: ${gl.getShaderInfoLog(vs)}`);
      }

      // Compile fragment
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, fragmentSrc);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        errs.push(`Fragment: ${gl.getShaderInfoLog(fs)}`);
      }

      // Link
      if (errs.length === 0) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          errs.push(`Link: ${gl.getProgramInfoLog(prog)}`);
        } else {
          // Success — render preview
          renderPreview(gl, prog);
        }
        gl.deleteProgram(prog);
      }

      gl.deleteShader(vs);
      gl.deleteShader(fs);
    } catch (e) {
      errs.push(e.message);
    }

    setErrors(errs);
    setCompiling(false);
    return errs.length === 0;
  };

  const renderPreview = (gl, prog) => {
    gl.useProgram(prog);

    // Fullscreen quad
    const verts = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    const aTex = gl.getAttribLocation(prog, 'aTexCoord');
    if (aPos >= 0) {
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    }
    if (aTex >= 0) {
      gl.enableVertexAttribArray(aTex);
      gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 16, 8);
    }

    // Uniforms
    const uTime = gl.getUniformLocation(prog, 'uTime');
    if (uTime) gl.uniform1f(uTime, performance.now() / 1000);
    const uRes = gl.getUniformLocation(prog, 'uResolution');
    if (uRes) gl.uniform2f(uRes, 256, 256);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.deleteBuffer(buf);
  };

  // Auto-compile on change (debounced)
  useEffect(() => {
    const t = setTimeout(compile, 500);
    return () => clearTimeout(t);
  }, [vertexSrc, fragmentSrc]);

  const handleSave = () => {
    if (compile()) {
      onSave({ name, vs: vertexSrc, fs: fragmentSrc });
    }
  };

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-wide">
        <div className="ps-modal-header">
          <h2>Shader Editor</h2>
          <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ps-modal-body">
          <div className="ps-field">
            <label className="ps-field-label">Shader Name</label>
            <input
              type="text"
              className="ps-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="ps-shader-grid">
            <div className="ps-shader-pane">
              <h3>Vertex Shader</h3>
              <textarea
                className="ps-input ps-code"
                value={vertexSrc}
                rows={15}
                spellCheck={false}
                onChange={e => setVertexSrc(e.target.value)}
              />
            </div>
            <div className="ps-shader-pane">
              <h3>Fragment Shader</h3>
              <textarea
                className="ps-input ps-code"
                value={fragmentSrc}
                rows={15}
                spellCheck={false}
                onChange={e => setFragmentSrc(e.target.value)}
              />
            </div>
          </div>

          <div className="ps-shader-preview">
            <h3>Preview</h3>
            <canvas ref={canvasRef} width={256} height={256} className="ps-shader-canvas" />
            {compiling && <span className="ps-badge">Compiling…</span>}
          </div>

          {errors.length > 0 && (
            <div className="ps-shader-errors">
              <h3>Errors</h3>
              {errors.map((e, i) => (
                <div key={i} className="ps-field-error">{e}</div>
              ))}
            </div>
          )}
        </div>

        <div className="ps-modal-footer">
          <button className="ps-btn ps-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ps-btn ps-btn-primary"
            onClick={handleSave}
            disabled={errors.length > 0}
          >
            Save Shader
          </button>
        </div>
      </div>
    </div>
  );
}
