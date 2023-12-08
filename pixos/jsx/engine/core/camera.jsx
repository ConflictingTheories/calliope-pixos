/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { create, create3, normalFromMat4, rotate, translate, perspective, set } from '@Engine/utils/math/matrix4.jsx';
import { Vector, negate, degToRad } from '@Engine/utils/math/vector.jsx';

export default class Camera {
  /**
   * Camera
   */
  constructor(uViewMat) {
    this.uViewMat = uViewMat;
    this.fov = 45;
    this.cameraAngle = 45;
    this.cameraVector = new Vector(...[1, 0, 0]);
    this.cameraDir = 'N';
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.panCameraCCW = this.panCameraCCW.bind(this);
    this.panCameraCW = this.panCameraCW.bind(this);
    this.tiltCameraCCW = this.tiltCameraCCW.bind(this);
    this.tiltCameraCW = this.tiltCameraCW.bind(this);
    this.pitchCameraCCW = this.pitchCameraCCW.bind(this);
    this.pitchCameraCW = this.pitchCameraCW.bind(this);
  }

  /**
   * Set Camera Pos & Angle
   */
  setCamera() {
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.x), [1, 0, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.y), [0, 1, 0]);
    rotate(this.uViewMat, this.uViewMat, degToRad(this.cameraAngle * this.cameraVector.z), [0, 0, 1]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  // Set Camera Pos & Angle
  panCameraCW(radians = Math.PI / 4) {
    this.cameraVector.z -= Math.cos(radians);
  }
  panCameraCCW(radians = Math.PI / 4) {
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
  // Set Camera Pos & Angle
  pitchCameraCW(radians = Math.PI / 4) {
    this.cameraVector.x -= Math.cos(radians);
  }
  pitchCameraCCW(radians = Math.PI / 4) {
    this.cameraVector.x += Math.sin(radians);
  }
  // Set Camera Pos & Angle
  tiltCameraCW(radians = Math.PI / 4) {
    this.cameraVector.y -= Math.cos(radians);
  }
  tiltCameraCCW(radians = Math.PI / 4) {
    this.cameraVector.z += Math.sin(radians);
  }
}
