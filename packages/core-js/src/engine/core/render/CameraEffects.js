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
 * CameraEffects - Visual effects system for the camera.
 * Includes screen shake, smooth follow, and other camera-based effects.
 */

import { Vector } from '../../utils/math/vector.js';

/**
 * Easing functions for smooth animations
 */
const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutElastic: t => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
  easeOutBounce: t => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

/**
 * CameraEffects - Manages camera visual effects
 */
export default class CameraEffects {
  /**
   * @param {Object} camera - Reference to the Camera instance
   */
  constructor(camera) {
    this.camera = camera;

    // Screen shake state
    this.shake = {
      active: false,
      intensity: 0,
      decay: 0.9,
      duration: 0,
      elapsed: 0,
      offset: new Vector(0, 0, 0),
      type: 'random', // 'random', 'horizontal', 'vertical', 'rotational'
      frequency: 1,
    };

    // Smooth follow state
    this.follow = {
      active: false,
      target: null,
      offset: new Vector(0, 0, 0),
      smoothness: 0.1, // 0-1, lower = smoother
      deadzone: new Vector(0, 0, 0),
      bounds: null, // { min: Vector, max: Vector }
    };

    // Zoom effect state
    this.zoom = {
      active: false,
      targetZoom: 1,
      currentZoom: 1,
      speed: 0.1,
    };

    // Flash effect state
    this.flash = {
      active: false,
      color: [1, 1, 1, 1],
      duration: 0,
      elapsed: 0,
    };

    // Fade effect state
    this.fade = {
      active: false,
      color: [0, 0, 0, 1],
      targetAlpha: 0,
      currentAlpha: 0,
      duration: 0,
      elapsed: 0,
      easing: 'easeInOutQuad',
      onComplete: null,
    };

    // Punch effect (quick offset then return)
    this.punch = {
      active: false,
      direction: new Vector(0, 0, 0),
      intensity: 0,
      duration: 0,
      elapsed: 0,
    };
  }

  /**
   * Update all active effects (call once per frame)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    this._updateShake(deltaTime);
    this._updateFollow(deltaTime);
    this._updateZoom(deltaTime);
    this._updateFlash(deltaTime);
    this._updateFade(deltaTime);
    this._updatePunch(deltaTime);
  }

  // ===================== SCREEN SHAKE =====================

  /**
   * Start a screen shake effect
   * @param {Object} options - Shake configuration
   * @param {number} options.intensity - Shake intensity (pixels/units)
   * @param {number} options.duration - Duration in seconds
   * @param {number} [options.decay=0.9] - Decay rate per frame (0-1)
   * @param {string} [options.type='random'] - Shake type
   * @param {number} [options.frequency=1] - Shake frequency multiplier
   */
  startShake(options) {
    this.shake.active = true;
    this.shake.intensity = options.intensity || 1;
    this.shake.duration = options.duration || 0.5;
    this.shake.elapsed = 0;
    this.shake.decay = options.decay ?? 0.9;
    this.shake.type = options.type || 'random';
    this.shake.frequency = options.frequency || 1;
  }

  /**
   * Stop the current screen shake
   */
  stopShake() {
    this.shake.active = false;
    this.shake.offset = new Vector(0, 0, 0);
  }

  /**
   * Get current shake offset (apply to camera position)
   * @returns {Vector}
   */
  getShakeOffset() {
    return this.shake.offset;
  }

  _updateShake(deltaTime) {
    if (!this.shake.active) return;

    this.shake.elapsed += deltaTime;

    if (this.shake.elapsed >= this.shake.duration) {
      this.stopShake();
      return;
    }

    // Calculate current intensity with decay
    const progress = this.shake.elapsed / this.shake.duration;
    const currentIntensity = this.shake.intensity * (1 - progress) * this.shake.decay;

    // Generate shake offset based on type
    const time = this.shake.elapsed * this.shake.frequency * 10;

    switch (this.shake.type) {
      case 'horizontal':
        this.shake.offset = new Vector((Math.sin(time) * 2 - 1) * currentIntensity, 0, 0);
        break;
      case 'vertical':
        this.shake.offset = new Vector(0, (Math.sin(time) * 2 - 1) * currentIntensity, 0);
        break;
      case 'rotational':
        // Apply rotation shake (stored as z offset for now)
        this.shake.offset = new Vector(0, 0, (Math.sin(time) * 2 - 1) * currentIntensity * 0.1);
        break;
      case 'random':
      default:
        this.shake.offset = new Vector(
          (Math.random() * 2 - 1) * currentIntensity,
          (Math.random() * 2 - 1) * currentIntensity,
          0
        );
        break;
    }
  }

