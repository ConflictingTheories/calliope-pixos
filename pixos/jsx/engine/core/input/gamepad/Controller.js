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

import { ControllerStick } from '@Engine/core/input/gamepad/ControllerStick.js';
import { ControllerButtons } from '@Engine/core/input/gamepad/ControllerButtons.js';
// Controller Manager for Gamepad
export class Controller {
  /**
   * Creates an instance of Controller.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} buttonOffset - The offset for button placement.
   * @param {Object.<string, any>} touches - The touch state object.
   * @param {boolean} start - Whether start button is enabled.
   * @param {boolean} select - Whether select button is enabled.
   * @param {Object.<string, string>} colours - The color scheme.
   * @param {GamePad} gamepad - The parent gamepad instance.
   */
  constructor(ctx, buttonOffset, touches, start, select, colours, gamepad) {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {GamePad} */
    this.gamepad = gamepad;
    /** @type {number} */
    this.width = ctx.canvas.width;
    /** @type {number} */
    this.height = ctx.canvas.height;
    /** @type {number} */
    this.radius = ctx.canvas.width / 10;
    /** @type {Object.<string, any>} */
    this.touches = touches;
    /** @type {boolean} */
    this.start = start;
    /** @type {boolean} */
    this.select = select;
    /** @type {Object} */
    this.buttonOffset = buttonOffset;
    /** @type {Object.<string, string>} */
    this.colours = colours;
    /** @type {Object} */
    this.layout = { x: this.width - this.buttonOffset.x, y: this.height - this.buttonOffset.y };
    /** @type {ControllerStick} */
    this.stick = new ControllerStick(this.ctx, this.layout, this.touches, this.colours, this.radius, this.gamepad);
    /** @type {ControllerButtons} */
    this.buttons = new ControllerButtons(this.ctx, this.layout, this.touches, this.start, this.select, this.colours, this.radius, this.gamepad);
  }
  /**
   * Initializes the controller components.
   */
  init() {
    this.stick.init();
    this.buttons.init();
  }

  /**
   * Draws the controller components.
   */
  draw() {
    this.stick.draw();
    this.buttons.draw();
  }
}
