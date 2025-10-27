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
import { create, normalize, rotate, translate, set } from '../../utils/math/matrix4.js';
import { Vector, negate, degToRad } from '../../utils/math/vector.js';
import RenderManager from './manager.js';
import { subtractVectors } from '../../utils/math/matrix4.js';

/**
 * Camera - Manages camera position, orientation, and view matrix for 3D rendering.
 */
export class Camera {
  /**
   * Creates an instance of Camera.
   * @param {RenderManager} renderingManager - The rendering manager instance.
   */
  constructor(renderingManager) {
    // Add clamp method to Number prototype for easy use
    Number.prototype.clamp = function (min, max) {
      return this < min ? min : this > max ? max : this;
    };

    /** @type {RenderManager} */
    this.renderingManager = renderingManager;
    /** @type {Float32Array} */
    this.uViewMat = create();
    /** @type {number} */
    this.fov = 45;
    /** @type {Vector} */
    this.thetaLimits = new Vector(...[1.5 * Math.PI, 1.8 * Math.PI, 0]);
    /** @type {number} */
    this.cameraAngle = 45;
    /** @type {Vector} */
    this.cameraVector = new Vector(...[1, 0, 0]);
    /** @type {string} */
    this.cameraDir = 'N';
    // Position and orientation (use yaw/pitch/distance/target for intuitive controls)
    /** @type {Vector} */
    this.cameraPosition = new Vector(8, 8, -1);
    /** @type {number} */
    this.yaw = 0; // radians
    /** @type {number} */
    this.pitch = 0; // radians
    /** @type {number} */
    this.cameraDistance = 15.0; // distance from target
    /** @type {Vector} */
    this.cameraTarget = new Vector(8, 8, -1);
    /** @type {Vector} */
    this.cameraOffset = new Vector(0, 0, 0);
  }

  /**
   * Sets the camera target and updates the view.
   * @param {Vector} target The new camera target.
   */
  setTarget = (target) => {
    this.cameraTarget = target;
    this.updateViewFromAngles();
  };

  /**
   * Sets the camera position and angle to default values.
   */
  setCamera = () => {
    // Legacy behavior preserved for engine scenes: build view matrix from
    // cameraAngle/cameraVector and cameraOffset so existing scene code
    // that expects this transform continues to render.
    // Reset view matrix to identity before applying legacy transforms so
    // transforms do not accumulate across frames.
    set(create(), this.uViewMat);
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.x), [1, 0, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.y), [0, 1, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.z), [0, 0, 1]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  /**
   * Changes the camera angle.
   * @param {number} dTheta - The angle delta.
   */
  changeAngle = (dTheta) => {
    this.lookAt(this.cameraPosition.toArray(), this.cameraOffset.toArray(), dTheta);
  }

  /**
   * Manually positions the camera and makes it look at a target.
   * @param {number[]} pos - The camera position [x, y, z].
   * @param {number[]} target - The target position [x, y, z].
   * @param {number} up - The up vector or angle.
   */
  lookAt = (pos, target, up) => {
    // Compute forward (z) axis from pos -> target. If degenerate (pos==target)
    // fall back to a safe forward vector to avoid NaNs in the view matrix.
    let forwardArr = normalize(subtractVectors(pos, target));
    if (!Number.isFinite(forwardArr[0]) || !Number.isFinite(forwardArr[1]) || !Number.isFinite(forwardArr[2])) {
      forwardArr = [0, 0, 1];
    }
    let zAxis = new Vector(...forwardArr);
    // If forward is near-zero length, pick a default forward
    if (zAxis.length() === 0) zAxis = new Vector(0, 0, 1);
    let xAxis = up.cross(zAxis).normal();
    // If up is parallel to forward, cross product may be zero; choose another up
    if (xAxis.length() === 0) {
      xAxis = new Vector(1, 0, 0);
    }
    const yAxis = zAxis.cross(xAxis).normal();
    // Build matrix in same layout used elsewhere in engine
    const viewMatrix = [
      xAxis.x, xAxis.y, xAxis.z, 0,
      yAxis.x, yAxis.y, yAxis.z, 0,
      zAxis.x, zAxis.y, zAxis.z, 0,
      pos.x, pos.y, pos.z, 1,
    ];
    this.uViewMat = set(viewMatrix, this.uViewMat);
  }

  /**
   * Initializes camera position and angles from an existing view matrix.
   * @param {Float32Array} viewMat - The view matrix.
   */
  setFromViewMatrix = (viewMat) => {
    if (!viewMat) return;
    // position stored at indices 12,13,14 in our matrix layout
    try {
  this.cameraPosition = new Vector(viewMat[12], viewMat[13], viewMat[14]);
  // zAxis stored at indices 8,9,10 --- note zAxis = normalize(pos - target)
  const zx = viewMat[8];
  const zy = viewMat[9];
  const zz = viewMat[10];
  // forward vector is -zAxis
  const fx = -zx;
  const fy = -zy;
  const fz = -zz;
  // compute yaw and pitch from forward vector
  // For Z-up coordinate system we treat X/Y as horizontal plane and Z as up.
  // yaw is angle in XY plane, pitch is elevation around horizontal plane.
  this.yaw = Math.atan2(fy, fx);
  this.pitch = Math.asin(fz / Math.max(1e-6, Math.hypot(fx, fy, fz)));
  // attempt to compute distance and target: assume target is along forward from position
  const forwardLen = Math.hypot(fx, fy, fz);
  const approxForward = new Vector(fx / (forwardLen || 1), fy / (forwardLen || 1), fz / (forwardLen || 1));
  // pick a reasonable distance if not set
  this.cameraDistance = this.cameraDistance || 15.0;
  this.cameraTarget = this.cameraPosition.add(approxForward.mul(this.cameraDistance * -1));
    } catch (err) {
      // fallback: leave defaults
    }
  }

