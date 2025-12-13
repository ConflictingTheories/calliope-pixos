/*
 * ---------------------------------------------------------------
 *                Pixospritz – Editor – Tileset Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use the Map Editor combined with Geometry Editor instead.
 * 
 * The TilesetEditor provides a simple form interface for editing
 * tile and geometry definitions within a Pixospritz package.  It
 * accepts a JSON string describing a tileset and allows the
 * user to modify tile IDs, names, associated geometry indices
 * and texture paths.  Geometry definitions themselves can also
 * be inspected.  When the user clicks Save Changes the updated
 * object will be emitted via the optional onSave callback.
 */

// TODO - FIX NEEDED - NOT RENDERING CORRECTLY INTO THE CANVASES
// DEPRECATED: This entire component will be removed. Use Map Editor + Geometry Editor instead.

import React, { useState, useEffect, useRef } from 'react';
import TilesetAtlasEditor from './tileset-atlas.jsx';
import { collect } from 'react-recollect';
import {
  Panel,
  Container,
  Row,
  Col,
  Button,
  Message,
} from 'rsuite';

import { lookAt, perspective, invert, mul, identity, rotate } from '../math/matrix4.jsx';
import { degToRad, V3 } from '../math/vector.jsx';
// style
import './style.css';

/**
 * @deprecated Use Map Editor + Geometry Editor instead.
 * Tileset viewer and editor
 * @param {{content, onSave, assets}} props 
 * @returns 
 */
