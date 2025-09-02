// index.jsx — Tileset Editor (repair drop‑in)
// Renders atlas, thumbnail, and GL canvas reliably. No build tools needed beyond React.
// It fixes the original "blank canvas" issue by:
// 1) Explicitly sizing <canvas> elements using devicePixelRatio.
// 2) Drawing immediately after image/file loads and on every relevant state change.
// 3) Creating the WebGL context once and reusing it; guarding against StrictMode double mounts.
// 4) Resizing with a ResizeObserver so CSS sizing won't produce a zero pixel drawing buffer.

import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------- utilities ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;

function useResize(canvasRef, onResize) {
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const parent = el.parentElement || el;
    const ro = new ResizeObserver(() => {
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      if (typeof onResize === 'function') onResize(w, h);
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, [canvasRef, onResize]);
}

function setCanvasSize(canvas, cssW, cssH) {
  if (!canvas) return;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const W = Math.max(1, Math.floor(cssW * dpr));
  const H = Math.max(1, Math.floor(cssH * dpr));
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  return { W, H };
}

// ---------- WebGL helpers ----------
function createShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error('Shader compile failed: ' + log);
  }
  return sh;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error('Program link failed: ' + log);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return prog;
}

const VS = `
attribute vec2 aPos;
attribute vec2 aUV;
varying vec2 vUV;
uniform vec2 uScale; // scale UV to show a tile region
uniform vec2 uOffset; // offset UV
void main() {
  vUV = aUV * uScale + uOffset;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
const FS = `
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;
void main() {
  gl_FragColor = texture2D(uTex, vUV);
}`;

// ---------- main component ----------
export default function TilesetAtlasEditor({atlasImage, atlasURL, sheetSize, tileSize}) {

  // selection
  const [sel, setSel] = useState({ gx: 0, gy: 0 }); // grid indices
  const [hover, setHover] = useState(null);

  // canvases
  const atlasCanvas = useRef(null);
  const thumbCanvas = useRef(null);
  const glCanvas = useRef(null);

  // drawing contexts / GL program
  const glRef = useRef(null);
  const glResRef = useRef({
    prog: null, vao: null, buf: null,
    tex: null, uScale: null, uOffset: null, aPos: null, aUV: null,
  });
  const initializedRef = useRef(false); // guard StrictMode double-mount

  // --- file ingestion ---
  useEffect(() => {
    if (!atlasURL) return;
    const img = new Image();
    img.onload = () => {
      setAtlasImage(img);
      setSheetSize([img.naturalWidth, img.naturalHeight]);
    };
    img.onerror = () => {
      console.error('Failed to load atlas image');
    };
    img.src = atlasURL;
    return () => { /* no-op: URL revoked in a different effect */ };
  }, [atlasURL]);

  // revoke object URL on unmount / change
  useEffect(() => {
    return () => { if (atlasURL) URL.revokeObjectURL(atlasURL); };
  }, [atlasURL]);

  // --- sizing: responsive canvases ---
  const resizeAtlas = React.useCallback((w, h) => {
    // Make the atlas canvas square-ish but constrained by parent
    const size = Math.min(w, h);
    setCanvasSize(atlasCanvas.current, size, size);
    drawAtlas();
  }, []);
  const resizeThumb = React.useCallback((w, h) => {
    const s = Math.min(192, Math.min(w, h));
    setCanvasSize(thumbCanvas.current, s, s);
    drawThumb();
  }, []);
  const resizeGL = React.useCallback((w, h) => {
    const H = Math.max(180, Math.floor(h * 0.6));
    const W = Math.max(250, w);
    setCanvasSize(glCanvas.current, W, H);
    drawGL(); // will reconfigure viewport
  }, []);

  useResize(atlasCanvas, resizeAtlas);
  useResize(thumbCanvas, resizeThumb);
  useResize(glCanvas, resizeGL);

  // --- draw: 2D ATLAS canvas ---
  const drawGrid = (ctx, w, h) => {
    const [aw, ah] = sheetSize;
    const cols = Math.max(1, Math.floor(aw / tileSize));
    const rows = Math.max(1, Math.floor(ah / tileSize));
    const sx = w / aw;
    const sy = h / ah;

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      const x = Math.round(c * tileSize * sx) + 0.5;
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let r = 0; r <= rows; r++) {
      const y = Math.round(r * tileSize * sy) + 0.5;
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawAtlas = React.useCallback(() => {
    const canvas = atlasCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const { width: W, height: H } = canvas;

    // bg checker
    ctx.save();
    const s = 12 * dpr;
    for (let y = 0; y < H; y += s) {
      for (let x = 0; x < W; x += s) {
        ctx.fillStyle = ((x / s + y / s) % 2) ? '#263238' : '#37474f';
        ctx.fillRect(x, y, s, s);
      }
    }
    ctx.restore();

    if (atlasImage) {
      // fit image to canvas
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(atlasImage, 0, 0, canvas.width, canvas.height);
    }

    drawGrid(ctx, W, H);

    // selection highlight
    if (atlasImage) {
      const [aw, ah] = sheetSize;
      const sx = W / aw, sy = H / ah;
      const x = Math.floor(sel.gx) * tileSize * sx;
      const y = Math.floor(sel.gy) * tileSize * sy;
      const w = tileSize * sx;
      const h = tileSize * sy;

      ctx.save();
      ctx.strokeStyle = '#FFCA28';
      ctx.lineWidth = Math.max(2, 2 * dpr);
      ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
      ctx.restore();
    }
  }, [atlasImage, tileSize, sel, sheetSize]);

  // --- draw: THUMBNAIL canvas ---
  const drawThumb = React.useCallback(() => {
    const canvas = thumbCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const { width: W, height: H } = canvas;

    // bg
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, W, H);

    if (!atlasImage) {
      // label
      ctx.fillStyle = '#ddd';
      ctx.font = `${14 * dpr}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('No atlas', W / 2, H / 2);
      return;
    }

    const [aw, ah] = sheetSize;
    const sx = W / tileSize;
    const sy = H / tileSize;
    const sxImg = 1; // image -> atlas space (not needed here)

    const sxCanvas = W / tileSize;
    const syCanvas = H / tileSize;

    const sxPixels = tileSize;
    const syPixels = tileSize;

    const sxAtlas = W / aw;
    const syAtlas = H / ah;

    const sx2 = W / tileSize;
    const sy2 = H / tileSize;

    const srcX = sel.gx * tileSize;
    const srcY = sel.gy * tileSize;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      atlasImage,
      srcX, srcY, tileSize, tileSize,
      0, 0, W, H
    );

    // border
    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = Math.max(2, 2 * dpr);
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  }, [atlasImage, sheetSize, tileSize, sel]);

  // --- draw: WebGL canvas ---
  const ensureGL = React.useCallback(() => {
    if (glRef.current) return glRef.current;
    const canvas = glCanvas.current;
    if (!canvas) return null;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) {
      console.warn('WebGL not available; falling back to 2D clear.');
      glRef.current = null;
      return null;
    }
    // program
    const prog = createProgram(gl, VS, FS);
    gl.useProgram(prog);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    const aUV = gl.getAttribLocation(prog, 'aUV');
    const uScale = gl.getUniformLocation(prog, 'uScale');
    const uOffset = gl.getUniformLocation(prog, 'uOffset');

    // geometry: a fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // 2 floats pos, 2 floats uv
    const verts = new Float32Array([
      -1, -1, 0, 0,
      +1, -1, 1, 0,
      -1, +1, 0, 1,
      +1, +1, 1, 1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);

    // texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.clearColor(0.10, 0.12, 0.16, 1.0);

    glResRef.current = { prog, buf, tex, uScale, uOffset, aPos, aUV };
    glRef.current = gl;
    return gl;
  }, []);

  const uploadGLTexture = React.useCallback(() => {
    const gl = ensureGL();
    if (!gl || !atlasImage) return;
    const { tex } = glResRef.current;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // upload image
    try {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    } catch (e) { /* safari */ }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasImage);
  }, [ensureGL, atlasImage]);

  const drawGL = React.useCallback(() => {
    const gl = ensureGL();
    const canvas = glCanvas.current;
    if (!canvas) return;

    if (!gl) {
      // fallback: 2D clear so it's not blank
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        ctx2.fillStyle = '#111';
        ctx2.fillRect(0, 0, canvas.width, canvas.height);
        ctx2.fillStyle = '#ddd';
        ctx2.font = `${14 * dpr}px sans-serif`;
        ctx2.fillText('WebGL not available', 12 * dpr, 24 * dpr);
      }
      return;
    }

    const { width: W, height: H } = canvas;
    gl.viewport(0, 0, W, H);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const res = glResRef.current;
    gl.useProgram(res.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, res.buf);
    gl.enableVertexAttribArray(res.aPos);
    gl.vertexAttribPointer(res.aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(res.aUV);
    gl.vertexAttribPointer(res.aUV, 2, gl.FLOAT, false, 16, 8);
    gl.bindTexture(gl.TEXTURE_2D, res.tex);

    const [aw, ah] = sheetSize;
    const uScale = [tileSize / aw, tileSize / ah];
    const uOffset = [sel.gx * tileSize / aw, sel.gy * tileSize / ah];
    gl.uniform2fv(res.uScale, new Float32Array(uScale));
    gl.uniform2fv(res.uOffset, new Float32Array(uOffset));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [ensureGL, sheetSize, tileSize, sel]);

  // update texture when atlasImage changes
  useEffect(() => {
    if (!atlasImage) return;
    uploadGLTexture();
    drawAtlas();
    drawThumb();
    drawGL();
  }, [atlasImage, uploadGLTexture, drawAtlas, drawThumb, drawGL]);

  // redraw on state changes
  useEffect(() => { drawAtlas(); }, [tileSize, sel, drawAtlas]);
  useEffect(() => { drawThumb(); }, [tileSize, sel, drawThumb]);
  useEffect(() => { drawGL(); }, [tileSize, sel, sheetSize, drawGL]);

  // --- mouse interaction on atlas to pick a tile ---
  function atlasPointer(evt) {
    const canvas = atlasCanvas.current;
    if (!canvas || !atlasImage) return;
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left) * dpr;
    const y = (evt.clientY - rect.top) * dpr;
    const [aw, ah] = sheetSize;
    const u = clamp(x / canvas.width, 0, 0.9999);
    const v = clamp(y / canvas.height, 0, 0.9999);
    const gx = Math.floor(u * aw / tileSize);
    const gy = Math.floor(v * ah / tileSize);
    setHover({ gx, gy });
    if (evt.type === 'pointerdown') {
      setSel({ gx, gy });
    }
  }

  // format UV for the selected tile
  const uv = useMemo(() => {
    const [aw, ah] = sheetSize;
    const u0 = (sel.gx * tileSize) / aw;
    const v0 = (sel.gy * tileSize) / ah;
    const u1 = ((sel.gx + 1) * tileSize) / aw;
    const v1 = ((sel.gy + 1) * tileSize) / ah;
    return { u0, v0, u1, v1 };
  }, [sheetSize, tileSize, sel]);

  // mount once: give canvases some initial size so they render immediately
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // default sizes if RO hasn't fired yet
    setCanvasSize(atlasCanvas.current, 320, 320);
    setCanvasSize(thumbCanvas.current, 160, 160);
    setCanvasSize(glCanvas.current, 480, 240);
    drawAtlas();
    drawThumb();
    drawGL();
  }, []); // eslint-disable-line

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 280px',
      gridTemplateRows: 'auto auto 1fr',
      gap: '12px',
      padding: '12px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
      color: '#e5e7eb',
      background: '#0b1020',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Controls */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
        {atlasImage && (
          <span style={{ opacity: 0.85 }}>
            Atlas: {sheetSize[0]}×{sheetSize[1]} · Selected grid: {sel.gx},{sel.gy}
          </span>
        )}
      </div>

      {/* ATLAS */}
      <div style={{ background: '#10223a', borderRadius: 8, padding: 8, minHeight: 300 }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Atlas</div>
        <div style={{ width: '100%', height: 360 }}>
          <canvas
            ref={atlasCanvas}
            onPointerMove={atlasPointer}
            onPointerDown={atlasPointer}
            style={{ display: 'block', width: '100%', height: '100%', borderRadius: 6, cursor: atlasImage ? 'crosshair' : 'default' }}
          />
        </div>
      </div>

      {/* THUMBNAIL */}
      <div style={{ background: '#10223a', borderRadius: 8, padding: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Thumbnail</div>
        <div style={{ width: '100%', display: 'grid', placeItems: 'center' }}>
          <canvas ref={thumbCanvas} style={{ display: 'block', borderRadius: 6 }} />
        </div>
      </div>

      {/* GL PREVIEW */}
      <div style={{ gridColumn: '1 / -1', background: '#10223a', borderRadius: 8, padding: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>GL Preview (selected tile)</div>
        <div style={{ width: '100%', height: 260 }}>
          <canvas ref={glCanvas} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          UV: [{uv.u0.toFixed(3)}, {uv.v0.toFixed(3)}] → [{uv.u1.toFixed(3)}, {uv.v1.toFixed(3)}]
        </div>
      </div>
    </div>
  );
}
