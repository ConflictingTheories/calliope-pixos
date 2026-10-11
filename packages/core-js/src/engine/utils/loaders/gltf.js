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

/**
 * GLTF 2.0 loader for PixoSpritz (custom WebGL, no Three.js).
 *
 * Supports:
 * - .gltf (JSON with embedded base64 or external .bin)
 * - .glb (binary container)
 * - Meshes: POSITION, NORMAL, TEXCOORD_0, indices
 * - Materials: PBR metallic-roughness (baseColorFactor, metallicFactor, roughnessFactor)
 * - Node hierarchy with TRS transforms
 *
 * Does not support (yet): extensions, morph targets.
 */

const COMPONENT_TYPES = {
  5120: Int8Array,    // BYTE
  5121: Uint8Array,   // UNSIGNED_BYTE
  5122: Int16Array,   // SHORT
  5123: Uint16Array,  // UNSIGNED_SHORT
  5125: Uint32Array,  // UNSIGNED_INT
  5126: Float32Array, // FLOAT
};

const TYPE_SIZES = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16,
};

/**
 * Parse a .glb binary container into { json, buffers }.
 * @param {ArrayBuffer} data
 */
export function parseGLB(data) {
  const view = new DataView(data);
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546C67) { // 'glTF'
    throw new Error('Not a GLB file (bad magic)');
  }
  const version = view.getUint32(4, true);
  if (version !== 2) {
    throw new Error(`Unsupported GLB version: ${version}`);
  }

  let offset = 12;
  let json = null;
  const buffers = [];

  while (offset < data.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkData = data.slice(offset + 8, offset + 8 + chunkLength);

    if (chunkType === 0x4E4F534A) { // 'JSON'
      const text = new TextDecoder().decode(chunkData);
      json = JSON.parse(text);
    } else if (chunkType === 0x004E4942) { // 'BIN'
      buffers.push(chunkData);
    }
    offset += 8 + chunkLength;
  }

  if (!json) throw new Error('GLB missing JSON chunk');
  return { json, buffers };
}

/**
 * Decode a base64 data URI into an ArrayBuffer.
 */
