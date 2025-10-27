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

import { lerp } from '@Engine/utils/math/vector.js';
import { Camera } from '@Engine/core/render/camera.js'; // Import Camera class for JSDoc
import { Direction } from '@Engine/utils/enums.js';

/**
 * @typedef {object} CameraEventOptions
 * @property {number} [duration] - The duration of the camera action in seconds.
 * @property {number} [endTime] - The explicit end time of the camera action.
 * @property {import('../../utils/math/vector.js').Vector} [from] - Starting vector for 'pan' action.
 * @property {import('../../utils/math/vector.js').Vector} [to] - Ending vector for 'pan' action.
 * @property {number} [yawDelta] - Delta yaw for rotation.
 * @property {number} [pitchDelta] - Delta pitch for rotation.
 * @property {number} [zoomDelta] - Delta for zoom action.
 * @property {string} [translateDirection] - Direction for translate action ('UP', 'DOWN', 'LEFT', 'RIGHT').
 */

/**
 * Manages camera-related events and animations.
 * This module provides functionality to control camera movements like panning, zooming, and focusing
 * over a specified duration.
 */
export default {
  /**
   * Initializes a camera event.
   * @param {'pan'|'zoom'|'focus'|'translate'|'rotate'} cameraAction - The type of camera action to perform.
   * @param {CameraEventOptions} [options={}] - Configuration options for the camera action.
   */
  init: function (cameraAction, options = {}) {
    /** @type {import('../core/index.js').default} */
    this.engine = this.world.engine;
    /** @type {'pan'|'zoom'|'focus'|'translate'|'rotate'} */
    this.cameraAction = cameraAction;
    /** @type {CameraEventOptions} */
    this.options = options;
    /** @type {boolean} */
    this.completed = false;
    /** @type {number} */
    this.startTime = new Date().getTime();
    /** @type {number|null} */
    this.endTime = null;
  },

  /**
   * Updates the camera event state for each tick of the game loop.
   * @param {number} time - The current game time.
   * @returns {boolean} True if the camera action is completed, false otherwise.
   */
  tick: function (time) {
    if (!this.loaded) return; // Assuming 'loaded' is a property set elsewhere
    /** @type {Camera} */
    const camera = this.engine.renderManager.camera;

    // Calculate progress if a duration is specified
    let progress = 0;
    if (this.options.duration) {
      progress = (time - this.startTime) / (this.options.duration * 1000);
      if (progress >= 1.0) {
        progress = 1.0;
        this.completed = true;
      }
    }

    switch (this.cameraAction) {
      case 'pan':
        if (this.options.from && this.options.to) {
          const from = this.options.from;
          const to = this.options.to;
          // Interpolate camera target position
          const newTarget = lerp(from, to, progress);
          camera.setTarget(newTarget);
        }
        break;
      case 'zoom':
        if (typeof this.options.zoomDelta === 'number') {
          // Apply zoom incrementally or directly based on progress
          // For a smooth transition, we might want to calculate the target distance
          // and lerp towards it, rather than applying a delta each tick.
          // For simplicity, applying delta based on progress for now.
          const initialDistance = camera.cameraDistance; // Assuming initial distance is known or can be captured
          const targetDistance = initialDistance + this.options.zoomDelta;
          camera.cameraDistance = lerp(initialDistance, targetDistance, progress);
          camera.updateViewFromAngles();
        }
        break;
      case 'rotate':
        if (typeof this.options.yawDelta === 'number' || typeof this.options.pitchDelta === 'number') {
          // Apply rotation incrementally or directly based on progress
          const initialYaw = camera.yaw;
          const initialPitch = camera.pitch;
          const targetYaw = initialYaw + (this.options.yawDelta || 0);
          const targetPitch = initialPitch + (this.options.pitchDelta || 0);

          camera.yaw = lerp(initialYaw, targetYaw, progress);
          camera.pitch = lerp(initialPitch, targetPitch, progress);
          camera.updateViewFromAngles();
        }
        break;
      case 'translate':
        if (this.options.translateDirection) {
          // For continuous translation, this might be called repeatedly.
          if (!this.completed) { // Only translate while not completed
            camera.translateCam(this.options.translateDirection);
          }
        }
        break;
      case 'focus':
        // TODO: Implement focus logic (e.g., move camera target to a specific point)
        // needs to support top-down, iso, fps - todo - looks into binding as well.
        console.warn('Camera action "focus" not yet implemented.');
        break;
      default:
        break;
    }

    // If duration is set, mark as completed when time exceeds endTime
    if (this.options.duration && !this.endTime) {
      this.endTime = this.startTime + this.options.duration * 1000;
    }
    if (this.endTime && time > this.endTime) {
      this.completed = true;
    }

    return this.completed;
  },
};
