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
import { create, normalize, rotate, translate, set } from '@Engine/utils/math/matrix4.jsx';
import { Vector, negate, degToRad } from '@Engine/utils/math/vector.jsx';
import RenderManager from './manager.jsx';
import { subtractVectors } from '../../utils/math/matrix4.jsx';

export class Camera {
  /**
   * @param {RenderManager} renderingManager
   */
  constructor(renderingManager) {
    // Add clamp method to Number prototype for easy use
    Number.prototype.clamp = function (min, max) {
      return this < min ? min : this > max ? max : this;
    };

    this.renderingManager = renderingManager;
    this.uViewMat = create();
    this.fov = 45;
    this.thetaLimits = new Vector(...[1.5 * Math.PI, 1.8 * Math.PI, 0]);
    this.cameraAngle = 45;
    this.cameraVector = new Vector(...[1, 0, 0]);
    this.cameraDir = 'N';
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);

    // Bind methods for better performance and clarity in usage
    this.setCamera = this.setCamera.bind(this);
    this.lookAt = this.lookAt.bind(this);
    this.panCCW = this.panCCW.bind(this);
    this.panCW = this.panCW.bind(this);
    this.tiltCCW = this.tiltCCW.bind(this);
    this.tiltCW = this.tiltCW.bind(this);
    this.pitchCCW = this.pitchCCW.bind(this);
    this.pitchCW = this.pitchCW.bind(this);
    this.changeAngle = this.changeAngle.bind(this);
  }

  /** Set Camera Pos & Angle to default */
  setCamera() {
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.x), [1, 0, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.y), [0, 1, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.z), [0, 0, 1]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  /** Change Camera Angle */
  changeAngle(dTheta) {
    this.lookAt(this.cameraPosition.toArray(), this.cameraOffset.toArray(), dTheta);
  }

  /** Manually Position Camera and look at target */
  lookAt(pos, target, up) {
    const zAxis = new Vector(...normalize(subtractVectors(pos, target)));
    const xAxis = up.cross(zAxis);
    const yAxis = zAxis.cross(xAxis);
    const viewMatrix = [
      ...[xAxis.x, xAxis.y, xAxis.z, 0],
      ...[yAxis.x, yAxis.y, yAxis.z, 0],
      ...[zAxis.x, zAxis.y, zAxis.z, 0],
      ...[pos.x, pos.y, pos.z, 1],
    ];

    this.uViewMat = set(viewMatrix, this.uViewMat);
  }

  /**
   * Translate camera
   * @param {*} direction - UP, LEFT, RIGHT, DOWN
   */
  translateCam(direction) {
    const speed = 0.1; // Adjust sensitivity as needed
    switch (direction) {
      case 'UP':
        translate(this.uViewMat, this.uViewMat, [speed * Math.sin(degToRad(this.cameraAngle)), 0, -speed * Math.cos(degToRad(this.cameraAngle))]);
        break;
      case 'LEFT':
        translate(this.uViewMat, this.uViewMat, [-speed * Math.sin(degToRad(this.cameraAngle)), 0, speed * Math.cos(degToRad(this.cameraAngle))]);
        break;
      case 'DOWN':
        translate(this.uViewMat, this.uViewMat, [-speed * Math.sin(degToRad(this.cameraAngle)), 0, -speed * Math.cos(degToRad(this.cameraAngle))]);
        break;
      case 'RIGHT':
        translate(this.uViewMat, this.uViewMat, [speed * Math.sin(degToRad(this.cameraAngle)), 0, -speed * Math.cos(degToRad(this.cameraAngle))]);
        break;
      // Arrow key controls for rotation (assuming you implement these methods as well)
    }
  }

  /**
   * Rotate Camera
   * @param {*} direction 
   */
  rotateCam(direction) {
    const speed = 0.1; // Adjust sensitivity as needed
    switch (direction) {
      case 'LEFT':
        this.tiltCCW(rotationSpeed);
        break;
      case 'RIGHT':
        this.tiltCW(rotationSpeed);
        break;
      case 'UP':
        this.pitchCW(rotationSpeed);
        break;
      case 'DOWN':
        this.pitchCCW(rotationSpeed);
        break;
    }
  }

  /** Pan Camera Clockwise */
  panCW(radians = Math.PI / 4) {
    this.cameraVector.z -= Math.cos(radians);
  }

  /** Pan Camera Counter Clockwise */
  panCCW(radians = Math.PI / 4) {
    this.cameraVector.z += Math.cos(radians);
  }

  /** Pitch Camera Counter Clockwise */
  pitchCW(radians = Math.PI / 4) {
    this.cameraVector.x -= Math.cos(radians);
  }

  /** Pitch Camera Counter Clockwise */
  pitchCCW(radians = Math.PI / 4) {
    this.cameraVector.x += Math.sin(radians);
  }

  /** Tilt Camera Counter Clockwise */
  tiltCW(radians = Math.PI / 4) {
    this.cameraVector.y -= Math.cos(radians);
  }

  /** Tilt Camera Counter Clockwise */
  tiltCCW(radians = Math.PI / 4) {
    this.cameraVector.z += Math.sin(radians);
  }
}

// Singleton Factory for Camera Manager
export default class CameraManager {
  constructor(renderingManager) {
    if (!CameraManager.instance) {
      this.camera = new Camera(renderingManager);
      CameraManager.instance = this;
    }
    return CameraManager.instance;
  }
}
