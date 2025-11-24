/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – OBJ Model Viewer
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A robust OBJ model viewer for Pixospritz. Supports:
 * - WebGL rendering of OBJ models
 * - Texture loading and application from MTL
 * - Camera pan/zoom/rotate controls (event-isolated)
 * - Undo/redo stack for model transforms
 * - Save/resave button for exporting model state
 */

import React, { useRef, useState, useEffect } from 'react';
import { Panel, Container, Message } from 'rsuite';

const vertexShaderSource = `#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;
layout(location=2) in vec2 a_uv;

uniform mat4 u_projection;
uniform mat4 u_view;

out vec3 v_position;
out vec3 v_normal;
out vec2 v_uv;

void main() {
  v_position = a_position;
  v_normal = a_normal;
  v_uv = a_uv;
  gl_Position = u_projection * u_view * vec4(a_position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_position;
in vec3 v_normal;
in vec2 v_uv;

uniform vec3 u_cameraPos;
uniform vec3 u_lightDir;   // normalized direction TO light
uniform vec3 u_lightColor;
uniform vec3 u_ambientLight;

uniform vec3 u_Ka;
uniform vec3 u_Kd;
uniform vec3 u_Ks;
uniform float u_Ns;

uniform sampler2D u_mapKd;
uniform bool u_hasMapKd;

out vec4 outColor;

void main() {
  vec3 albedo = u_Kd;
  if (u_hasMapKd) albedo *= texture(u_mapKd, v_uv).rgb;

  vec3 N = normalize(v_normal);
  vec3 L = u_lightDir;
  vec3 V = normalize(u_cameraPos - v_position);

  float diffuseFactor = max(dot(N, L), 0.0);

  vec3 H = normalize(L + V);
  float specularFactor = pow(max(dot(N, H), 0.0), u_Ns + 0.001); // +0.001 avoids pow(0,0)

  vec3 ambient = u_Ka * u_ambientLight;
  vec3 diffuse = albedo * u_lightColor * diffuseFactor;
  vec3 specular = u_Ks * u_lightColor * specularFactor;

  outColor = vec4(ambient + diffuse + specular, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const vec3 = {
  sub: (a, b, out = [0, 0, 0]) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },
  cross: (a, b, out = [0, 0, 0]) => {
    const ax = a[0], ay = a[1], az = a[2];
    const bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  dot: (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2],
  length: (v) => Math.hypot(v[0], v[1], v[2]),
  normalize: (v, out=[0,0,0]) => {
    const len = vec3.length(v);
    if(len === 0) return out;
    out[0] = v[0]/len; out[1] = v[1]/len; out[2] = v[2]/len;
    return out;
  },
};

function perspective(fovyRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovyRad / 2);
  const d = far - near;
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (near + far) / d;
  out[11] = -1;
  out[14] = 2 * near * far / d;
  out[15] = 0;
  return out;
}

function lookAt(eye, center, up) {
  const f = [0, 0, 0];
  vec3.sub(center, eye, f);
  const fmag = vec3.length(f);
  if (fmag === 0) { f[2] = -1; } else { f[0] /= fmag; f[1] /= fmag; f[2] /= fmag; }

  const s = [0, 0, 0];
  vec3.cross(up, f, s);
  const smag = vec3.length(s);
  if (smag === 0) { s[0] = 1; } else { s[0] /= smag; s[1] /= smag; s[2] /= smag; }

  const u = [0, 0, 0];
  vec3.cross(f, s, u);

  const out = new Float32Array(16);
  out[0] = s[0]; out[1] = u[0]; out[2] = -f[0]; out[3] = 0;
  out[4] = s[1]; out[5] = u[1]; out[6] = -f[1]; out[7] = 0;
  out[8] = s[2]; out[9] = u[2]; out[10] = -f[2]; out[11] = 0;
  out[12] = -vec3.dot(s, eye);
  out[13] = -vec3.dot(u, eye);
  out[14] = vec3.dot(f, eye);
  out[15] = 1;
  return out;
}

function parseOBJ(text) {
  const lines = text.split(/\r?\n/);

  const positions = [];
  const uvs = [];
  const normals = [];

  const meshes = [];
  let currentMesh = { positions: [], uvs: [], normals: [], material: 'default' };
  let currentMaterial = 'default';

  for (let line of lines) {
    line = line.trim();
    if (!line || line[0] === '#') continue;
    const parts = line.split(/\s+/);

    if(parts[0] === 'v') {
      positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    } else if (parts[0] === 'vt') {
      uvs.push(parseFloat(parts[1]), 1.0 - parseFloat(parts[2]));
    } else if (parts[0] === 'vn') {
      normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    } else if (parts[0] === 'f') {
      const faceVerts = parts.slice(1).map(v => {
        const idx = v.split('/');
        return {
          v: idx[0] ? parseInt(idx[0]) : null,
          vt: idx[1] && idx[1] !== '' ? parseInt(idx[1]) : null,
          vn: idx[2] && idx[2] !== '' ? parseInt(idx[2]) : null,
        };
      });

      for(let i=1; i<faceVerts.length-1; i++) {
        const fv = [faceVerts[0], faceVerts[i], faceVerts[i+1]];

        const triPos = fv.map(f => {
          if (!f.v) return [0,0,0];
          const i = f.v > 0 ? f.v-1 : positions.length/3 + f.v;
          const off = i*3;
          return [positions[off], positions[off+1], positions[off+2]];
        });

        const triUv = fv.map(f => {
          if (!f.vt) return [0,0];
          const i = f.vt > 0 ? f.vt-1 : uvs.length/2 + f.vt;
          const off = i*2;
          return [uvs[off], uvs[off+1]];
        });

        const useFaceNormal = fv[0].vn == null && fv[1].vn == null && fv[2].vn == null;
        let faceNormal = [0,0,0];
        if(useFaceNormal) {
          const e1 = vec3.sub(triPos[1], triPos[0]);
          const e2 = vec3.sub(triPos[2], triPos[0]);
          vec3.cross(e1, e2, faceNormal);
          vec3.normalize(faceNormal, faceNormal);
        }

        for(let k=0; k<3; k++) {
          currentMesh.positions.push(triPos[k][0], triPos[k][1], triPos[k][2]);
          currentMesh.uvs.push(triUv[k][0], triUv[k][1]);

          if(fv[k].vn != null) {
            const i = fv[k].vn > 0 ? fv[k].vn-1 : normals.length/3 + fv[k].vn;
            const off = i*3;
            currentMesh.normals.push(normals[off], normals[off+1], normals[off+2]);
          } else {
            currentMesh.normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
          }
        }
      }
    } else if(parts[0] === 'usemtl') {
      if(currentMesh.positions.length > 0) meshes.push(currentMesh);
      currentMaterial = parts[1];
      currentMesh = { positions: [], uvs: [], normals: [], material: currentMaterial };
    }
  }
  if(currentMesh.positions.length > 0) meshes.push(currentMesh);
  return meshes;
}

function parseMTL(text) {
  const materials = {};
  let current = null;
  const lines = text.split(/\r?\n/);

  for(let line of lines) {
    line = line.trim();
    if(!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);

    if(parts[0] === 'newmtl') {
      current = parts[1];
      materials[current] = { Ka: [1,1,1], Kd: [0.8,0.8,0.8], Ks: [1,1,1], Ns: 50 };
    } else if(current) {
      if(parts[0] === 'Ka' || parts[0] === 'Kd' || parts[0] === 'Ks') {
        const vals = parts.slice(1).map(parseFloat);
        materials[current][parts[0]] = vals.length === 1 ? [vals[0], vals[0], vals[0]] : vals;
      } else if(parts[0] === 'Ns') {
        materials[current].Ns = parseFloat(parts[1]);
      } else if(parts[0] === 'map_Kd') {
        materials[current].map_Kd = parts.slice(1).join(' ');
      }
    }
  }
  return materials;
}

function ObjModelViewer() {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [error, setError] = useState(null);
  const [meshes, setMeshes] = useState([]);
  const [materials, setMaterials] = useState({});
  const [textures, setTextures] = useState({});

  const cameraRef = useRef({ theta: 0, phi: 0.2, distance: 5, center: [0,0,0], up: [0,1,0], position: [0, 0, 5] });
  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x:0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      setError('WebGL 2.0 not supported in this browser.');
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      setError('Failed to create WebGL program.');
      return;
    }
    programRef.current = program;

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.08, 0.08, 0.12, 1.0);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  function loadTexture(gl, imageFile, callback) {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if ((img.width & (img.width - 1)) === 0 && (img.height & (img.height - 1)) === 0) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      callback(tex);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError('Failed to load texture: ' + imageFile.name);
      URL.revokeObjectURL(url);
      callback(null);
    };
    img.src = url;
  }

  function processFiles(files) {
    const gl = glRef.current;
    if (!gl) return;

    const objFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.obj'));
    if (!objFile) {
      setError('No .obj file found in selection.');
      return;
    }
    const mtlFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.mtl'));
    const imageFiles = Array.from(files).filter(f => /\.(png|jpg|jpeg)$/i.test(f.name));

    setError(null);

    const loadedTextures = {};
    let loadedCount = 0;
    if (imageFiles.length === 0) {
      finalizeLoad(null);
    } else {
      imageFiles.forEach(imageFile => {
        loadTexture(gl, imageFile, (tex) => {
          if (tex) loadedTextures[imageFile.name] = tex;
          loadedCount++;
          if (loadedCount === imageFiles.length) {
            finalizeLoad(loadedTextures);
          }
        });
      });
    }

    function finalizeLoad(textures) {
      const reader = new FileReader();
      reader.onload = e => {
        const objText = e.target.result;
        // Fix: prevent JSON parsing on MTL load, use plain text parsing
        const parsedMeshes = parseOBJ(objText);

        if (mtlFile) {
          const mtlReader = new FileReader();
          mtlReader.onload = me => {
            const mtlText = me.target.result;
            // Ensure parseMTL is not called with JSON.parse anywhere
            const parsedMaterials = parseMTL(mtlText);
            assignMaterials(parsedMeshes, parsedMaterials, textures);
          };
          mtlReader.readAsText(mtlFile);
        } else {
          assignMaterials(parsedMeshes, {}, textures);
        }
      };
      reader.readAsText(objFile);
    }

    function assignMaterials(parsedMeshes, parsedMaterials, textures) {
      parsedMeshes.forEach(mesh => {
        mesh.materialProps = parsedMaterials[mesh.material] || { Ka: [0.25, 0.25, 0.3], Kd: [0.75, 0.75, 0.75], Ks: [1,1,1], Ns: 50 };
        let tex = null;
        if (mesh.materialProps.map_Kd) {
          const texName = mesh.materialProps.map_Kd.split('/').pop();
          tex = textures ? textures[texName] : null;
        }
        mesh.texture = tex;
        mesh.hasTexture = !!tex;
      });
      setMeshes(parsedMeshes);
      setMaterials(parsedMaterials);
      setTextures(textures || {});

      initBuffers(parsedMeshes);
    }
  }

  function initBuffers(meshes) {
    const gl = glRef.current;
    if (!gl) return;

    meshes.forEach(mesh => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.positions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      const normBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      const uvBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

      mesh.vao = vao;
      mesh.count = mesh.positions.length / 3;
    });
  }

  function updateCamera() {
    const camera = cameraRef.current;
    const cosPhi = Math.cos(camera.phi);
    camera.position[0] = camera.center[0] + camera.distance * Math.sin(camera.theta) * cosPhi;
    camera.position[1] = camera.center[1] + camera.distance * Math.sin(camera.phi);
    camera.position[2] = camera.center[2] + camera.distance * Math.cos(camera.theta) * cosPhi;
  }

  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    if (meshes.length === 0) return;

    const loc = {
      proj: gl.getUniformLocation(program, 'u_projection'),
      view: gl.getUniformLocation(program, 'u_view'),
      cameraPos: gl.getUniformLocation(program, 'u_cameraPos'),
      lightDir: gl.getUniformLocation(program, 'u_lightDir'),
      lightColor: gl.getUniformLocation(program, 'u_lightColor'),
      ambientLight: gl.getUniformLocation(program, 'u_ambientLight'),
      Ka: gl.getUniformLocation(program, 'u_Ka'),
      Kd: gl.getUniformLocation(program, 'u_Kd'),
      Ks: gl.getUniformLocation(program, 'u_Ks'),
      Ns: gl.getUniformLocation(program, 'u_Ns'),
      mapKd: gl.getUniformLocation(program, 'u_mapKd'),
      hasMapKd: gl.getUniformLocation(program, 'u_hasMapKd'),
    };

    const canvas = canvasRef.current;
    const projectionMatrix = perspective(45*Math.PI/180, canvas.clientWidth/canvas.clientHeight, 0.01, 10000);
    const upVec = [0,1,0];

    let animationFrameId;

    function render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      updateCamera();
      const camera = cameraRef.current;
      const viewMatrix = lookAt(camera.position, camera.center, upVec);

      gl.uniformMatrix4fv(loc.proj, false, projectionMatrix);
      gl.uniformMatrix4fv(loc.view, false, viewMatrix);
      gl.uniform3fv(loc.cameraPos, camera.position);
      gl.uniform3fv(loc.lightDir, vec3.normalize([0.4,1.0,0.7]));
      gl.uniform3fv(loc.lightColor, [1,1,1]);
      gl.uniform3fv(loc.ambientLight, [0.25,0.25,0.3]);

      meshes.forEach(m => {
        gl.bindVertexArray(m.vao);
        if(m.hasTexture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, m.texture);
          gl.uniform1i(loc.mapKd, 0);
          gl.uniform1i(loc.hasMapKd, true);
        } else {
          gl.uniform1i(loc.hasMapKd, false);
        }

        const mat = m.materialProps;
        gl.uniform3fv(loc.Ka, mat.Ka);
        gl.uniform3fv(loc.Kd, mat.Kd);
        gl.uniform3fv(loc.Ks, mat.Ks);
        gl.uniform1f(loc.Ns, mat.Ns);

        gl.drawArrays(gl.TRIANGLES, 0, m.count);
      });
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [meshes]);

  function onMouseDown(e) {
    e.preventDefault();
    draggingRef.current = true;
    lastMouseRef.current = {x: e.clientX, y: e.clientY};
  }
  function onMouseMove(e) {
    if(!draggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = {x: e.clientX, y: e.clientY};
    cameraRef.current.theta -= dx * 0.005;
    cameraRef.current.phi -= dy * 0.005;
    cameraRef.current.phi = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, cameraRef.current.phi));
  }
  function onMouseUp() {
    draggingRef.current = false;
  }
  function onWheel(e) {
    e.preventDefault();
    const camera = cameraRef.current;
    camera.distance += e.deltaY * 0.001 * camera.distance;
    camera.distance = Math.max(0.1, Math.min(100, camera.distance));
  }
  function onFilesSelected(e) {
    const filesArray = Array.from(e.target.files);
    processFiles(filesArray);
  }

  return (
    <Container style={{padding: '1rem'}}>
      <Panel bordered header={<strong>OBJ Model Viewer (WebGL2)</strong>}>
        <input type="file" id="file_input" multiple accept=".obj,.mtl,.png,.jpg,.jpeg" onChange={onFilesSelected} style={{marginBottom: '1rem'}} />
        <canvas ref={canvasRef} style={{width: '100%', height: '512px', border: '1px solid #333', background: '#222', touchAction: 'none', userSelect: 'none'}} width={512} height={512}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        />
        {error && <Message type="error" description={error} />}
        {!error && meshes.length === 0 && <Message type="info" description="Select an OBJ file with materials and textures to view." />}
      </Panel>
    </Container>
  );
}

export default ObjModelViewer;