  /**
   * Updates the view matrix from camera position, yaw, and pitch.
   */
  updateViewFromAngles = () => {
  // Ensure camera parameters are finite and sane
  if (!Number.isFinite(this.yaw)) this.yaw = 0;
  if (!Number.isFinite(this.pitch)) this.pitch = 0;
  if (!Number.isFinite(this.cameraDistance) || this.cameraDistance <= 0) this.cameraDistance = Math.max(0.1, Math.abs(this.cameraDistance) || 15.0);
  // Compute camera world-space position (eye) from target + spherical coords
  // Z is up. yaw is angle around Z axis in XY plane. pitch is elevation.
  const ex = this.cameraTarget.x + this.cameraDistance * Math.cos(this.pitch) * Math.cos(this.yaw);
  const ey = this.cameraTarget.y + this.cameraDistance * Math.cos(this.pitch) * Math.sin(this.yaw);
  const ez = this.cameraTarget.z + this.cameraDistance * Math.sin(this.pitch);
  const pos = new Vector(ex, ey, ez);
  // update stored cameraPosition
  this.cameraPosition = new Vector(pos.x, pos.y, pos.z);
  const target = new Vector(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
  // world up (Z-up coordinate system)
  const up = new Vector(0, 0, 1);
  this.lookAt(pos, target, up);
  }

  /**
   * Translates the camera in the specified direction.
   * @param {string} direction - The direction: 'UP', 'LEFT', 'RIGHT', 'DOWN'.
   */
  translateCam = (direction) => {
    const speed = 0.5; // units per tick
    // Move the camera target in local camera plane (so camera orbits remain consistent)
  // forward points in the direction camera is facing (may have Z component)
  const forward = new Vector(Math.cos(this.pitch) * Math.cos(this.yaw), Math.cos(this.pitch) * Math.sin(this.yaw), Math.sin(this.pitch)).normal();
  // right vector is perpendicular in XY plane (no Z component) for strafing
  const right = new Vector(-Math.sin(this.yaw), Math.cos(this.yaw), 0).normal();
    switch (direction) {
      case 'UP': // forward
        this.cameraTarget = this.cameraTarget.add(forward.mul(speed));
        break;
      case 'DOWN': // backward
        this.cameraTarget = this.cameraTarget.add(forward.mul(-speed));
        break;
      case 'LEFT': // strafe left
        this.cameraTarget = this.cameraTarget.add(right.mul(-speed));
        break;
      case 'RIGHT': // strafe right
        this.cameraTarget = this.cameraTarget.add(right.mul(speed));
        break;
    }
    this.updateViewFromAngles();
  }

  /**
   * Rotates the camera in the specified direction.
   * @param {string} direction - The direction: 'LEFT', 'RIGHT', 'UP', 'DOWN'.
   */
  rotateCam = (direction) => {
    const speed = 0.05; // radians
    switch (direction) {
      case 'LEFT':
        this.yaw -= speed;
        break;
      case 'RIGHT':
        this.yaw += speed;
        break;
      case 'UP':
        this.pitch = Math.max(-Math.PI / 2 + 0.01, this.pitch - speed);
        break;
      case 'DOWN':
        this.pitch = Math.min(Math.PI / 2 - 0.01, this.pitch + speed);
        break;
    }
    this.updateViewFromAngles();
  }

  /**
   * Zooms the camera in/out (positive delta zooms in).
   * @param {number} delta - The zoom delta.
   */
  zoom = (delta) => {
    this.cameraDistance = Math.max(0.1, this.cameraDistance + delta);
    this.updateViewFromAngles();
  }

  /**
   * Pans the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pan.
   */
  panCW = (radians = Math.PI / 4) => {
    this.yaw -= radians;
    this.updateViewFromAngles();
  }

  /**
   * Pans the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pan.
   */
  panCCW = (radians = Math.PI / 4) => {
    this.yaw += radians;
    this.updateViewFromAngles();
  }

  /**
   * Pitches the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pitch.
   */
  pitchCW = (radians = Math.PI / 4) => {
    this.pitch -= radians;
    this.updateViewFromAngles();
  }

  /**
   * Pitches the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pitch.
   */
  pitchCCW = (radians = Math.PI / 4) => {
    this.pitch += radians;
    this.updateViewFromAngles();
  }

  /**
   * Tilts the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to tilt.
   */
  tiltCW = (radians = Math.PI / 4) => {
    // tilt around forward axis — modify pitch slightly
    this.pitch -= radians * 0.1;
    this.updateViewFromAngles();
  }

  /**
   * Tilts the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to tilt.
   */
  tiltCCW = (radians = Math.PI / 4) => {
    this.pitch += radians * 0.1;
    this.updateViewFromAngles();
  }
}

/**
 * CameraManager - Singleton factory for managing the camera instance.
 */
export default class CameraManager {
  /**
   * Creates an instance of CameraManager.
   * @param {RenderManager} renderingManager - The rendering manager instance.
   * @returns {CameraManager} The singleton instance.
   */
  constructor(renderingManager) {
    if (!CameraManager.instance) {
      /** @type {Camera} */
      this.camera = new Camera(renderingManager);
      CameraManager.instance = this;
    }
    return CameraManager.instance;
  }
}
