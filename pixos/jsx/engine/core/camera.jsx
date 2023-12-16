/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { normalize, rotate, translate, set } from '@Engine/utils/math/matrix4.jsx';
import { Vector, negate, degToRad } from '@Engine/utils/math/vector.jsx';
import RenderManager from './render.jsx';

export default class Camera {
  /**
   *
   * @param {RenderManager} renderingManager
   */
  constructor(renderingManager) {
    this.renderingManager = renderingManager;
    this.uViewMat = renderingManager.uViewMat;
    this.fov = 45;
    this.cameraAngle = 45;
    this.cameraVector = new Vector(...[1, 0, 0]);
    this.cameraDir = 'N';
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.lookAt = this.lookAt.bind(this);
    this.panCCW = this.panCCW.bind(this);
    this.panCW = this.panCW.bind(this);
    this.tiltCCW = this.tiltCCW.bind(this);
    this.tiltCW = this.tiltCW.bind(this);
    this.pitchCCW = this.pitchCCW.bind(this);
    this.pitchCW = this.pitchCW.bind(this);
  }

  /**
   * Set Camera Pos & Angle to default
   */
  setCamera() {
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.x), [1, 0, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.y), [0, 1, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.z), [0, 0, 1]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  /** Manually Position Camera and look at target
   *
   * @param {vec3} pos
   * @param {vec3} target
   * @param {vec3} up
   */
  lookAt(pos, target, up) {
    const { uViewMat } = this;
    // set camera properties
    this.cameraPosition = new Vector(...pos);
    this.cameraOffset = new Vector(...target);
    this.cameraVector = new Vector(...up);

    // calculate new view matrix
    const zAxis = normalize(subtractVectors(pos, target));
    const xAxis = cross(up, zAxis);
    const yAxis = cross(zAxis, xAxis);
    const newViewMat = [
      ...[xAxis.x, xAxis.y, xAxis.z, 0],
      ...[yAxis.x, yAxis.y, yAxis.z, 0],
      ...[zAxis.x, zAxis.y, zAxis.z, 0],
      ...[pos.x, pos.y, pos.z, 1],
    ];

    this.uViewMat = set(newViewMat, uViewMat);
  }

  /** Pan Camera Clockwise
   *
   * @param {float} radians
   */
  panCW(radians = Math.PI / 4) {
    this.cameraVector.z -= Math.cos(radians);
  }

  /** Pan Camera Counter Clockwise
   *
   * @param {float} radians
   */
  panCCW(radians = Math.PI / 4) {
    // different angles for facings
    // [1. 0, 4] - S (Reversed) (up/down)
    // [1. 0, 3] - SW (Iso)
    // [1. 0, 2] - W (left/right)
    // [1, 0, 1] - NW (Iso)
    // [1, 0, 0] - N (Normal) (up/down)
    // [1. 0, -1] - NE (Iso)
    // [1. 0, -2] - E (left/right)
    // [1. 0, -3] - SE (Iso)
    this.cameraVector.z += Math.cos(radians);
  }

  /** Pitch Camera Counter Clockwise
   *
   * @param {float} radians
   */
  pitchCW(radians = Math.PI / 4) {
    this.cameraVector.x -= Math.cos(radians);
  }

  /** Pitch Camera Counter Clockwise
   *
   * @param {float} radians
   */
  pitchCCW(radians = Math.PI / 4) {
    this.cameraVector.x += Math.sin(radians);
  }

  /** Tilt Camera Counter Clockwise
   *
   * @param {float} radians
   */
  tiltCW(radians = Math.PI / 4) {
    this.cameraVector.y -= Math.cos(radians);
  }

  /** Tilt Camera Counter Clockwise
   *
   * @param {float} radians
   */
  tiltCCW(radians = Math.PI / 4) {
    this.cameraVector.z += Math.sin(radians);
  }
}
