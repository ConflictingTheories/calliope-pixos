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

import { lerp, Vector } from '@Engine/utils/math/vector.js';
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
          // Interpolate cameraVector
          const newVector = lerp(from, to, progress, new Vector(0, 0, 0));
          camera.cameraVector.x = newVector.x;
          camera.cameraVector.y = newVector.y;
          camera.cameraVector.z = newVector.z;
          // Update cameraDir for sprite rendering
          camera.cameraDir = Direction.adjustCameraDirection(camera.cameraVector);
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
        if (
          typeof this.options.yawDelta === 'number' ||
          typeof this.options.pitchDelta === 'number'
        ) {
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
          if (!this.completed) {
            // Only translate while not completed
            camera.translateCam(this.options.translateDirection);
          }
        }
        break;
      case 'focus':
        // Focus camera on a target position with support for different camera modes
        // Options:
        //   - target: {x, y, z} or Vector - position to focus on
        //   - mode: 'top-down' | 'isometric' | 'fps' | 'orbital' (default)
        //   - distance: number - distance from target (for orbital/isometric/top-down)
        //   - yaw: number - yaw angle in radians (for orbital/isometric)
        //   - pitch: number - pitch angle in radians (for orbital)
        //   - bind: string - sprite ID to follow (enables binding mode)
        //   - instant: boolean - if true, snap to position without interpolation
        if (this.options.target) {
          const target = this.options.target;
          const targetVec = target.toArray
            ? target
            : new Vector(target.x || 0, target.y || 0, target.z || 0);
          const mode = this.options.mode || 'orbital';
          const distance = this.options.distance || camera.cameraDistance;
          const instant = this.options.instant || false;

          // Calculate target camera state based on mode
          let targetYaw, targetPitch;
          switch (mode) {
            case 'top-down':
              // Camera directly above looking down
              targetYaw = camera.yaw; // Keep current yaw
              targetPitch = Math.PI / 2 - 0.01; // Almost straight down
              break;
            case 'isometric':
              // Classic isometric angle (45° yaw, ~35° pitch)
              targetYaw = this.options.yaw !== undefined ? this.options.yaw : Math.PI / 4;
              targetPitch = this.options.pitch !== undefined ? this.options.pitch : Math.PI / 6;
              break;
            case 'fps':
              // First-person: camera at target position, looking forward
              // For FPS, we place camera AT the target with zero distance
              if (instant || progress >= 1.0) {
                camera.cameraTarget = targetVec;
                camera.cameraDistance = 0.1; // Very close for FPS view
                if (this.options.yaw !== undefined) camera.yaw = this.options.yaw;
                if (this.options.pitch !== undefined) camera.pitch = this.options.pitch;
                camera.updateViewFromAngles();
                this.completed = true;
              } else {
                // Interpolate to FPS position
                const startTarget = this.options._startTarget || camera.cameraTarget;
                if (!this.options._startTarget) this.options._startTarget = camera.cameraTarget;

                camera.cameraTarget = new Vector(
                  lerp(startTarget.x, targetVec.x, progress),
                  lerp(startTarget.y, targetVec.y, progress),
                  lerp(startTarget.z, targetVec.z, progress)
                );
                camera.cameraDistance = lerp(camera.cameraDistance, 0.1, progress);
                camera.updateViewFromAngles();
              }
              break;
            case 'orbital':
            default:
              // Orbital camera around target
              targetYaw = this.options.yaw !== undefined ? this.options.yaw : camera.yaw;
              targetPitch = this.options.pitch !== undefined ? this.options.pitch : camera.pitch;
              break;
          }

          // Handle non-FPS modes with interpolation
          if (mode !== 'fps') {
            if (instant || progress >= 1.0) {
              camera.cameraTarget = targetVec;
              camera.cameraDistance = distance;
              if (targetYaw !== undefined) camera.yaw = targetYaw;
              if (targetPitch !== undefined) camera.pitch = targetPitch;
              camera.updateViewFromAngles();
              this.completed = true;
            } else {
              // Interpolate camera state
              const startTarget = this.options._startTarget || camera.cameraTarget;
              const startDistance =
                this.options._startDistance !== undefined
                  ? this.options._startDistance
                  : camera.cameraDistance;
              const startYaw =
                this.options._startYaw !== undefined ? this.options._startYaw : camera.yaw;
              const startPitch =
                this.options._startPitch !== undefined ? this.options._startPitch : camera.pitch;

              // Store start values on first tick
              if (!this.options._startTarget) {
                this.options._startTarget = camera.cameraTarget;
                this.options._startDistance = camera.cameraDistance;
                this.options._startYaw = camera.yaw;
                this.options._startPitch = camera.pitch;
              }

              camera.cameraTarget = new Vector(
                lerp(startTarget.x, targetVec.x, progress),
                lerp(startTarget.y, targetVec.y, progress),
                lerp(startTarget.z, targetVec.z, progress)
              );
              camera.cameraDistance = lerp(startDistance, distance, progress);
              if (targetYaw !== undefined) camera.yaw = lerp(startYaw, targetYaw, progress);
              if (targetPitch !== undefined) camera.pitch = lerp(startPitch, targetPitch, progress);
              camera.updateViewFromAngles();
            }
          }

          // Handle sprite binding for follow mode
          if (this.options.bind) {
            const zone = this.engine.spritz?.world?.currentZone;
            const sprite = zone?.sprites?.[this.options.bind];
            if (sprite) {
              camera.cameraTarget = new Vector(sprite.pos.x, sprite.pos.y, sprite.pos.z || 0);
              camera.updateViewFromAngles();
            }
          }
        } else {
          console.warn('Camera action "focus" requires a target position in options.');
          this.completed = true;
        }
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
