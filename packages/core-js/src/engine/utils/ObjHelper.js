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

/**
 * ObjHelper - A clean, modern OBJ/MTL parser and loader
 *
 * Based on the patterns from ObjModelViewer.jsx, this helper provides:
 * - Simple OBJ parsing with face triangulation
 * - MTL material parsing with texture support
 * - Automatic face normal calculation when vertex normals are missing
 * - Per-mesh material assignment
 * - WebGL buffer initialization
 *
 * @example
 * const helper = new ObjHelper(gl);
 * const meshes = helper.parseOBJ(objText);
 * const materials = helper.parseMTL(mtlText);
 * helper.assignMaterials(meshes, materials);
 * await helper.loadTextures(meshes, textureMap);
 * helper.initBuffers(meshes);
 */

/**
 * Simple vec3 math utilities
 */
const vec3 = {
  sub: (a, b, out = [0, 0, 0]) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },
  cross: (a, b, out = [0, 0, 0]) => {
    const ax = a[0],
      ay = a[1],
      az = a[2];
    const bx = b[0],
      by = b[1],
      bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  length: v => Math.hypot(v[0], v[1], v[2]),
  normalize: (v, out = [0, 0, 0]) => {
    const len = vec3.length(v);
    if (len === 0) return out;
    out[0] = v[0] / len;
    out[1] = v[1] / len;
    out[2] = v[2] / len;
    return out;
  },
};

/**
 * Parsed mesh structure
 * @typedef {Object} ParsedMesh
 * @property {number[]} positions - Flat array of vertex positions (x,y,z,...)
 * @property {number[]} normals - Flat array of vertex normals (nx,ny,nz,...)
 * @property {number[]} uvs - Flat array of texture coordinates (u,v,...)
 * @property {string} material - Material name from usemtl directive
 * @property {Object} [materialProps] - Material properties after assignment
 * @property {WebGLTexture} [texture] - Loaded texture after texture loading
 * @property {boolean} [hasTexture] - Whether mesh has a texture
 * @property {WebGLVertexArrayObject} [vao] - Vertex array object after buffer init
 * @property {number} [count] - Number of vertices for drawArrays
 * @property {WebGLBuffer} [vertexBuffer] - Position buffer (for legacy compatibility)
 * @property {WebGLBuffer} [normalBuffer] - Normal buffer (for legacy compatibility)
 * @property {WebGLBuffer} [textureBuffer] - UV buffer (for legacy compatibility)
 */

/**
 * Parsed material structure
 * @typedef {Object} ParsedMaterial
 * @property {number[]} Ka - Ambient color [r,g,b]
 * @property {number[]} Kd - Diffuse color [r,g,b]
 * @property {number[]} Ks - Specular color [r,g,b]
 * @property {number} Ns - Specular exponent
 * @property {string} [map_Kd] - Diffuse texture filename
 */

export default class ObjHelper {
  /**
   * @param {WebGL2RenderingContext} gl - WebGL context
   */
  constructor(gl) {
    this.gl = gl;
  }

