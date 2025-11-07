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

// Controller Joystick Manager
export class ControllerStick {
  /**
   * Creates an instance of ControllerStick.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} layout - The layout object for positioning.
   * @param {Object.<string, any>} touches - The touch state object.
   * @param {Object.<string, string>} colours - The color scheme.
   * @param {number} radius - The radius for the stick.
   * @param {GamePad} gamepad - The parent gamepad instance.
   */
  constructor(ctx, layout, touches, colours, radius, gamepad) {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {GamePad} */
    this.gamepad = gamepad;
    /** @type {number} */
    this.width = ctx.canvas.width;
    /** @type {number} */
    this.height = ctx.canvas.height;
    /** @type {Object} */
    this.layout = layout;
    /** @type {Object.<string, any>} */
    this.touches = touches;
    /** @type {number} */
    this.radius = radius;
    /** @type {number} */
    this.x = 0;
    /** @type {number} */
    this.y = 0;
    /** @type {number} */
    this.dx = 0;
    /** @type {number} */
    this.dy = 0;
    this.gamepad.map['x-dir'] = 0;
    this.gamepad.map['y-dir'] = 0;
    this.gamepad.map['x-axis'] = 0;
    this.gamepad.map['y-axis'] = 0;
    /** @type {Object.<string, string>} */
    this.colours = colours;
  }
  /**
   * Initializes the stick position and resets map values.
   */
  init = () => {
    let { layout, width } = this;
    this.x = width - layout.x;
    this.y = layout.y + (3 * this.radius) / 8;
    this.dx = this.x;
    this.dy = this.y;
    this.gamepad.map['x-dir'] = 0;
    this.gamepad.map['y-dir'] = 0;
    this.gamepad.map['x-axis'] = 0;
    this.gamepad.map['y-axis'] = 0;
  }
  /**
   * Draws the joystick on the canvas.
   */
  draw = () => {
    let { ctx } = this;
    ctx.fillStyle = this.colours.joystick.base;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = this.colours.joystick.dust;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = this.colours.joystick.stick;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = this.colours.joystick.ball;
    ctx.beginPath();
    ctx.arc(this.dx, this.dy, this.radius - 10, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }
  /**
   * Manages the event state for the joystick.
   * @param {string} id - The touch identifier.
   * @param {string} [type] - The event type.
   */
  state = (id, type) => {
    let { gamepad } = this;
    let { touches, map, checkInput } = gamepad;
    var touch = {
      x: touches[id].x,
      y: touches[id].y,
    };
    var dx = parseInt(touch.x - this.x);
    var dy = parseInt(touch.y - this.y);
    var dist = parseInt(Math.sqrt(dx * dx + dy * dy));
    // Start
    if (dist < this.radius * 1.2) {
      if (!type) {
        touches[id].id = 'stick';
      } else {
        switch (type) {
          case 'mousedown':
            touches[id].id = 'stick';
            break;
        }
      }
    }
    // Stop
    if (dist < this.radius * 2.5) {
      if (!type) {
        touches[id].id = 'stick';
      } else {
        if (touches[id].id == 'stick')
          switch (type) {
            case 'mouseup':
              delete touches[id].id;
              this.reset();
              break;
          }
      }
    }
    // Move
    if (touches[id].id == 'stick') {
      if (Math.abs(parseInt(dx)) < this.radius / 2) {
        this.dx = this.x + dx;
      }
      if (Math.abs(parseInt(dy)) < this.radius / 2) {
        this.dy = this.y + dy;
      }
      map['x-axis'] = (this.dx - this.x) / (this.radius / 2);
      map['y-axis'] = (this.dy - this.y) / (this.radius / 2);
      map['x-dir'] = Math.round(map['x-axis']);
      map['y-dir'] = Math.round(map['y-axis']);

      if (dist > this.radius * 2.5) {
        this.reset();
        delete touches[id].id;
      }
      if (typeof checkInput === 'function') {
        this.gamepad.checkInput();
      }
    }
  }
  /**
   * Resets the joystick state.
   */
  reset = () => {
    let { map } = this.gamepad;
    this.dx = this.x;
    this.dy = this.y;
    map['x-dir'] = 0;
    map['y-dir'] = 0;
    map['x-axis'] = 0;
    map['y-axis'] = 0;
  }
}
