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

// Transition shader imports
import crossVs from '../../shaders/transition/cross/vs.js';
import crossFs from '../../shaders/transition/cross/fs.js';
import crossBlurVs from '../../shaders/transition/crossBlur/vs.js';
import crossBlurFs from '../../shaders/transition/crossBlur/fs.js';
import swirlVs from '../../shaders/transition/swirl/vs.js';
import swirlFs from '../../shaders/transition/swirl/fs.js';
import blurVs from '../../shaders/transition/blur/vs.js';
import blurFs from '../../shaders/transition/blur/fs.js';
import fadeVs from '../../shaders/transition/fade/vs.js';
import fadeFs from '../../shaders/transition/fade/fs.js';

// Skybox shader imports
import morningVs from '../../shaders/skybox/morning/vs.js';
import morningFs from '../../shaders/skybox/morning/fs.js';
import skyVs from '../../shaders/skybox/sky/vs.js';
import skyFs from '../../shaders/skybox/sky/fs.js';
import sunsetVs from '../../shaders/skybox/sunset/vs.js';
import sunsetFs from '../../shaders/skybox/sunset/fs.js';
import matrixVs from '../../shaders/skybox/matrix/vs.js';
import matrixFs from '../../shaders/skybox/matrix/fs.js';
import neonVs from '../../shaders/skybox/neon/vs.js';
import neonFs from '../../shaders/skybox/neon/fs.js';
import cosmicVs from '../../shaders/skybox/cosmic/vs.js';
import cosmicFs from '../../shaders/skybox/cosmic/fs.js';

/**
 * Fetches vertex and fragment shader source code for transition effects.
 * @param {string} type - The type of transition effect (e.g., 'fade', 'cross', 'swirl').
 * @returns {[string, string]} An array containing the vertex shader source and fragment shader source.
 */
export function fetchTransitionShaderFiles(type) {
  /** @type {string|null} */
  let vsSource = null;
  /** @type {string|null} */
  let fsSource = null;

  const t = (type || '').toLowerCase();

  if (t === 'cross') {
    vsSource = crossVs();
    fsSource = crossFs();
  } else if (t === 'crossblur' || t === 'cross-blur') {
    vsSource = crossBlurVs();
    fsSource = crossBlurFs();
  } else if (t === 'swirl') {
    vsSource = swirlVs();
    fsSource = swirlFs();
  } else if (t === 'blur' || t === 'blur-in' || t === 'blur-out') {
    vsSource = blurVs();
    fsSource = blurFs();
  } else {
    // Default to fade transition; also handles 'fade', 'fade-in', 'fade-out'.
    vsSource = fadeVs();
    fsSource = fadeFs();
  }

  return [vsSource, fsSource];
}

/**
 * Fetches vertex and fragment shader source code for skybox effects.
 * @param {string} type - The type of skybox effect (e.g., 'cosmic', 'morning', 'sky').
 * @returns {[string, string]} An array containing the vertex shader source and fragment shader source.
 */
export function fetchSkyboxShaderFiles(type) {
  /** @type {string|null} */
  let vsSource = null;
  /** @type {string|null} */
  let fsSource = null;

  const t = (type || '').toLowerCase();

  if (t === 'morning') {
    vsSource = morningVs();
    fsSource = morningFs();
  } else if (t === 'sky') {
    vsSource = skyVs();
    fsSource = skyFs();
  } else if (t === 'sunset') {
    vsSource = sunsetVs();
    fsSource = sunsetFs();
  } else if (t === 'matrix') {
    vsSource = matrixVs();
    fsSource = matrixFs();
  } else if (t === 'neon') {
    vsSource = neonVs();
    fsSource = neonFs();
  } else {
    // Default to cosmic.
    vsSource = cosmicVs();
    fsSource = cosmicFs();
  }

  return [vsSource, fsSource];
}