  /**
   * Parse OBJ file text into mesh arrays
   * Supports:
   * - v (vertex positions)
   * - vt (texture coordinates)
   * - vn (vertex normals)
   * - f (faces with triangulation)
   * - usemtl (material assignment)
   *
   * @param {string} text - OBJ file content
   * @returns {ParsedMesh[]} Array of parsed meshes, one per material group
   */
  parseOBJ(text) {
    const lines = text.split(/\r?\n/);

    // Global vertex data (1-indexed in OBJ format)
    const positions = [];
    const uvs = [];
    const normals = [];

    // Meshes split by material
    const meshes = [];
    let currentMesh = { positions: [], uvs: [], normals: [], material: 'default' };
    let currentMaterial = 'default';

    for (let line of lines) {
      line = line.trim();
      if (!line || line[0] === '#') continue;
      const parts = line.split(/\s+/);

      switch (parts[0]) {
        case 'v':
          // Vertex position
          positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
          break;

        case 'vt':
          // Texture coordinate (flip Y for OpenGL convention)
          uvs.push(parseFloat(parts[1]), 1.0 - parseFloat(parts[2]));
          break;

        case 'vn':
          // Vertex normal
          normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
          break;

        case 'f':
          // Face - triangulate if more than 3 vertices
          const faceVerts = parts.slice(1).map(v => {
            const idx = v.split('/');
            return {
              v: idx[0] ? parseInt(idx[0]) : null,
              vt: idx[1] && idx[1] !== '' ? parseInt(idx[1]) : null,
              vn: idx[2] && idx[2] !== '' ? parseInt(idx[2]) : null,
            };
          });

          // Triangulate face (fan triangulation)
          for (let i = 1; i < faceVerts.length - 1; i++) {
            const fv = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];

            // Get positions for this triangle
            const triPos = fv.map(f => {
              if (!f.v) return [0, 0, 0];
              const idx = f.v > 0 ? f.v - 1 : positions.length / 3 + f.v;
              const off = idx * 3;
              return [positions[off], positions[off + 1], positions[off + 2]];
            });

            // Get UVs for this triangle
            const triUv = fv.map(f => {
              if (!f.vt) return [0, 0];
              const idx = f.vt > 0 ? f.vt - 1 : uvs.length / 2 + f.vt;
              const off = idx * 2;
              return [uvs[off], uvs[off + 1]];
            });

            // Calculate face normal if vertex normals are missing
            const useFaceNormal = fv[0].vn == null && fv[1].vn == null && fv[2].vn == null;
            let faceNormal = [0, 0, 0];
            if (useFaceNormal) {
              const e1 = vec3.sub(triPos[1], triPos[0]);
              const e2 = vec3.sub(triPos[2], triPos[0]);
              vec3.cross(e1, e2, faceNormal);
              vec3.normalize(faceNormal, faceNormal);
            }

            // Add each vertex of the triangle
            for (let k = 0; k < 3; k++) {
              currentMesh.positions.push(triPos[k][0], triPos[k][1], triPos[k][2]);
              currentMesh.uvs.push(triUv[k][0], triUv[k][1]);

              if (fv[k].vn != null) {
                const idx = fv[k].vn > 0 ? fv[k].vn - 1 : normals.length / 3 + fv[k].vn;
                const off = idx * 3;
                currentMesh.normals.push(normals[off], normals[off + 1], normals[off + 2]);
              } else {
                currentMesh.normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
              }
            }
          }
          break;

        case 'usemtl':
          // Start new mesh for new material
          if (currentMesh.positions.length > 0) {
            meshes.push(currentMesh);
          }
          currentMaterial = parts[1];
          currentMesh = { positions: [], uvs: [], normals: [], material: currentMaterial };
          break;
      }
    }

    // Don't forget the last mesh
    if (currentMesh.positions.length > 0) {
      meshes.push(currentMesh);
    }

