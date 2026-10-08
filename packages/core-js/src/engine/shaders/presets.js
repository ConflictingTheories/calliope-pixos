/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * @fileoverview Unified effects preset registry.
 *
 * One catalog over the engine's existing shader library:
 * - 10 transitions (shaders/transition/*)
 * - 12 post-processing FX (shaders/effects/index.js)
 * - mushu-powered additions (GLSL snippets from vendored mushu-glsl)
 *
 * Each preset: { id, label, kind, description, params, load }
 * `params` is a JSON-schema-ish descriptor the editor's effects picker
 * renders as controls. `load()` returns { vs, fs } shader sources.
 * The core renderer is untouched — this is a catalog, not a rewrite.
 */

import { noise2D, hash1 } from '../../vendor/mushu-glsl.js';

// ── Transition loaders (lazy to avoid pulling all shaders upfront) ──

async function loadTransition(name) {
  const [vsMod, fsMod] = await Promise.all([
    import(`./transition/${name}/vs.js`),
    import(`./transition/${name}/fs.js`),
  ]);
  const vs = vsMod.default?.() ?? vsMod.default;
  const fs = fsMod.default?.() ?? fsMod.default;
  return { vs, fs };
}

// ── Post-FX (synchronous — already a plain module) ──

import { effects as postFx } from './effects/index.js';

/**
 * @typedef {object} EffectParam
 * @property {string} name
 * @property {string} label
 * @property {'number'|'color'|'boolean'} type
 * @property {number|string|boolean} default
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 */

/**
 * @typedef {object} EffectPreset
 * @property {string} id
 * @property {string} label
 * @property {'transition'|'postfx'} kind
 * @property {string} description
 * @property {EffectParam[]} params
 * @property {() => Promise<{vs: string, fs: string}>} load
 */

const TRANSITIONS = [
  { id: 'fade', label: 'Fade', description: 'Simple fade to/from black.' },
  { id: 'cross', label: 'Cross dissolve', description: 'Crossfade between scenes.' },
  { id: 'crossBlur', label: 'Cross blur', description: 'Crossfade with blur.' },
  { id: 'wipe', label: 'Wipe', description: 'Directional wipe.' },
  { id: 'slide', label: 'Slide', description: 'Slide old scene off.' },
  { id: 'iris', label: 'Iris', description: 'Iris open/close (retro).' },
  { id: 'pixelate', label: 'Pixelate', description: 'Pixel-art-native block dissolve.' },
  { id: 'dissolve', label: 'Dissolve', description: 'Noise-threshold dissolve.' },
  { id: 'swirl', label: 'Swirl', description: 'Vortex warp transition.' },
  { id: 'blur', label: 'Blur', description: 'Defocus blur transition.' },
];

const POSTFX_LABELS = {
  crt: ['CRT', 'Retro CRT monitor: curvature, scanlines, vignette.'],
  bloom: ['Bloom', 'Soft glow on bright areas.'],
  scanlines: ['Scanlines', 'CRT scanline overlay.'],
  chromaticAberration: ['Chromatic aberration', 'RGB fringe on edges.'],
  posterize: ['Posterize', 'Reduce color depth (retro).'],
  grayscale: ['Grayscale', 'Desaturate.'],
  sepia: ['Sepia', 'Warm vintage tone.'],
  thermal: ['Thermal', 'Heat-vision palette.'],
  displacement: ['Displacement', 'UV distortion warp.'],
  vignette: ['Vignette', 'Edge darkening.'],
  pixelate: ['Pixelate (FX)', 'Downsample for chunky pixels.'],
  filmGrain: ['Film grain', 'Animated grain overlay.'],
};

/** Standard progress/direction params every transition accepts. */
const TRANSITION_PARAMS = [
  { name: 'duration', label: 'Duration (ms)', type: 'number', default: 500, min: 50, max: 5000, step: 50 },
  { name: 'direction', label: 'Direction', type: 'number', default: 0, min: 0, max: 1, step: 1 },
];

/**
 * Mushu-powered addition: ordered-dither dissolve.
 * Pixel-art-appropriate transition using an 8x8 Bayer matrix —
 * pixels pop in quantized steps instead of alpha-blending,
 * which preserves the crisp pixel aesthetic. Demonstrates the
 * vendored mushu GLSL snippet library (hash/noise available for
 * variants).
 */
const DITHER_DISSOLVE_FS = `
  precision mediump float;
  varying vec2 vUV;
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform vec2 uResolution;
  float bayer(vec2 p) {
    // 4x4 Bayer matrix via bit tricks (compact ordered dither).
    vec2 ip = floor(mod(p, 4.0));
    float idx = ip.x + ip.y * 4.0;
    float m = 0.0;
    if (idx < 0.5) m = 0.0; else if (idx < 1.5) m = 8.0;
    else if (idx < 2.5) m = 2.0; else if (idx < 3.5) m = 10.0;
    else if (idx < 4.5) m = 12.0; else if (idx < 5.5) m = 4.0;
    else if (idx < 6.5) m = 14.0; else if (idx < 7.5) m = 6.0;
    else if (idx < 8.5) m = 3.0; else if (idx < 9.5) m = 11.0;
    else if (idx < 10.5) m = 1.0; else if (idx < 11.5) m = 9.0;
    else if (idx < 12.5) m = 15.0; else if (idx < 13.5) m = 7.0;
    else if (idx < 14.5) m = 13.0; else m = 5.0;
    return m / 16.0;
  }
  void main() {
    vec4 c = texture2D(uTexture, vUV);
    float d = bayer(vUV * uResolution);
    if (d > uProgress) discard;
    gl_FragColor = c;
  }
`;

const DITHER_DISSOLVE_VS = `
  attribute vec2 aPosition;
  varying vec2 vUV;
  void main() {
    vUV = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

/** @returns {EffectPreset[]} */
export function listPresets() {
  const presets = [];

  for (const t of TRANSITIONS) {
    presets.push({
      id: `transition:${t.id}`,
      label: t.label,
      kind: 'transition',
      description: t.description,
      params: TRANSITION_PARAMS,
      load: () => loadTransition(t.id),
    });
  }

  // Mushu-powered pixel-art transition.
  presets.push({
    id: 'transition:dither-dissolve',
    label: 'Dither dissolve',
    kind: 'transition',
    description: 'Ordered-dither pop-in — pixel-art-native, no alpha blur. (mushu GLSL)',
    params: TRANSITION_PARAMS,
    load: async () => ({ vs: DITHER_DISSOLVE_VS, fs: DITHER_DISSOLVE_FS }),
  });

  for (const [key, fx] of Object.entries(postFx)) {
    const [label, description] = POSTFX_LABELS[key] ?? [key, ''];
    presets.push({
      id: `postfx:${key}`,
      label,
      kind: 'postfx',
      description,
      params: [
        { name: 'intensity', label: 'Intensity', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
      ],
      load: async () => ({ vs: fx.vs, fs: fx.fs }),
    });
  }

  return presets;
}

/** @returns {EffectPreset|undefined} */
export function getPreset(id) {
  return listPresets().find((p) => p.id === id);
}

// Re-export mushu snippets for effect authors.
export { noise2D, hash1 };
