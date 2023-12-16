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
  constructor(ctx, layout, touches, start, select, colours, radius, gamepad) {
    this.ctx = ctx;
    this.gamepad = gamepad;
    this.layout = layout;
    this.radius = radius;
    this.touches = touches;
    this.start = start;
    this.select = select;
    this.colours = colours;
  }
  // Initialize
  init() {
    let { layout, ctx } = this;
    let { buttons_layout } = this.gamepad;
    let width = ctx.canvas.width;
    for (var n = 0; n < buttons_layout.length; n++) {
      var button = buttons_layout[n];
      var x = layout.x - button.x;
      var y = layout.y - button.y;
      if (button.r) {
        var r = button.r;
        buttons_layout[n]['hit'] = { x: [x - r, x + r * 2], y: [y - r, y + r * 2], active: false };
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
        buttons_layout[n]['hit'] = { x: [x, x + button.w], y: [y, y + button.h], active: false };
      }
      this.gamepad.map[button.name] = 0;
    }
  }
  // render Button
  draw() {
    let { ctx, layout } = this;
    for (var n = 0; n < this.gamepad.buttons_layout.length; n++) {
      var button = this.gamepad.buttons_layout[n];
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
  // State of Buttons
  state(id, n, type) {
    let { gamepad } = this;
    let { touches, checkInput, width } = gamepad;
    if (touches[id].id != 'stick') {
      var touch = {
        x: touches[id].x,
        y: touches[id].y,
      };
      var button = this.gamepad.buttons_layout[n];
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
  }
  // Reset State
  reset(n) {
    this.gamepad.buttons_layout[n].hit.active = false;
    this.gamepad.map[this.gamepad.buttons_layout[n].name] = 0;
  }
}