  // ===================== SMOOTH FOLLOW =====================

  /**
   * Start smooth camera follow
   * @param {Object} target - Object to follow (must have position property)
   * @param {Object} options - Follow configuration
   * @param {Vector} [options.offset] - Offset from target
   * @param {number} [options.smoothness=0.1] - Follow smoothness (0-1)
   * @param {Vector} [options.deadzone] - Deadzone before camera moves
   * @param {{min: Vector, max: Vector}} [options.bounds] - Camera bounds
   */
  startFollow(target, options = {}) {
    this.follow.active = true;
    this.follow.target = target;
    this.follow.offset = options.offset || new Vector(0, 0, 0);
    this.follow.smoothness = options.smoothness ?? 0.1;
    this.follow.deadzone = options.deadzone || new Vector(0, 0, 0);
    this.follow.bounds = options.bounds || null;
  }

  /**
   * Stop following
   */
  stopFollow() {
    this.follow.active = false;
    this.follow.target = null;
  }

  /**
   * Get the target position for smooth follow
   * @returns {Vector|null}
   */
  getFollowTarget() {
    if (!this.follow.active || !this.follow.target) return null;

    const targetPos = this.follow.target.position || this.follow.target;
    return targetPos.add
      ? targetPos.add(this.follow.offset)
      : new Vector(
          targetPos.x + this.follow.offset.x,
          targetPos.y + this.follow.offset.y,
          targetPos.z + this.follow.offset.z
        );
  }

  _updateFollow(deltaTime) {
    if (!this.follow.active || !this.follow.target) return;

    const targetPos = this.getFollowTarget();
    if (!targetPos) return;

    const currentPos = this.camera.cameraTarget || this.camera.cameraPosition;

    // Calculate difference
    let dx = targetPos.x - currentPos.x;
    let dy = targetPos.y - currentPos.y;
    let dz = targetPos.z - currentPos.z;

    // Apply deadzone
    if (Math.abs(dx) < this.follow.deadzone.x) dx = 0;
    if (Math.abs(dy) < this.follow.deadzone.y) dy = 0;
    if (Math.abs(dz) < this.follow.deadzone.z) dz = 0;

    // Smooth interpolation
    const smoothFactor = 1 - Math.pow(1 - this.follow.smoothness, deltaTime * 60);

    let newX = currentPos.x + dx * smoothFactor;
    let newY = currentPos.y + dy * smoothFactor;
    let newZ = currentPos.z + dz * smoothFactor;

    // Apply bounds
    if (this.follow.bounds) {
      newX = Math.max(this.follow.bounds.min.x, Math.min(this.follow.bounds.max.x, newX));
      newY = Math.max(this.follow.bounds.min.y, Math.min(this.follow.bounds.max.y, newY));
      newZ = Math.max(this.follow.bounds.min.z, Math.min(this.follow.bounds.max.z, newZ));
    }

    // Update camera target
    if (this.camera.setTarget) {
      this.camera.setTarget(new Vector(newX, newY, newZ));
    } else {
      this.camera.cameraTarget = new Vector(newX, newY, newZ);
    }
  }

  // ===================== ZOOM EFFECT =====================

  /**
   * Smoothly zoom to a target level
   * @param {number} targetZoom - Target zoom level
   * @param {number} [speed=0.1] - Zoom speed
   */
  zoomTo(targetZoom, speed = 0.1) {
    this.zoom.active = true;
    this.zoom.targetZoom = targetZoom;
    this.zoom.speed = speed;
  }

  _updateZoom(deltaTime) {
    if (!this.zoom.active) return;

    const diff = this.zoom.targetZoom - this.zoom.currentZoom;
    if (Math.abs(diff) < 0.001) {
      this.zoom.currentZoom = this.zoom.targetZoom;
      this.zoom.active = false;
      return;
    }

    this.zoom.currentZoom += diff * this.zoom.speed * deltaTime * 60;

    // Apply zoom to camera
    if (this.camera.zoom) {
      this.camera.cameraDistance = 15 / this.zoom.currentZoom;
      this.camera.updateViewFromAngles?.();
    }
  }

  // ===================== FLASH EFFECT =====================

  /**
   * Flash the screen with a color
   * @param {Object} options - Flash configuration
   * @param {number[]} [options.color=[1,1,1,1]] - RGBA color
   * @param {number} [options.duration=0.1] - Duration in seconds
   */
  flash(options = {}) {
    this.flash.active = true;
    this.flash.color = options.color || [1, 1, 1, 1];
    this.flash.duration = options.duration || 0.1;
    this.flash.elapsed = 0;
  }

