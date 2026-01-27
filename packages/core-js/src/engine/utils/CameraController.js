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
 * CameraController - A unified camera control system for both engine and editor
 *
 * Supports:
 * - Spherical coordinate controls (yaw/pitch/distance)
 * - Both Y-up and Z-up coordinate systems
 * - Mouse drag rotation
 * - Mouse wheel zoom
 * - Keyboard WASD/Arrow movement
 * - Touch gesture support
 * - View matrix generation
 *
 * @example
 * // For editor (Y-up):
 * const controller = new CameraController({ upAxis: 'y' });
 *
 * // For engine (Z-up):
 * const controller = new CameraController({ upAxis: 'z' });
 *
 * // Handle input
 * canvas.addEventListener('mousedown', e => controller.onMouseDown(e));
 * canvas.addEventListener('mousemove', e => controller.onMouseMove(e));
 * canvas.addEventListener('mouseup', e => controller.onMouseUp(e));
 * canvas.addEventListener('wheel', e => controller.onWheel(e));
 *
 * // Get view matrix for rendering
 * const viewMatrix = controller.getViewMatrix();
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
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  length: v => Math.hypot(v[0], v[1], v[2]),
  normalize: (v, out = [0, 0, 0]) => {
    const len = vec3.length(v);
    if (len === 0) return out;
    out[0] = v[0] / len;
    out[1] = v[1] / len;
    out[2] = v[2] / len;
    return out;
  },
  add: (a, b, out = [0, 0, 0]) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  },
  scale: (v, s, out = [0, 0, 0]) => {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  },
};

/**
 * Camera configuration options
 * @typedef {Object} CameraConfig
 * @property {'y'|'z'} [upAxis='z'] - The up axis ('y' for Y-up, 'z' for Z-up)
 * @property {number} [yaw=0] - Initial yaw in radians
 * @property {number} [pitch=0] - Initial pitch in radians
 * @property {number} [distance=10] - Initial distance from target
 * @property {number[]} [target=[0,0,0]] - Initial target position
 * @property {number} [rotationSpeed=0.005] - Mouse rotation sensitivity
 * @property {number} [zoomSpeed=0.1] - Scroll wheel zoom sensitivity
 * @property {number} [panSpeed=0.5] - Keyboard pan speed
 * @property {number} [minDistance=0.1] - Minimum zoom distance
 * @property {number} [maxDistance=1000] - Maximum zoom distance
 * @property {number} [minPitch=-Math.PI/2+0.01] - Minimum pitch (avoid gimbal lock)
 * @property {number} [maxPitch=Math.PI/2-0.01] - Maximum pitch (avoid gimbal lock)
 */

/**
 * Unified camera controller class
 */
export default class CameraController {
  /**
   * @param {CameraConfig} [config={}] Configuration options
   */
  constructor(config = {}) {
    // Coordinate system
    this.upAxis = config.upAxis || 'z';

    // Spherical coordinates
    this.yaw = config.yaw ?? 0;
    this.pitch = config.pitch ?? 0;
    this.distance = config.distance ?? 10;

    // Target position
    this.target = config.target ? [...config.target] : [0, 0, 0];

    // Computed position
    this.position = [0, 0, 0];

    // Control sensitivities
    this.rotationSpeed = config.rotationSpeed ?? 0.005;
    this.zoomSpeed = config.zoomSpeed ?? 0.1;
    this.panSpeed = config.panSpeed ?? 0.5;

    // Limits
    this.minDistance = config.minDistance ?? 0.1;
    this.maxDistance = config.maxDistance ?? 1000;
    this.minPitch = config.minPitch ?? -Math.PI / 2 + 0.01;
    this.maxPitch = config.maxPitch ?? Math.PI / 2 - 0.01;

    // Drag state
    this._dragging = false;
    this._lastMouse = { x: 0, y: 0 };

    // Touch state
    this._lastTouch = null;
    this._lastPinchDist = null;

    // Cached view matrix
    this._viewMatrix = new Float32Array(16);
    this._dirty = true;

    // Update position
    this._updatePosition();
  }

