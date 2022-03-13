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

import { ControllerStick } from "@Engine/utils/gamepad/ControllerStick.jsx";
import { ControllerButtons } from "@Engine/utils/gamepad/ControllerButtons.jsx";
// Controller Manager for Gamepad
export class Controller {
  constructor(ctx, button_offset, touches, start, select, colours, gamepad) {
    this.ctx = ctx;
    this.gamepad = gamepad;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.radius = ctx.canvas.width / 10;
    this.touches = touches;
    this.start = start;
    this.select = select;
    this.button_offset = button_offset;
    this.colours = colours;
    this.layout = { x: this.width - this.button_offset.x, y: this.height - this.button_offset.y };
    this.stick = new ControllerStick(this.ctx, this.layout, this.touches, this.colours, this.radius, this.gamepad);
    this.buttons = new ControllerButtons(
      this.ctx,
      this.layout,
      this.touches,
      this.start,
      this.select,
      this.colours,
      this.radius,
      this.gamepad
    );
  }
  // Initialize
  init() {
    this.stick.init();
    this.buttons.init();
  }
  // draw
  draw() {
    this.stick.draw();
    this.buttons.draw();
  }
}
