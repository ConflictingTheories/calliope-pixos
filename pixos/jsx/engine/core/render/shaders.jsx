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
 * Transition Shader files for transition effects
 * @param {*} type 
 * @returns 
 */
export function fetchTransitionShaderFiles(type) {
  let vsSource = null;
  let fsSource = null;

  const t = (type || '').toLowerCase();

  if (t === 'cross') {
    vsSource = require('../../shaders/transition/cross/vs.jsx').default();
    fsSource = require('../../shaders/transition/cross/fs.jsx').default();
  } else if (t === 'crossblur' || t === 'cross-blur') {
    vsSource = require('../../shaders/transition/crossBlur/vs.jsx').default();
    fsSource = require('../../shaders/transition/crossBlur/fs.jsx').default();
  } else if (t === 'swirl') {
    vsSource = require('../../shaders/transition/swirl/vs.jsx').default();
    fsSource = require('../../shaders/transition/swirl/fs.jsx').default();
  } else if (t === 'blur' || t === 'blur-in' || t === 'blur-out') {
    vsSource = require('../../shaders/transition/blur/vs.jsx').default();
    fsSource = require('../../shaders/transition/blur/fs.jsx').default();
  } else {
    // Default to fade transition; also handles 'fade', 'fade-in', 'fade-out'.
    vsSource = require('../../shaders/transition/fade/vs.jsx').default();
    fsSource = require('../../shaders/transition/fade/fs.jsx').default();
  }

  return [vsSource, fsSource];
}


/**
 * Skybox Shader files (todo -- WIP)
 * @param {*} type 
 * @returns 
 */
export function fetchSkyboxShaderFiles(type) {
  let vsSource = null;
  let fsSource = null;

  const t = (type || '').toLowerCase();

  if (t === 'morning') {
    vsSource = require('../../shaders/skybox/morning/vs.jsx').default();
    fsSource = require('../../shaders/skybox/morning/fs.jsx').default();
  } else if (t === 'sky') {
    vsSource = require('../../shaders/skybox/sky/vs.jsx').default();
    fsSource = require('../../shaders/skybox/sky/fs.jsx').default();
  } else if (t === 'sunset') {
    vsSource = require('../../shaders/skybox/sunset/vs.jsx').default();
    fsSource = require('../../shaders/skybox/sunset/fs.jsx').default();
  } else if (t === 'matrix') {
    vsSource = require('../../shaders/skybox/matrix/vs.jsx').default();
    fsSource = require('../../shaders/skybox/matrix/fs.jsx').default();
  } else if (t === 'neon') {
    vsSource = require('../../shaders/skybox/neon/vs.jsx').default();
    fsSource = require('../../shaders/skybox/neon/fs.jsx').default();
  } else {
    // Default to cosmic.
    vsSource = require('../../shaders/skybox/cosmic/vs.jsx').default();
    fsSource = require('../../shaders/skybox/cosmic/fs.jsx').default();
  }

  return [vsSource, fsSource];
}