  /**
   * Update camera position from spherical coordinates
   * @private
   */
  _updatePosition() {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    if (this.upAxis === 'y') {
      // Y-up coordinate system (common in WebGL editors)
      this.position[0] = this.target[0] + this.distance * sinYaw * cosPitch;
      this.position[1] = this.target[1] + this.distance * sinPitch;
      this.position[2] = this.target[2] + this.distance * cosYaw * cosPitch;
    } else {
      // Z-up coordinate system (engine default)
      this.position[0] = this.target[0] + this.distance * cosPitch * cosYaw;
      this.position[1] = this.target[1] + this.distance * cosPitch * sinYaw;
      this.position[2] = this.target[2] + this.distance * sinPitch;
    }

    this._dirty = true;
  }

  /**
   * Clamp pitch to avoid gimbal lock
   * @private
   */
  _clampPitch() {
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  /**
   * Clamp distance to limits
   * @private
   */
  _clampDistance() {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
  }

  /**
   * Set camera target and update view
   * @param {number[]} target - [x, y, z] target position
   */
  setTarget(target) {
    this.target = [...target];
    this._updatePosition();
  }

  /**
   * Rotate camera by delta angles
   * @param {number} dYaw - Yaw delta in radians
   * @param {number} dPitch - Pitch delta in radians
   */
  rotate(dYaw, dPitch) {
    this.yaw += dYaw;
    this.pitch += dPitch;
    this._clampPitch();
    this._updatePosition();
  }

  /**
   * Zoom camera by delta distance
   * @param {number} delta - Distance delta (positive = zoom out)
   */
  zoom(delta) {
    this.distance += delta;
    this._clampDistance();
    this._updatePosition();
  }

  /**
   * Pan camera (move target in camera-local space)
   * @param {string} direction - 'UP', 'DOWN', 'LEFT', 'RIGHT'
   */
  pan(direction) {
    const speed = this.panSpeed;

    // Calculate forward and right vectors based on yaw
    let forward, right;

    if (this.upAxis === 'y') {
      // Y-up: forward is in XZ plane
      forward = [Math.sin(this.yaw), 0, Math.cos(this.yaw)];
      right = [Math.cos(this.yaw), 0, -Math.sin(this.yaw)];
    } else {
      // Z-up: forward is in XY plane
      forward = [Math.cos(this.yaw), Math.sin(this.yaw), 0];
      right = [-Math.sin(this.yaw), Math.cos(this.yaw), 0];
    }

    switch (direction) {
      case 'UP':
        this.target = vec3.add(this.target, vec3.scale(forward, speed));
        break;
      case 'DOWN':
        this.target = vec3.add(this.target, vec3.scale(forward, -speed));
        break;
      case 'LEFT':
        this.target = vec3.add(this.target, vec3.scale(right, -speed));
        break;
      case 'RIGHT':
        this.target = vec3.add(this.target, vec3.scale(right, speed));
        break;
    }

    this._updatePosition();
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} event
   */
  onMouseDown(event) {
    event.preventDefault();
    this._dragging = true;
    this._lastMouse = { x: event.clientX, y: event.clientY };
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event
   */
  onMouseMove(event) {
    if (!this._dragging) return;

    const dx = event.clientX - this._lastMouse.x;
    const dy = event.clientY - this._lastMouse.y;
    this._lastMouse = { x: event.clientX, y: event.clientY };

    this.rotate(-dx * this.rotationSpeed, -dy * this.rotationSpeed);
  }

  /**
   * Handle mouse up event
   * @param {MouseEvent} event
   */
  onMouseUp(event) {
    this._dragging = false;
  }

  /**
   * Handle mouse leave event
   * @param {MouseEvent} event
   */
  onMouseLeave(event) {
    this._dragging = false;
  }

  /**
   * Handle wheel event (zoom)
   * @param {WheelEvent} event
   */
  onWheel(event) {
    event.preventDefault();
    const delta =
      event.deltaY > 0 ? this.distance * this.zoomSpeed : -this.distance * this.zoomSpeed;
    this.zoom(delta);
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} event
   */
  onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
      this._lastTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.touches.length === 2) {
      // Pinch zoom start
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this._lastPinchDist = Math.hypot(dx, dy);
    }
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} event
   */
  onTouchMove(event) {
    event.preventDefault();

    if (event.touches.length === 1 && this._lastTouch) {
      // Single touch rotation
      const dx = event.touches[0].clientX - this._lastTouch.x;
      const dy = event.touches[0].clientY - this._lastTouch.y;
      this._lastTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      this.rotate(-dx * this.rotationSpeed, -dy * this.rotationSpeed);
    } else if (event.touches.length === 2 && this._lastPinchDist !== null) {
      // Pinch zoom
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (this._lastPinchDist - dist) * this.zoomSpeed * 0.1;
      this.zoom(delta);
      this._lastPinchDist = dist;
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} event
   */
  onTouchEnd(event) {
    this._lastTouch = null;
    this._lastPinchDist = null;
  }

  /**
   * Build a lookAt view matrix
   * @returns {Float32Array} 4x4 view matrix
   */
  getViewMatrix() {
    if (!this._dirty) return this._viewMatrix;

    const eye = this.position;
    const center = this.target;

    // Get up vector based on coordinate system
    const upVec = this.upAxis === 'y' ? [0, 1, 0] : [0, 0, 1];

    // Compute forward axis (normalized)
    const f = vec3.normalize(vec3.sub(center, eye));

    // Handle degenerate case
    if (!Number.isFinite(f[0]) || vec3.length(f) === 0) {
      f[0] = 0;
      f[1] = 0;
      f[2] = -1;
    }

    // Compute right axis (cross of up and forward)
    const s = vec3.normalize(vec3.cross(upVec, f));
    if (vec3.length(s) === 0) {
      s[0] = 1;
      s[1] = 0;
      s[2] = 0;
    }

    // Compute true up axis (cross of forward and right)
    const u = vec3.cross(f, s);

    // Build view matrix (column-major for WebGL)
    const out = this._viewMatrix;
    out[0] = s[0];
    out[1] = u[0];
    out[2] = -f[0];
    out[3] = 0;
    out[4] = s[1];
    out[5] = u[1];
    out[6] = -f[1];
    out[7] = 0;
    out[8] = s[2];
    out[9] = u[2];
    out[10] = -f[2];
    out[11] = 0;
    out[12] = -vec3.dot(s, eye);
    out[13] = -vec3.dot(u, eye);
    out[14] = vec3.dot(f, eye);
    out[15] = 1;

    this._dirty = false;
    return this._viewMatrix;
  }

  /**
   * Get current camera state for serialization
   * @returns {Object} Camera state
   */
  getState() {
    return {
      yaw: this.yaw,
      pitch: this.pitch,
      distance: this.distance,
      target: [...this.target],
      position: [...this.position],
    };
  }

  /**
   * Restore camera state from serialized data
   * @param {Object} state - Camera state object
   */
  setState(state) {
    if (state.yaw !== undefined) this.yaw = state.yaw;
    if (state.pitch !== undefined) this.pitch = state.pitch;
    if (state.distance !== undefined) this.distance = state.distance;
    if (state.target) this.target = [...state.target];
    this._clampPitch();
    this._clampDistance();
    this._updatePosition();
  }

  /**
   * Get 8-directional facing string based on yaw
   * @returns {string} Direction string ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')
   */
  getDirection() {
    // Convert yaw to degrees
    let yawDeg = ((this.yaw * 180) / Math.PI) % 360;
    if (yawDeg < 0) yawDeg += 360;

    // Map to 8 directions
    // For Z-up: 0° = East (+X), 90° = North (+Y)
    // Adjust so 0° maps to North for sprite rendering
    let adjustedYaw = (90 - yawDeg + 360) % 360;
    let octant = Math.round(adjustedYaw / 45) % 8;

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[octant];
  }

  /**
   * Attach event listeners to an element
   * @param {HTMLElement} element - Element to attach listeners to
   * @returns {Function} Cleanup function to remove listeners
   */
  attach(element) {
    const onMouseDown = e => this.onMouseDown(e);
    const onMouseMove = e => this.onMouseMove(e);
    const onMouseUp = e => this.onMouseUp(e);
    const onMouseLeave = e => this.onMouseLeave(e);
    const onWheel = e => this.onWheel(e);
    const onTouchStart = e => this.onTouchStart(e);
    const onTouchMove = e => this.onTouchMove(e);
    const onTouchEnd = e => this.onTouchEnd(e);

    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseLeave);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd);

    // Return cleanup function
    return () => {
      element.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('mouseleave', onMouseLeave);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }
}

// Export vec3 utilities for external use
export { vec3 };