function decodeDataURI(uri) {
  const base64 = uri.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Get accessor data as a typed array.
 */
function getAccessorData(gltf, buffers, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const buffer = buffers[bufferView.buffer];

  const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const ComponentType = COMPONENT_TYPES[accessor.componentType];
  const numComponents = TYPE_SIZES[accessor.type];
  const count = accessor.count * numComponents;

  return new ComponentType(buffer, byteOffset, count);
}

/**
 * Load a GLTF model from a zip archive.
 * @param {object} zip - JSZip instance
 * @param {string} basePath - e.g. 'models/my-model'
 * @returns {Promise<object>} { meshes: [...], materials: [...] }
 */
export async function loadGLTFFromZip(zip, basePath) {
  // Try .glb first, then .gltf
  let gltf, buffers = [];

  const glbFile = zip.file(`${basePath}.glb`);
  if (glbFile) {
    const data = await glbFile.async('arraybuffer');
    const parsed = parseGLB(data);
    gltf = parsed.json;
    buffers = parsed.buffers;
  } else {
    const gltfFile = zip.file(`${basePath}.gltf`);
    if (!gltfFile) throw new Error(`No GLTF file found: ${basePath}.glb or .gltf`);
    const text = await gltfFile.async('string');
    gltf = JSON.parse(text);

    // Load buffers
    for (const buf of gltf.buffers || []) {
      if (buf.uri.startsWith('data:')) {
        buffers.push(decodeDataURI(buf.uri));
      } else {
        const binFile = zip.file(`models/${buf.uri}`);
        if (!binFile) throw new Error(`Missing buffer: ${buf.uri}`);
        buffers.push(await binFile.async('arraybuffer'));
      }
    }
  }

  return parseGLTF(gltf, buffers);
}

/**
 * Parse GLTF JSON + buffers into engine-ready mesh data.
 */
export function parseGLTF(gltf, buffers) {
  const meshes = [];
  const materials = [];

  // Materials
  for (const mat of gltf.materials || []) {
    const pbr = mat.pbrMetallicRoughness || {};
    materials.push({
      name: mat.name || 'default',
      baseColor: pbr.baseColorFactor || [1, 1, 1, 1],
      metallic: pbr.metallicFactor ?? 1.0,
      roughness: pbr.roughnessFactor ?? 1.0,
      doubleSided: mat.doubleSided || false,
    });
  }

  // Meshes
  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives) {
      const attributes = prim.attributes;
      const meshData = {
        name: mesh.name || 'mesh',
        materialIndex: prim.material ?? 0,
        positions: null,
        normals: null,
        uvs: null,
        indices: null,
      };

      if (attributes.POSITION !== undefined) {
        meshData.positions = Array.from(getAccessorData(gltf, buffers, attributes.POSITION));
      }
      if (attributes.NORMAL !== undefined) {
        meshData.normals = Array.from(getAccessorData(gltf, buffers, attributes.NORMAL));
      }
      if (attributes.TEXCOORD_0 !== undefined) {
        meshData.uvs = Array.from(getAccessorData(gltf, buffers, attributes.TEXCOORD_0));
      }
      if (prim.indices !== undefined) {
        meshData.indices = Array.from(getAccessorData(gltf, buffers, prim.indices));
      }

      // Skinning: joint indices and weights
      if (attributes.JOINTS_0 !== undefined) {
        meshData.joints = Array.from(getAccessorData(gltf, buffers, attributes.JOINTS_0));
      }
      if (attributes.WEIGHTS_0 !== undefined) {
        meshData.weights = Array.from(getAccessorData(gltf, buffers, attributes.WEIGHTS_0));
      }
      if (prim.skin !== undefined) {
        meshData.skinIndex = prim.skin;
      }

      meshes.push(meshData);
    }
  }

  // Skins: skeletal data for skinned meshes
  const skins = [];
  for (const skin of gltf.skins || []) {
    const skinData = {
      name: skin.name || `skin_${skins.length}`,
      joints: skin.joints || [],  // node indices
      inverseBindMatrices: null,
      skeleton: skin.skeleton,
    };
    if (skin.inverseBindMatrices !== undefined) {
      const ibm = Array.from(getAccessorData(gltf, buffers, skin.inverseBindMatrices));
      // Convert flat array to array of 4x4 matrices
      skinData.inverseBindMatrices = [];
      for (let i = 0; i < ibm.length; i += 16) {
        skinData.inverseBindMatrices.push(ibm.slice(i, i + 16));
      }
    }
    skins.push(skinData);
  }

  // Animations: keyframed node transforms
  const animations = [];
  for (const anim of gltf.animations || []) {
    const animData = {
      name: anim.name || `anim_${animations.length}`,
      channels: [],
      samplers: [],
      duration: 0,
    };
    // Samplers: input times, output values, interpolation
    for (const sampler of anim.samplers || []) {
      const input = Array.from(getAccessorData(gltf, buffers, sampler.input));
      const output = Array.from(getAccessorData(gltf, buffers, sampler.output));
      animData.samplers.push({
        input,   // keyframe times
        output,  // keyframe values (flat)
        interpolation: sampler.interpolation || 'LINEAR',
      });
      // Track duration
      if (input.length > 0) {
        animData.duration = Math.max(animData.duration, input[input.length - 1]);
      }
    }
    // Channels: which node, which property, which sampler
    for (const channel of anim.channels || []) {
      animData.channels.push({
        sampler: channel.sampler,
        targetNode: channel.target.node,
        targetPath: channel.target.path, // 'translation', 'rotation', 'scale'
      });
    }
    animations.push(animData);
  }

  // Node transforms (flatten hierarchy for now)
  const nodes = [];
  const processNode = (nodeIndex, parentMatrix) => {
    const node = gltf.nodes[nodeIndex];
    // TODO: compose TRS into matrix, multiply by parent
    // For now, store TRS directly
    nodes.push({
      name: node.name || `node_${nodeIndex}`,
      translation: node.translation || [0, 0, 0],
      rotation: node.rotation || [0, 0, 0, 1], // quaternion
      scale: node.scale || [1, 1, 1],
      mesh: node.mesh,
      skin: node.skin,
      children: node.children || [],
    });
    for (const child of node.children || []) {
      processNode(child, parentMatrix);
    }
  };

  const scene = gltf.scenes[gltf.scene || 0];
  for (const nodeIndex of scene.nodes || []) {
    processNode(nodeIndex, null);
  }

  return { meshes, materials, nodes, skins, animations };
}

export default { parseGLB, parseGLTF, loadGLTFFromZip };
