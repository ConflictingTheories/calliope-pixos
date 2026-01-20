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

// Mobile Gamepad Controller
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

// Controller Button Manager
export class ControllerButtons {
  /**
   * Creates an instance of ControllerButtons.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} layout - The layout object for positioning.
   * @param {Object.<string, any>} touches - The touch state object.
   * @param {boolean} start - Whether start button is enabled.
   * @param {boolean} select - Whether select button is enabled.
   * @param {Object.<string, string>} colours - The color scheme.
   * @param {number} radius - The radius for buttons.
   * @param {GamePad} gamepad - The parent gamepad instance.
   */
  constructor(ctx, layout, touches, start, select, colours, radius, gamepad) {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {GamePad} */
    this.gamepad = gamepad;
    /** @type {Object} */
    this.layout = layout;
    /** @type {number} */
    this.radius = radius;
    /** @type {Object.<string, any>} */
    this.touches = touches;
    /** @type {boolean} */
    this.start = start;
    /** @type {boolean} */
    this.select = select;
    /** @type {Object.<string, string>} */
    this.colours = colours;
  }
  /**
   * Initializes the button layouts and hit areas.
   */
  init() {
    let { layout, ctx } = this;
    let { buttonsLayout } = this.gamepad;
    let width = ctx.canvas.width;
    for (var n = 0; n < buttonsLayout.length; n++) {
      var button = buttonsLayout[n];
      var x = layout.x - button.x;
      var y = layout.y - button.y;
      if (button.r) {
        var r = button.r;
        buttonsLayout[n]['hit'] = { x: [x - r, x + r * 2], y: [y - r, y + r * 2], active: false };
      } else {
        button.x = width / 3 - button.w;
        if (this.start && this.select) {
          switch (button.name) {
            case 'select':
              button.x = width / 2 - button.w - button.h * 2;
              break;
            case 'start':
              button.x = width / 2;
              break;
          }
        }
        var x = button.x;
        var y = layout.y - button.y;
        buttonsLayout[n]['hit'] = { x: [x, x + button.w], y: [y, y + button.h], active: false };
      }
      this.gamepad.map[button.name] = 0;
    }
  }
  /**
   * Renders the buttons on the canvas.
   */
  draw() {
    let { ctx, layout } = this;
    for (var n = 0; n < this.gamepad.buttonsLayout.length; n++) {
      var button = this.gamepad.buttonsLayout[n];
      var color = button.color;
      var x = layout.x - button.x;
      var y = layout.y - button.y;
      button.dx = x;
      button.dy = y;

      if (button.r) {
        var r = button.r;

        if (button.hit) {
          if (button.hit.active) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r + 5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
          }
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'minecraftia 12px';
        ctx.fillText(button.name, x, y);
      } else {
        var w = button.w;
        var h = button.h;
        var x = isNaN(button.x) ? ctx.canvas.width / 2 : button.x;
        var r = 10;
        ctx.fillStyle = color;
        if (button.hit) {
          if (button.hit.active) {
            ctx.roundRect(x - 5, y - 5, w + 10, h + 10, r * 2).fill();
          }
        }
        ctx.roundRect(x, y, w, h, r).fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'minecraftia 12px';
        ctx.fillText(button.name, x + w / 2, y + h * 2);
      }

      if (button.key) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'minecraftia 12px';
        if (button.name == 'start' || button.name == 'select') {
          x += w / 2;
        }
        ctx.fillText(button.key, x, y - r * 1.5);
      }
    }
  }
  /**
   * Updates the state of a button based on touch input.
   * @param {string} id - The touch identifier.
   * @param {number} n - The button index.
   * @param {string} [type] - The event type.
   */
  state(id, n, type) {
    let { gamepad } = this;
    let { touches, checkInput, width } = gamepad;
    
    // Ensure touch exists and is not assigned to stick before processing
    if (!touches[id] || touches[id].id === 'stick') {
      return;
    }
    
    var touch = {
      x: touches[id].x,
      y: touches[id].y,
    };
    var button = this.gamepad.buttonsLayout[n];
    var name = button.name;

      var dx = parseInt(touch.x - button.dx);
      var dy = parseInt(touch.y - button.dy);
      var dist = width;
      if (button.r) {
        dist = parseInt(Math.sqrt(dx * dx + dy * dy));
      } else {
        if (touch.x > button.hit.x[0] && touch.x < button.hit.x[1] && touch.y > button.hit.y[0] && touch.y < button.hit.y[1]) {
          dist = 0;
        }
      }
      if (dist < this.radius && touches[id].id != 'stick') {
        if (!type) {
          touches[id].id = name;
        } else {
          switch (type) {
            case 'mousedown':
              touches[id].id = name;
              break;
            case 'mouseup':
              delete touches[id].id;
              this.reset(n);
              break;
          }
        }
      }
      if (touches[id].id == name) {
        this.gamepad.map[name] = 1;
        button.hit.active = true;
        if (dist > this.radius) {
          button.hit.active = false;
          this.gamepad.map[name] = 0;
          delete touches[id].id;
        }
        if (typeof checkInput === 'function') {
          this.gamepad.checkInput();
        }
      }
  }
  /**
   * Resets the state of a button.
   * @param {number} n - The button index.
   */
  reset(n) {
    this.gamepad.buttonsLayout[n].hit.active = false;
    this.gamepad.map[this.gamepad.buttonsLayout[n].name] = 0;
  }
}