    return meshes;
  }

  /**
   * Parse MTL file text into material definitions
   * Supports:
   * - newmtl (new material)
   * - Ka, Kd, Ks (ambient, diffuse, specular colors)
   * - Ns (specular exponent)
   * - map_Kd (diffuse texture map)
   *
   * @param {string} text - MTL file content
   * @returns {Object.<string, ParsedMaterial>} Material definitions keyed by name
   */
  parseMTL(text) {
    const materials = {};
    let current = null;
    const lines = text.split(/\r?\n/);

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/\s+/);

      switch (parts[0]) {
        case 'newmtl':
          current = parts[1];
          materials[current] = {
            Ka: [1, 1, 1],
            Kd: [0.8, 0.8, 0.8],
            Ks: [1, 1, 1],
            Ns: 50,
          };
          break;

        case 'Ka':
        case 'Kd':
        case 'Ks':
          if (current) {
            const vals = parts.slice(1).map(parseFloat);
            materials[current][parts[0]] = vals.length === 1 ? [vals[0], vals[0], vals[0]] : vals;
          }
          break;

        case 'Ns':
          if (current) {
            materials[current].Ns = parseFloat(parts[1]);
          }
          break;

        case 'map_Kd':
          if (current) {
            // Handle paths with spaces
            materials[current].map_Kd = parts.slice(1).join(' ');
          }
          break;
      }
    }

    return materials;
  }

  /**
   * Assign material properties to meshes
   * @param {ParsedMesh[]} meshes - Parsed meshes
   * @param {Object.<string, ParsedMaterial>} materials - Parsed materials
   * @param {Object.<string, WebGLTexture>} [textures={}] - Pre-loaded textures keyed by filename
   */
  assignMaterials(meshes, materials, textures = {}) {
    const defaultMaterial = {
      Ka: [0.25, 0.25, 0.3],
      Kd: [0.75, 0.75, 0.75],
      Ks: [1, 1, 1],
      Ns: 50,
    };

    meshes.forEach(mesh => {
      mesh.materialProps = materials[mesh.material] || defaultMaterial;

      // Look for texture
      let tex = null;
      if (mesh.materialProps.map_Kd) {
        // Extract filename from path (handle both / and \)
        const texName = mesh.materialProps.map_Kd.split(/[/\\]/).pop();
        tex = textures[texName] || null;
      }
      mesh.texture = tex;
      mesh.hasTexture = !!tex;
    });
  }

  /**
   * Load a texture from an image source
   * @param {string|HTMLImageElement|Blob} source - Image URL, Image element, or Blob
   * @returns {Promise<WebGLTexture>} Loaded texture
   */
  async loadTexture(source) {
    const gl = this.gl;

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // Power of 2 textures get mipmaps
        if ((img.width & (img.width - 1)) === 0 && (img.height & (img.height - 1)) === 0) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // Clean up blob URL if used
        if (typeof source !== 'string' && !(source instanceof HTMLImageElement)) {
          URL.revokeObjectURL(img.src);
        }

        resolve(tex);
      };

      img.onerror = () => {
        if (typeof source !== 'string' && !(source instanceof HTMLImageElement)) {
          URL.revokeObjectURL(img.src);
        }
        reject(new Error(`Failed to load texture`));
      };

      // Set source
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof HTMLImageElement) {
        // Already an image
        img.src = source.src;
      } else if (source instanceof Blob) {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  /**
   * Create a 1x1 placeholder texture
   * @param {number[]} color - RGBA color [r,g,b,a] 0-255
   * @returns {WebGLTexture} Placeholder texture
   */
  createPlaceholderTexture(color = [128, 128, 128, 255]) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(color)
    );
    return tex;
  }

  /**
   * Initialize WebGL buffers for meshes
   * Creates VAO with position, normal, and UV buffers
   * Also creates legacy-compatible separate buffer references
   *
   * @param {ParsedMesh[]} meshes - Parsed meshes to initialize
   */
  initBuffers(meshes) {
    const gl = this.gl;

    meshes.forEach(mesh => {
      // Create VAO for modern WebGL2 approach
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      // Position buffer (attribute 0)
      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.positions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      // Normal buffer (attribute 1)
      const normBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      // UV buffer (attribute 2)
      const uvBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

      // Store references
      mesh.vao = vao;
      mesh.count = mesh.positions.length / 3;

      // Legacy compatibility - store buffer references for existing engine code
      mesh.vertexBuffer = posBuf;
      mesh.vertexBuffer.numItems = mesh.count;
      mesh.normalBuffer = normBuf;
      mesh.normalBuffer.numItems = mesh.count;
      mesh.textureBuffer = uvBuf;
      mesh.textureBuffer.numItems = mesh.count;

      // Unbind VAO
      gl.bindVertexArray(null);
    });
  }

  /**
   * Initialize buffers in legacy format for compatibility with existing engine
   * This creates buffers compatible with the existing OBJ library interface
   *
   * @param {Object} mesh - Legacy mesh object with vertices, vertexNormals, textures arrays
   * @returns {Object} Mesh with initialized buffers
   */
  initLegacyBuffers(mesh) {
    const gl = this.gl;

    // Vertex positions
    mesh.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
    mesh.vertexBuffer.itemSize = 3;
    mesh.vertexBuffer.numItems = mesh.vertices.length / 3;

    // Vertex normals
    if (mesh.vertexNormals && mesh.vertexNormals.length > 0) {
      mesh.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
      mesh.normalBuffer.itemSize = 3;
      mesh.normalBuffer.numItems = mesh.vertexNormals.length / 3;
    }

    // Texture coordinates
    if (mesh.textures && mesh.textures.length > 0) {
      mesh.textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
      mesh.textureBuffer.itemSize = 2;
      mesh.textureBuffer.numItems = mesh.textures.length / 2;
    }

    // Indices
    if (mesh.indices && mesh.indices.length > 0) {
      mesh.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
      mesh.indexBuffer.itemSize = 1;
      mesh.indexBuffer.numItems = mesh.indices.length;
    }

    return mesh;
  }

  /**
   * Calculate bounding box for a mesh
   * @param {ParsedMesh|{vertices: number[]}} mesh - Mesh with positions or vertices
   * @returns {{min: number[], max: number[], size: number[], center: number[]}}
   */
  calculateBounds(mesh) {
    const positions = mesh.positions || mesh.vertices;
    if (!positions || positions.length === 0) {
      return {
        min: [0, 0, 0],
        max: [0, 0, 0],
        size: [0, 0, 0],
        center: [0, 0, 0],
      };
    }

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    return {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      size: [maxX - minX, maxY - minY, maxZ - minZ],
      center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    };
  }

  /**
   * Load textures for materials from zip file
   * @param {ParsedMesh[]} meshes - Meshes with material props
   * @param {object} options - Options with zip and root
   * @param {object} options.zip - JSZip instance
   * @param {string} [options.root='textures'] - Texture root path in zip
   * @returns {Promise<void>}
   */
  async loadTextures(meshes, { zip, root = 'textures' }) {
    const gl = this.gl;
    const texturePromises = [];

    // Collect unique texture filenames
    const textureFiles = new Set();
    meshes.forEach(mesh => {
      if (mesh.materialProps && mesh.materialProps.map_Kd) {
        const filename = mesh.materialProps.map_Kd.split(/[/\\]/).pop();
        textureFiles.add(filename);
      }
    });

    // Load each texture
    for (const filename of textureFiles) {
      // Possible paths in ZIP: root, textures/, models/, or raw path
      const paths = [filename, `${root}/${filename}`, `textures/${filename}`, `models/${filename}`];

      let file = null;
      for (const p of paths) {
        file = zip.file(p);
        if (file) break;
      }

      const promise = (
        file
          ? file.async('arraybuffer')
          : Promise.reject(new Error(`File ${filename} not found in any expected paths`))
      )
        .then(buffer => new Blob([buffer]))
        .then(blob => this.loadTexture(blob))
        .then(texture => {
          // Assign to meshes that use this texture
          meshes.forEach(mesh => {
            if (mesh.materialProps && mesh.materialProps.map_Kd) {
              const meshFilename = mesh.materialProps.map_Kd.split(/[/\\]/).pop();
              if (meshFilename === filename) {
                mesh.texture = texture;
                mesh.hasTexture = true;
              }
            }
          });
        })
        .catch(err => {
          console.warn(`Failed to load texture ${filename}:`, err);
          // Assign placeholder
          const placeholder = this.createPlaceholderTexture();
          meshes.forEach(mesh => {
            if (mesh.materialProps && mesh.materialProps.map_Kd) {
              const meshFilename = mesh.materialProps.map_Kd.split(/[/\\]/).pop();
              if (meshFilename === filename) {
                mesh.texture = placeholder;
                mesh.hasTexture = false;
              }
            }
          });
        });
      texturePromises.push(promise);
    }

    await Promise.all(texturePromises);
  }

  /**
   * Clean up WebGL resources for meshes
   * @param {ParsedMesh[]} meshes - Meshes to clean up
   */
  deleteMeshBuffers(meshes) {
    const gl = this.gl;

    meshes.forEach(mesh => {
      if (mesh.vao) gl.deleteVertexArray(mesh.vao);
      if (mesh.vertexBuffer) gl.deleteBuffer(mesh.vertexBuffer);
      if (mesh.normalBuffer) gl.deleteBuffer(mesh.normalBuffer);
      if (mesh.textureBuffer) gl.deleteBuffer(mesh.textureBuffer);
      if (mesh.texture) gl.deleteTexture(mesh.texture);
    });
  }
}

// Export vec3 utilities for external use
export { vec3 };