  /**
   * Get flash overlay color (apply as post-process)
   * @returns {number[]|null} RGBA color or null if not flashing
   */
  getFlashColor() {
    if (!this.flash.active) return null;

    const progress = this.flash.elapsed / this.flash.duration;
    const alpha = this.flash.color[3] * (1 - progress);
    return [this.flash.color[0], this.flash.color[1], this.flash.color[2], alpha];
  }

  _updateFlash(deltaTime) {
    if (!this.flash.active) return;

    this.flash.elapsed += deltaTime;
    if (this.flash.elapsed >= this.flash.duration) {
      this.flash.active = false;
    }
  }

  // ===================== FADE EFFECT =====================

  /**
   * Fade the screen to/from a color
   * @param {Object} options - Fade configuration
   * @param {number} options.targetAlpha - Target alpha (0 = transparent, 1 = opaque)
   * @param {number} [options.duration=1] - Duration in seconds
   * @param {number[]} [options.color=[0,0,0,1]] - RGB color
   * @param {string} [options.easing='easeInOutQuad'] - Easing function
   * @param {Function} [options.onComplete] - Callback when complete
   */
  fadeTo(options) {
    this.fade.active = true;
    this.fade.targetAlpha = options.targetAlpha;
    this.fade.duration = options.duration || 1;
    this.fade.elapsed = 0;
    this.fade.color = options.color || [0, 0, 0, 1];
    this.fade.easing = options.easing || 'easeInOutQuad';
    this.fade.onComplete = options.onComplete || null;
    this.fade.startAlpha = this.fade.currentAlpha;
  }

  /**
   * Convenience method for fade to black
   */
  fadeToBlack(duration = 1, onComplete = null) {
    this.fadeTo({ targetAlpha: 1, duration, color: [0, 0, 0, 1], onComplete });
  }

  /**
   * Convenience method for fade from black
   */
  fadeFromBlack(duration = 1, onComplete = null) {
    this.fade.currentAlpha = 1;
    this.fadeTo({ targetAlpha: 0, duration, color: [0, 0, 0, 1], onComplete });
  }

  /**
   * Get fade overlay color
   * @returns {number[]|null}
   */
  getFadeColor() {
    if (this.fade.currentAlpha <= 0) return null;
    return [this.fade.color[0], this.fade.color[1], this.fade.color[2], this.fade.currentAlpha];
  }

  _updateFade(deltaTime) {
    if (!this.fade.active) return;

    this.fade.elapsed += deltaTime;

    if (this.fade.elapsed >= this.fade.duration) {
      this.fade.currentAlpha = this.fade.targetAlpha;
      this.fade.active = false;
      if (this.fade.onComplete) {
        this.fade.onComplete();
      }
      return;
    }

    const progress = this.fade.elapsed / this.fade.duration;
    const easingFn = Easing[this.fade.easing] || Easing.linear;
    const easedProgress = easingFn(progress);

    const startAlpha = this.fade.startAlpha ?? 0;
    this.fade.currentAlpha = startAlpha + (this.fade.targetAlpha - startAlpha) * easedProgress;
  }

  // ===================== PUNCH EFFECT =====================

  /**
   * Quick punch effect (offset then return)
   * @param {Vector} direction - Punch direction
   * @param {number} intensity - Punch intensity
   * @param {number} duration - Duration in seconds
   */
  punch(direction, intensity = 1, duration = 0.2) {
    this.punch.active = true;
    this.punch.direction = direction.normal ? direction.normal() : direction;
    this.punch.intensity = intensity;
    this.punch.duration = duration;
    this.punch.elapsed = 0;
  }

  /**
   * Get punch offset (apply to camera position)
   * @returns {Vector}
   */
  getPunchOffset() {
    if (!this.punch.active) return new Vector(0, 0, 0);

    const progress = this.punch.elapsed / this.punch.duration;
    const easedProgress = Easing.easeOutElastic(progress);
    const currentIntensity = this.punch.intensity * (1 - easedProgress);

    return new Vector(
      this.punch.direction.x * currentIntensity,
      this.punch.direction.y * currentIntensity,
      this.punch.direction.z * currentIntensity
    );
  }

  _updatePunch(deltaTime) {
    if (!this.punch.active) return;

    this.punch.elapsed += deltaTime;
    if (this.punch.elapsed >= this.punch.duration) {
      this.punch.active = false;
    }
  }

  // ===================== COMBINED OFFSET =====================

  /**
   * Get combined camera offset from all effects
   * @returns {Vector}
   */
  getTotalOffset() {
    const shake = this.getShakeOffset();
    const punch = this.getPunchOffset();

    return new Vector(shake.x + punch.x, shake.y + punch.y, shake.z + punch.z);
  }
}

export { Easing };