function TilesetEditor({ content, onSave, assets = [] }) {
  // Show deprecation warning
  useEffect(() => {
    console.warn('[TilesetEditor] DEPRECATED: This component will be removed. Use Map Editor + Geometry Editor instead.');
  }, []);

  const [tileset, setTileset] = useState({
    name: '',
    src: '',
    sheetSize: [0, 0],
    sheetOffsetX: 0,
    sheetOffsetY: 0,
    tileSize: 0,
    bgColor: [100, 100, 100],
    textures: {}, tiles: [], geometry: []
  });
  const [error, setError] = useState(null);

  // canvas references
  const uvC = useRef();
  const glC = useRef();
  const thC = useRef();
  const hud = useRef();
  const tilePick = useRef();
  const layerPick = useRef();
  const texPick = useRef();
  const chkWire = useRef();

  const [W, setW] = useState(1), [H, setH] = useState(1), [aspect, setAspect] = useState(1);
  const [uvW, setUvW] = useState(1), [uvH, setUvH] = useState(1), [uvDrag, setUvDrag] = useState(null);

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [tiles, setTiles] = useState({});
  const [geom, setGeom] = useState({});
  const [atlasImg, setAtlasImg] = useState(null);
  const [atlasTex, setAtlasTex] = useState(null);
  const [atlasSize, setAtlasSize] = useState([512, 512]);
  const [sheetSize, setSheetSize] = useState([512, 512]);
  const [tileSize, setTileSize] = useState(16);
  const [sheetOff, setSheetOff] = useState([0, 0]);
  const [bgColor, setBgColor] = useState([100, 100, 100]);
  const [textures] = useState(new Map());
  const [tileKeys, setTileKeys] = useState([]);
  const [currentTileKey, setCurrentTileKey] = useState(null);
  const [layers] = useState([]);
  const [editLayerIndex, setEditLayerIndex] = useState(-1);
  const [selectionFaces] = useState(new Set());
  const [flipV, setFlipV] = useState(false);
  const [loc, setLoc] = useState({});

  const [gl, setGl] = useState(null),
    [uvx, setUvx] = useState(null),
    [ctx, setCtx] = useState(null);

  let [lx, setLx] = useState(0.7),
    [ly, setLy] = useState(0.7),
    [lz, setLz] = useState(0.7),
    [amb, setAmb] = useState(0.7);

  let [camDist, setCamDist] = useState(2.8),
    [camYaw, setCamYaw] = useState(0.7),
    [camPitch, setCamPitch] = useState(0.5),
    [camTarget, setCamTarget] = useState([0.5, 0.5, 0.5]);

  let [isDown, setDown] = useState(false),
    [last, setLast] = useState([0, 0]),
    [panning, setPanning] = useState(false);

  const dpr = Math.min(devicePixelRatio || 1, 2);

  const VS = `attribute vec3 a_pos;attribute vec3 a_nrm;attribute vec2 a_uv;uniform mat4 u_mvp,u_m,u_n;varying vec3 v_n;varying vec2 v_uv;void main(){v_n=mat3(u_n)*a_nrm;v_uv=a_uv;gl_Position=u_mvp*vec4(a_pos,1.0);}`;
  const FS = `precision mediump float;varying vec3 v_n;varying vec2 v_uv;uniform sampler2D u_tex;uniform vec3 u_light;uniform float u_amb;uniform bool u_hasTex;uniform float u_tint;void main(){vec3 n=normalize(v_n);float nd=max(dot(n,normalize(u_light)),0.0);vec3 base=u_hasTex?texture2D(u_tex,v_uv).rgb:vec3(0.82,0.84,0.88);base=mix(base,vec3(1.0,0.95,0.7),u_tint);gl_FragColor=vec4(base*(u_amb+0.9*nd),1.0);}`;
  const [prog, setProg] = useState(null);

  function grid(n = 12, step = .5) {
    const v = [];
    for (let i = -n; i <= n; i++) {
      v.push(-n * step, 0, i * step, n * step, 0, i * step);
      v.push(i * step, 0, -n * step, i * step, 0, n * step);
    }
    return new Float32Array(v);
  }
  // store grid vertices so we can compute draw count
  const [gridVerts] = useState(grid());
  const [gridVBO, setGridVBO] = useState(null);

  /* ===== Camera ===== */
  function btnResetViewOnClick() {
    setCamDist(2.8);
    setCamYaw(0.7);
    setCamPitch(0.5);
    setCamTarget([0.5, 0.5, 0.5]);
  };

  function eye() {
    return [
      camTarget[0] + camDist * Math.cos(camPitch) * Math.sin(camYaw),
      camTarget[1] + camDist * Math.sin(camPitch),
      camTarget[2] + camDist * Math.cos(camPitch) * Math.cos(camYaw)
    ];
  }

  function view() {
    return lookAt(eye(), camTarget, [0, 1, 0]);
  }

  function proj() {
    return perspective(50 * Math.PI / 180, aspect, 0.01, 100);
  }

  /* ===== Rendering ===== */

  // TODO -- SHOULD UPDATE TO USE SAME SHADERS AS IN ENGINE
  // That way all effects, lighting, etc can eventually be explored

  function shader(t, s) {
    const o = gl.createShader(t);
    gl.shaderSource(o, s);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o);
    return o;
  }

  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw gl.getProgramInfoLog(p);

    setLoc({
      a_pos: gl.getAttribLocation(p, 'a_pos'),
      a_nrm: gl.getAttribLocation(p, 'a_nrm'),
      a_uv: gl.getAttribLocation(p, 'a_uv'),
      u_mvp: gl.getUniformLocation(p, 'u_mvp'),
      u_m: gl.getUniformLocation(p, 'u_m'),
      u_n: gl.getUniformLocation(p, 'u_n'),
      u_tex: gl.getUniformLocation(p, 'u_tex'),
      u_light: gl.getUniformLocation(p, 'u_light'),
      u_amb: gl.getUniformLocation(p, 'u_amb'),
      u_hasTex: gl.getUniformLocation(p, 'u_hasTex'),
      u_tint: gl.getUniformLocation(p, 'u_tint')
    });

    return p;
  }

  // Grid Render
  function drawGrid(v, p) {
    const m = identity(), mvp = mul(p, mul(v, m)), nmat = invert(m);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.u_mvp, false, new Float32Array(mvp));
    gl.uniformMatrix4fv(loc.u_m, false, new Float32Array(m));
    gl.uniformMatrix4fv(loc.u_n, false, new Float32Array(nmat));
    gl.uniform3f(loc.u_light, 1.0, 1.0, 1.0);
    gl.uniform1f(loc.u_amb, 1.0);
    gl.uniform1i(loc.u_hasTex, 0);
    gl.uniform1f(loc.u_tint, 0.0);

    if (atlasTex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(loc.u_tex, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gridVBO);
    gl.enableVertexAttribArray(loc.a_pos);
    gl.vertexAttribPointer(loc.a_pos, 3, gl.FLOAT, false, 0, 0);
    gl.disableVertexAttribArray(loc.a_nrm);
    gl.disableVertexAttribArray(loc.a_uv);

    gl.drawArrays(gl.LINES, 0, gridVerts.length / 3);
  }

  function setGLTexture(img) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    return t;
  }

  // Tile Render
  function drawLayer(L, v, p, isEdit) {
    
    const m = identity();
 
    // position block and rotate accordingly - todo needs work
    // rotate(m, m, degToRad(90), [0, 0, 1]);
    // rotate(m, m, degToRad(90), [1, 0, 0]);
    // rotate(m, m, degToRad(90), [0, 1, 0]);
    
    const mvp = mul(p, mul(v, m)), nmat = invert(m);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.u_mvp, false, new Float32Array(mvp));
    gl.uniformMatrix4fv(loc.u_m, false, new Float32Array(m));
    gl.uniformMatrix4fv(loc.u_n, false, new Float32Array(nmat));
    gl.uniform3f(loc.u_light, lx, ly, lz);
    gl.uniform1f(loc.u_amb, amb);
    gl.uniform1i(loc.u_hasTex, atlasTex ? 1 : 0);
    gl.uniform1f(loc.u_tint, isEdit ? 0.18 : 0.0);
    if (atlasTex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(loc.u_tex, 0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, L.vboPos);
    gl.enableVertexAttribArray(loc.a_pos);
    gl.vertexAttribPointer(loc.a_pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, L.vboNrm);
    gl.enableVertexAttribArray(loc.a_nrm);
    gl.vertexAttribPointer(loc.a_nrm, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, L.vboUV);
    gl.enableVertexAttribArray(loc.a_uv);
    gl.vertexAttribPointer(loc.a_uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.ibo);
    if (!chkWire.current.checked) {
      gl.drawElements(gl.TRIANGLES, L.idxCount, L.indexType, 0);
    } else {
      // generate edges using actual indices
      const edges = [];
      const inds = L.indices;
      for (let i = 0; i < inds.length; i += 3) {
        const i0 = inds[i], i1 = inds[i + 1], i2 = inds[i + 2];
        edges.push(i0, i1, i1, i2, i2, i0);
      }
      const eb = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, makeTyped(edges), gl.DYNAMIC_DRAW);
      gl.drawElements(gl.LINES, edges.length, L.indexType, 0);
      gl.deleteBuffer(eb);
    }
    // face overlay
    if (isEdit && editMode === 'face' && selectionFaces.size) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const sel = [];
      for (const f of selectionFaces) { sel.push(f * 3, f * 3 + 1, f * 3 + 2); }
      const sb = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sb);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, makeTyped(sel), gl.DYNAMIC_DRAW);
      gl.uniform1f(loc.u_tint, 0.35);
      gl.drawElements(gl.TRIANGLES, sel.length, L.indexType, 0);
      gl.deleteBuffer(sb);
      gl.disable(gl.BLEND);
    }
  }

  // Thumbnail Render
  function drawThumb() {
    let thX = thC.current?.getContext('2d');
    setCtx(thX);
    if (thX) {
      const srcW = glC.current.width, srcH = glC.current.height, dstW = thC.current.width, dstH = thC.current.height;
      const s = Math.min(dstW / srcW, dstH / srcH);
      const w = Math.floor(srcW * s), h = Math.floor(srcH * s);
      const dx = Math.floor((dstW - w) / 2), dy = Math.floor((dstH - h) / 2);
      const tmp = document.createElement('canvas');
      tmp.width = srcW; tmp.height = srcH;
      tmp.getContext('2d').drawImage(glC.current, 0, 0);
      thX.clearRect(0, 0, dstW, dstH);
      thX.fillStyle = '#000';
      thX.fillRect(0, 0, dstW, dstH);
      thX.drawImage(tmp, 0, 0, srcW, srcH, dx, dy, w, h);
    }
  }


  function resize() {
    const r = glC.current?.getBoundingClientRect();
    if (r) {
      setW(Math.max(1, Math.floor(r.width * dpr)));
      setH(Math.max(1, Math.floor(r.height * dpr)));
      setAspect(W / H);
      if (glC.current.width !== W || glC.current.height !== H) {
        glC.current.width = W;
        glC.current.height = H;
      }
      gl.viewport(0, 0, W, H);
    };
  }


  // Render Loop
  function animationFrame() {
    resize();

    // clear screen
    const bg = bgColor.map(v => v / 255);
    gl.viewport(0, 0, W, H);
    gl.clearColor(bg[0] * 0.25, bg[1] * 0.25, bg[2] * 0.25, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const v = view(), p = proj();

    // display grid
    drawGrid(v, p);

    // draw tile layers
    for (let i = 0; i < layers.length; i++)
      drawLayer(layers[i], v, p, i === editLayerIndex);

    // thumbnail
    drawThumb();

    // update
    hud.textContent = `${glC.current?.width}×${glC.current?.height} · ${layers.length} layer(s) · err ${gl.getError()}`;

    requestAnimationFrame(animationFrame);
  }

  // Push a snapshot of the current tileset into history
  function pushHistorySnapshot(nextTileset) {
    const snapshot = JSON.parse(JSON.stringify(nextTileset));
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, snapshot];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }

  /* ===== UI bindings ===== */
  function selectTile(e) {
    const k = e.target.value || null;
    setCurrentTileKey(k);
    drawUV();
    if (!k) return;
    rebuildLayersForTile(k);
    setStatusL('tile selected');
  };

  function selectLayer(e) {
    const i = +e.target.value;
    if (Number.isNaN(i)) return;
    setEditLayerIndex(i);
    setStatusL(`edit layer ${i}`);
    drawUV();
  };

  function applyTexture() {
    const key = texPick.current.value;
    const i = editLayerIndex;
    if (!key || i < 0) return;
    const L = layers[i];
    L.tkey = key;
    const rec = tiles[currentTileKey];
    if (rec) {
      const base = i * 3;
      if (base + 1 < rec.length) rec[base + 1] = key;
    }
    updateLayerBakedUV(L);
    drawUV();
    setStatusR(`layer ${i} texture → ${key}`);
  };

  /* ===== Helpers ===== */
  const setStatusL = s => statL.textContent = s;
  const setStatusR = s => statR.textContent = s;
  function fillSelect(sel, pairs) {
    sel.innerHTML = '';
    for (const [v, t] of pairs) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      sel.appendChild(o);
    }
  }
  function downloadJSON(obj, name) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  /* ===== I/O ===== */
  function toHex(c) { return '#' + c.map(v => ('0' + v.toString(16)).slice(-2)).join(''); }

  function ingestTileset() {
    const t = tileset;
    if (!t) return;
    setSheetSize(t.sheetSize || [512, 512]);
    setTileSize(t.tileSize || 16);
    setSheetOff([t.sheetOffsetX || 0, t.sheetOffsetY || 0]);
    setBgColor(t.bgColor || [100, 100, 100]);
    textures.clear();
    if (t.textures) for (const k in t.textures) textures.set(k, t.textures[k]);
    fillSelect(texPick.current, [['', '— texture key —'], ...[...textures.keys()].sort().map(k => [k, k])]);
    setStatusL('tileset.json loaded');
  }

  function rebuildTilePicker() {
    if (!tiles) return;
    setTileKeys(Object.keys(tiles).sort());
    fillSelect(tilePick.current, [['', '— select tile —'], ...tileKeys.map(k => [k, k])]);
    setStatusR('tiles refreshed');
  }

  /* ===== UV bake (atlas-aware, Flip-V aware) ===== */
  // function atlasBake(raw, tKey) {
  //   const cell = tKey ? textures.get(tKey) : null;
  //   const out = new Float32Array(raw.length);
  //   const sheetW = (atlasSize?.[0]) || sheetSize[0], sheetH = (atlasSize?.[1]) || sheetSize[1];
  //   let offX = 0, offY = 0, sclX = 1, sclY = 1;
  //   if (cell) {
  //     const [col, row] = cell, tileW = tileSize, tileH = tileSize;
  //     offX = (sheetOff[0] + col * tileW) / sheetW;
  //     offY = (sheetOff[1] + row * tileH) / sheetH;
  //     sclX = tileW / sheetW; sclY = tileH / sheetH;
  //   }
  //   for (let i = 0; i < raw.length; i += 2) {
  //     const u = raw[i], v = raw[i + 1];
  //     const vf = flipV ? (1 - v) : v;
  //     out[i] = offX + u * sclX;
  //     out[i + 1] = offY + vf * sclY;
  //   }
  //   return out;
  // }

  function atlasBake(raw, tKey) {
    const cell = tKey ? textures.get(tKey) : null; if (!cell) return new Float32Array(raw);
    const [col, row] = cell;
    const sheetW = (atlasSize?.[0]) || sheetSize[0], sheetH = (atlasSize?.[1]) || sheetSize[1];
    const tileW = tileSize, tileH = tileSize;
    const offX = (sheetOff[0] + col * tileW) / sheetW, offY = (sheetOff[1] + row * tileH) / sheetH;
    const sclX = tileW / sheetW, sclY = tileH / sheetH;
    const out = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i += 2) { out[i] = offX + raw[i] * sclX; out[i + 1] = offY + raw[i + 1] * sclY; }
    return out;
  }

  function updateLayerBakedUV(L) {
    const baked = atlasBake(L.mesh.uv, L.tkey);
    gl.bindBuffer(gl.ARRAY_BUFFER, L.vboUV);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, baked);
  }

  /* ===== Build layer ===== */
  function buildLayer(gkey, tkey, z) {
    const g = geom?.[gkey];
    if (!g) { alert(`Missing geometry: ${gkey}`); return null; }
    const triPos = g.vertices, triUV = g.surfaces;
    const pos = [], uvRaw = [], nrm = [], idx = [];
    let v = 0;
    for (let t = 0; t < triPos.length; t++) {
      const a = triPos[t][0], b = triPos[t][1], c = triPos[t][2];
      const n = V3.norm(V3.cross(V3.sub(b, a), V3.sub(c, a)));
      [a, b, c].forEach(p => {
        pos.push(p[0], p[1] + z, p[2]);
        nrm.push(n[0], n[1], n[2]);
      });
      const uvs = (triUV && triUV[t]) ? triUV[t] : [[0, 0], [1, 0], [1, 1]];
      // do NOT clamp UVs — allow >1 to span multiple cells
      uvs.forEach(q => uvRaw.push(q[0], q[1]));
      idx.push(v, v + 1, v + 2);
      v += 3;
    }
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
    const vboNrm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNrm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nrm), gl.DYNAMIC_DRAW);
    const vboUV = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUV);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvRaw), gl.DYNAMIC_DRAW);
    const ib = makeIndexBuffer(idx);
    // store typed indices for wireframe generation
    const typedIdx = makeTyped(idx);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUV);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, atlasBake(uvRaw, tkey));
    return {
      gkey,
      tkey,
      z,
      vboPos,
      vboNrm,
      vboUV,
      ibo: ib.buf,
      indexType: ib.type,
      idxCount: idx.length,
      indices: typedIdx,
      mesh: {
        pos: new Float32Array(pos),
        nrm: new Float32Array(nrm),
        uv: new Float32Array(uvRaw),
        triCount: triPos.length
      }
    };
  }

  const [OES_uint, setOES] = useState(null);

  const makeIndexBuffer = (arr, usage = gl.STATIC_DRAW) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
    if (OES_uint) {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(arr), usage);
      return { buf: b, type: gl.UNSIGNED_INT };
    }
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), usage);
    return { buf: b, type: gl.UNSIGNED_SHORT };
  };

  function makeTyped(arr) { return OES_uint ? new Uint32Array(arr) : new Uint16Array(arr); }


  /* ===== Build layers for a tile (render all) ===== */
  function rebuildLayersForTile(tileKey) {
    layers.length = 0;
    const arr = tiles[tileKey] || [];
    for (let i = 0; i + 2 < arr.length; i += 3) {
      const g = arr[i], t = arr[i + 1], z = arr[i + 2];
      if (typeof g === 'string' && typeof t === 'string' && typeof z === 'number') {
        const L = buildLayer(g, t, z);
        if (L) layers.push(L);
      } else break;
    }
    setEditLayerIndex(layers.length ? layers.length - 1 : -1);
    fillSelect(layerPick.current, [['', '— select layer —'], ...layers.map((L, i) => [String(i), `${i}: ${L.gkey} @ ${L.tkey} z=${L.z}`])]);
    drawUV();
    tileMeta.textContent = `tile=${tileKey} · layers=${layers.length}`;
  }

  function applyTilesetEdits() {
    const parseHex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    setTileset(tileset || {});
    setGeom(tileset.geometry || {});
    setTiles(tileset.tiles || {});
    tileset.name = tsName.value || 'default';
    setTileSize(tileset.tileSize = parseInt(tsTileSize.value) || 16);
    setSheetSize([parseInt(tsSheetW.value) || 512, parseInt(tsSheetH.value) || 512]);
    tileset.sheetSize = [...sheetSize];
    setSheetOff([parseInt(tsOffX.value) || 0, parseInt(tsOffY.value) || 0]);
    tileset.sheetOffsetX = sheetOff[0];
    tileset.sheetOffsetY = sheetOff[1];
    setBgColor(tsBg.value || parseHex('#203e58'));
    tileset.bgColor = [...bgColor];
    for (const L of layers) updateLayerBakedUV(L);
    drawUV();
    setStatusL('tileset applied & UVs re-baked');
  }

  function loadAtlas(e) {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      setAtlasImg(img);
      setAtlasTex(setGLTexture(img));
      setAtlasSize([img.naturalWidth || img.width, img.naturalHeight || img.height]);
      if (!tileset?.sheetSize || tileset.sheetSize[0] !== atlasSize[0] || tileset.sheetSize[1] !== atlasSize[1])
        setSheetSize([...atlasSize]);
      for (const L of layers) updateLayerBakedUV(L);
      drawUV();
      setStatusL('atlas loaded');
    };
    img.src = URL.createObjectURL(f);
  }

  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTileset(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTileset(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }

  useEffect(() => {
    if (uvC.current) {
      new ResizeObserver(resizeUV).observe(uvC.current);
    }
  }, [uvC]);

  // Parse incoming JSON into state
  useEffect(() => {
    if (!gl) {
      const glContext = glC.current.getContext('webgl2');
      const uvContext = uvC.current.getContext('2d');

      if (!glContext) {
        throw new Error('WebGL : unable to initialize Preview');
      }
      if (!uvContext) {
        throw new Error('Canvas : unable to initialize UV');
      }

      setGl(glContext);
      setUvx(uvContext);

      console.log({ glContext, uvContext });
    }

    if (gl) {
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      setOES(gl.getExtension('OES_element_index_uint'));

      if (!prog) {
        let bufferObj = gl.createBuffer();
        setProg(program(VS, FS));
        setGridVBO(bufferObj);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferObj);
        gl.bufferData(gl.ARRAY_BUFFER, gridVerts, gl.STATIC_DRAW);
      } else {
        animationFrame();
      }
    }
    // todo -- needs to load in 3 files (tileset, tiles, and geometry, and it should autoload atlas from tileset)
    if (content) {
      try {
        const obj = JSON.parse(content);
        setTileset(obj);
        setTileset(obj);
        setGeom(obj.geometry || {});
        setTiles(obj.tiles || []);
        ingestTileset();
        rebuildTilePicker();
        setError(null);

        // TODO -- FIX THIS - Initialize history with parsed tileset
        // const initialSnapshot = JSON.parse(JSON.stringify({ tiles: [...tiles], geometry: [...geometry] }));
        // setHistory([initialSnapshot]);
        // setHistoryIndex(0);
      } catch (err) {
        console.warn('Failed to parse tileset JSON', err);
        setError('Invalid tileset JSON');
      }
    }
  }, [content, glC, uvC, thC, gl, uvx, ctx, prog]);


  useEffect(() => {
    if (!glC.current) return;

    // Prevent right-click context menu from appearing

    const handleMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setDown(true);
      setLast([e.clientX, e.clientY]);
      setPanning(e.altKey || e.button === 1);
    };
    const handleMouseUp = (e) => {
      if (e) { e.stopPropagation(); e.preventDefault(); }
      setDown(false);
    };
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.stopPropagation();
      e.preventDefault();
      const dx = e.clientX - last[0];
      const dy = e.clientY - last[1];
      setLast([e.clientX, e.clientY]);
      if (!panning && e.buttons === 1) {
        setCamYaw(camYaw - dx * 0.005);
        setCamPitch(Math.max(-1.45, Math.min(1.45, camPitch - dy * 0.005)));
      } else {
        const s = camDist * 0.0015;
        const dir = [Math.sin(camYaw), 0, Math.cos(camYaw)];
        const right = [dir[2], 0, -dir[0]];
        setCamTarget([
          camTarget[0] + right[0] * (-dx * s) + [0, 1, 0][2] * (dy * s),
          camTarget[1] + right[1] * (-dx * s) + [0, 1, 0][2] * (dy * s),
          camTarget[2] + right[2] * (-dx * s) + [0, 1, 0][2] * (dy * s)
        ]);
      }
    };
    const handleWheel = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setCamDist(Math.max(0.2, camDist * (1 + Math.sign(e.deltaY) * 0.1)));
    };

    if (glC.current) {
      glC.current.addEventListener('contextmenu', e => e.preventDefault());
      glC.current.addEventListener('mousedown', handleMouseDown);
      glC.current.addEventListener('mousemove', handleMouseMove);
      glC.current.addEventListener('wheel', handleWheel);
    }
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (glC.current) {
        glC.current.removeEventListener('mousedown', handleMouseDown);
        glC.current.removeEventListener('mousemove', handleMouseMove);
        glC.current.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [glC, isDown, last, panning, camYaw, camPitch, camDist, camTarget]);

  function handleSave() {
    if (onSave) {
      onSave(tileset);
    } else {
      console.log('Tileset saved:', JSON.stringify(tileset, null, 2));
    }
  }

  // draw UV map over Atlas Preview
  function drawUV() {
    if (!uvx) return;
    uvx.setTransform(1, 0, 0, 1, 0, 0);
    uvx.clearRect(0, 0, uvW, uvH);
    // background checker
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      uvx.fillStyle = ((x + y) & 1) ? '#f6f6f6' : '#ffffff';
      uvx.fillRect(x * uvW / 10, y * uvH / 10, uvW / 10, uvH / 10);
    }
    // draw atlas centered (fit)
    let ox = 0, oy = 0, dw = uvW, dh = uvH;
    if (atlasImg) {
      const iw = atlasImg.width, ih = atlasImg.height;
      const s = Math.min(uvW / iw, uvH / ih);
      dw = iw * s;
      dh = ih * s;
      ox = (uvW - dw) / 2;
      oy = (uvH - dh) / 2;
      uvx.drawImage(atlasImg, ox, oy, dw, dh);
    }
    const i = editLayerIndex;
    if (i < 0) return;
    const L = layers[i];
    // highlight current cell
    const cell = L.tkey ? textures.get(L.tkey) : null;
    if (cell && atlasImg) {
      const [col, row] = cell;
      const [sheetW, sheetH] = sheetSize;
      const tile = tileSize;
      const x = (sheetOff[0] + col * tile) / sheetW, y = (sheetOff[1] + row * tile) / sheetH;
      const w = tile / sheetW, h = tile / sheetH;
      uvx.strokeStyle = '#ff0077';
      uvx.lineWidth = 2;
      uvx.strokeRect(ox + x * dw, oy + y * dh, w * dw, h * dh);
    }
    // baked UV overlay (atlas space)
    const baked = atlasBake(L.mesh.uv, L.tkey);
    uvx.strokeStyle = '#1976d2';
    uvx.lineWidth = 1.5;
    uvx.fillStyle = 'rgba(25,118,210,0.08)';
    const faces = selectionFaces.size ? selectionFaces : new Set([...Array(L.mesh.triCount).keys()]);
    for (const f of faces) {
      const ui = f * 6;
      const P = [];
      for (let v = 0; v < 3; v++) P.push([ox + baked[ui + v * 2] * dw, oy + baked[ui + v * 2 + 1] * dh]);
      uvx.beginPath();
      P.forEach((p, k) => k ? uvx.lineTo(p[0], p[1]) : uvx.moveTo(p[0], p[1]));
      uvx.closePath();
      uvx.fill();
      uvx.stroke();
      P.forEach(p => {
        uvx.beginPath();
        uvx.arc(p[0], p[1], 3, 0, 6.283);
        uvx.fillStyle = '#1e3a8a';
        uvx.fill();
      });
    }
  }

  // cropped (not working on texture display)
  // function drawUV() {
  //   if(!uvx) return;
  //   uvx.setTransform(1, 0, 0, 1, 0, 0); uvx.clearRect(0, 0, uvW, uvH);
  //   for (let y = 0; y < 8; y++)for (let x = 0; x < 8; x++) { uvx.fillStyle = ((x + y) & 1) ? '#f7f7f7' : '#ffffff'; uvx.fillRect(x * uvW / 8, y * uvH / 8, uvW / 8, uvH / 8); }
  //   const i = editLayerIndex; if (i < 0) return; const L = layers[i];
  //   const faces = selectionFaces.size ? selectionFaces : new Set([...Array(L.mesh.triCount).keys()]);
  //   uvx.strokeStyle = '#1976d2'; uvx.lineWidth = 1;
  //   for (const f of faces) {
  //     const ui = f * 6; uvx.beginPath(); for (let v = 0; v < 3; v++) { const u = L.mesh.uv[ui + v * 2] * uvW, vv = L.mesh.uv[ui + v * 2 + 1] * uvH; v ? uvx.lineTo(u, vv) : uvx.moveTo(u, vv); } uvx.closePath(); uvx.stroke();
  //     for (let v = 0; v < 3; v++) { const u = L.mesh.uv[ui + v * 2] * uvW, vv = L.mesh.uv[ui + v * 2 + 1] * uvH; uvx.fillStyle = '#222'; uvx.beginPath(); uvx.arc(u, vv, 3, 0, 6.283); uvx.fill(); }
  //   }
  // }

  function resizeUV() {
    if (!uvC.current) return;
    const r = uvC.current.getBoundingClientRect();
    console.log({ uvC, c: uvC.current, b: r });
    const dpr = window.devicePixelRatio || 1;
    setUvW(Math.max(1, Math.floor(r.width * dpr)));
    setUvH(Math.max(1, Math.floor(r.height * dpr)));
    uvC.current.width = uvW;
    uvC.current.height = uvH;
    drawUV();
  }

  return (
    <Container style={{ padding: '1rem' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
      <Row>
        <Col sm={24} md={24} lg={24}>
          <Panel bordered header={<strong>Tileset Editor</strong>}>
            <div id="app">
              <div id="toolbar">
                <select id="tilePick" ref={tilePick} className={'pill'} style={{ minWidth: '220px' }} onChange={selectTile}>
                  <option value="">— select tile —</option>
                </select>

                <select id="layerPick" ref={layerPick} className={'pill'} style={{ minWidth: '220px' }} onChange={selectLayer}>
                  <option value={editLayerIndex}>— select layer —</option>
                </select>

                <label className={'btn'}>Load atlas image <input id="fAtlas" type="file" accept="image/*" hidden="" onChange={loadAtlas} /></label>
                <select id="texPick" ref={texPick} className={'pill'} style={{ minWidth: '180px' }}>
                  <option value="">— texture key —</option>
                </select>
                <button onClick={applyTexture} id="btnUseTex" className={'btn'} title="Set selected layer’s texture key to the chosen one">Use chosen
                  texture</button>

                <button id="btnExportTileset" className={'btn'} onClick={() => {
                  if (!tileset) { alert('Nothing to export'); return; }
                  downloadJSON(tileset, 'tileset.json');
                }}>Export tileset.json</button>
              </div>

              <div id="view">
                <canvas id="gl" ref={glC} width="2028" height="1434"></canvas>
                <div id="hud" ref={hud}>2028×1434 · 0 layer(s) · err 0</div>
              </div>

              <aside id="side">
                <div id="pane">
                  <h3>Tile / Layers</h3>
                  <div className={'row'}>
                    <div id="tileMeta" className={'mono note'}>—</div>
                  </div>
                  <div className={'row'}>
                    <button id="btnCloneTile" className={'btn'}>Clone Tile…</button>
                    <button id="btnAddLayer" className={'btn'}>Add Layer…</button>
                    <button id="btnDelLayer" className={'btn'}>Delete Layer</button>
                  </div>
                  <div className={'row note'}>All layers render together; the Layer picker chooses which one you edit.</div>

                  <fieldset>
                    <legend>Tileset (live)</legend>
                    <div className={'row'}><label className={'w120'}>Name</label><input id="tsName" type="text" placeholder="tileset name" value={tileset.name} onChange={(e) => {
                      let newTileset = tileset;
                      newTileset.name = e.currentTarget.value;
                      setTileset(newTileset);
                    }} />
                    </div>
                    <div className={'stack2'}>
                      <div className={'row'}><label className={'w120'}>Tile size</label><input id="tsTileSize" type="number" min="1" step="1" value={tileSize} onChange={e => setTileSize(e.currentTarget.value)} />
                      </div>
                      <div className={'row'}><label className={'w120'}>BG color</label><input id="tsBg" type="color" value={bgColor} onChange={e => setBgColor(e.currentTarget.value)} /></div>
                    </div>
                    <div className={'stack2'}>
                      <div className={'row'}><label className={'w120'}>Sheet W</label><input id="tsSheetW" type="number" min="1" step="1" value={sheetSize[0]} onChange={(e) => {
                        let newSheetSize = sheetSize;
                        newSheetSize[0] = e.currentTarget.value;
                        setSheetSize(newSheetSize);
                      }} />
                      </div>
                      <div className={'row'}><label className={'w120'}>Sheet H</label><input id="tsSheetH" type="number" min="1" step="1" value={sheetSize[1]} onChange={(e) => {
                        let newSheetSize = sheetSize;
                        newSheetSize[1] = e.currentTarget.value;
                        setSheetSize(newSheetSize);
                      }} />
                      </div>
                    </div>
                    <div className={'stack2'}>
                      <div className={'row'}><label className={'w120'}>Offset X</label><input id="tsOffX" type="number" step="1" value={sheetOff[0]} onChange={(e) => {
                        let newSheetOff = sheetOff;
                        newSheetOff[0] = e.currentTarget.value;
                        setSheetOff(newSheetOff);
                      }} />
                      </div>
                      <div className={'row'}><label className={'w120'}>Offset Y</label><input id="tsOffY" type="number" step="1" value={sheetOff[1]} onChange={(e) => {
                        let newSheetOff = sheetOff;
                        newSheetOff[1] = e.currentTarget.value;
                        setSheetOff(newSheetOff);
                      }} />
                      </div>
                    </div>
                    <div className={'row note'}>Apply to re-bake UVs and refresh.</div>
                    <div className={'row'}><button id="btnApplyTileset" onClick={applyTilesetEdits} className={'btn grow'}>Apply &amp; Re-bake</button></div>
                  </fieldset>

                  <fieldset>
                    <legend>View</legend>
                    <div className={'row'}><label><input type="checkbox" id="chkWire" ref={chkWire} /> Wireframe</label>
                      <label><input type="checkbox" id="chkFlipV" checked="" onChange={(e) => {
                        setFlipV(e.currentTarget.checked);
                        for (const L of layers)
                          updateLayerBakedUV(L);
                        drawUV();
                      }} /> Flip V (top-left UVs)</label>
                    </div>
                    <div className={'row'}><label>Ambient</label><input id="amb" type="range" min="0" max="1" step="0.01" onChange={e => setAmb(e.currentTarget.value)} value={amb} />
                    </div>
                    <div className={'row'}><label>Light</label>
                      <input id="lx" type="range" min="-1" max="1" step="0.01" onChange={e => setLx(e.currentTarget.value)} value={lx} />
                      <input id="ly" type="range" min="-1" max="1" step="0.01" onChange={e => setLy(e.currentTarget.value)} value={ly} />
                      <input id="lz" type="range" min="-1" max="1" step="0.01" onChange={e => setLz(e.currentTarget.value)} value={lz} />
                      <button id="btnResetView" className={'btn'} onClick={btnResetViewOnClick}>Reset</button>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>Texture Atlas</legend>
                    {atlasImg ? <TilesetAtlasEditor atlasImage={atlasImg} atlasURL={atlasImg.src} tileSize={tileSize} sheetSize={sheetSize} /> : null}
                  </fieldset>
                  <fieldset>
                    <legend>UV (Atlas-aware)</legend>
                    <div className={'row note'}>Shows atlas, highlights the chosen texture cell, and overlays the baked UVs.
                      Drag points to edit.</div>
                    <div id="uvwrap"><canvas id="uv" ref={uvC} width="663" height="444"></canvas></div>
                  </fieldset>

                  <h3>Thumbnail</h3>
                  <canvas id="thumb" className={'thumb'} ref={thC} width="256" height="120"></canvas>
                </div>
              </aside>

              <div id="status"><span id="statL">ready</span><span id="statR" className={'mono'}>—</span></div>
            </div>
          </Panel>
        </Col>
      </Row>
      <Row style={{ paddingTop: '1rem' }}>
        <Button appearance='primary' onClick={handleSave}>
          Save Changes
        </Button>
        {/* Undo / Redo buttons */}
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={undo} disabled={historyIndex <= 0}>
          Undo
        </Button>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={redo} disabled={historyIndex >= history.length - 1}>
          Redo
        </Button>
      </Row>
      {geom && Object.keys(geom).length > 0 && (
        <Row style={{ marginTop: '2rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Panel bordered header={<strong>Geometry Definitions</strong>}>
              <pre
                style={{ maxHeight: '30vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(geom, null, 2)}
              </pre>
            </Panel>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default collect(TilesetEditor);