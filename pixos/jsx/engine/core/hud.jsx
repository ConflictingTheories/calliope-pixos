export const minecraftia = new FontFace("minecraftia", "url(/pixos/font/minecraftia.ttf)");

// Scrolling Text Box UI (For Dialogue)
export class textScrollBox {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  constructor(ctx) {
    this.ctx = ctx;
    this.dirty = true; // indicates that variouse setting need update
    this.scrollY = 0;
    this.fontSize = 24;
    this.font = "minecraftia";
    this.align = "left";
    this.background = "#999";
    this.border = {
      lineWidth: 4,
      style: "white",
      corner: "round",
    };
    this.scrollBox = {
      width: 5,
      background: "#568",
      color: "#78a",
    };
    this.fontStyle = "white";
    this.lines = [];
  }
  // initialize widget
  init(text, x, y, width, height, options = {}) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.portrait = options.portrait ?? null;
    this.setOptions(options);
    this.cleanit();
  }
  // Clean & format text
  cleanit(dontFitText) {
    if (this.dirty) {
      this.setFont();
      this.getTextPos();
      this.dirty = false;
      if (!dontFitText) {
        this.fitText();
      }
    }
  }
  // Apply options
  setOptions(options) {
    Object.keys(this).forEach((key) => {
      if (options[key] !== undefined) {
        this[key] = options[key];
        this.dirty = true;
      }
    });
  }
  // Apply font
  setFont() {
    this.fontStr = this.fontSize + "px " + this.font;
    this.textHeight = this.fontSize + Math.ceil(this.fontSize * 0.05);
  }
  // Get Text Position
  getTextPos() {
    if (this.align === "left") {
      this.textPos = 2;
    } else if (this.align === "right") {
      this.textPos = Math.floor(this.width - this.scrollBox.width - this.fontSize / 4);
    } else {
      this.textPos = Math.floor((this.width - -this.scrollBox.width) / 2);
    }
  }
  // Fit to Text box
  fitText() {
    let { ctx } = this;
    this.cleanit(true); // MUST PASS TRUE or will recurse to call stack overflow
    ctx.font = this.fontStr;
    ctx.textAlign = this.align;
    ctx.textBaseline = "top";
    let words = this.text.split(" ");
    this.lines.length = 0;
    let line = "";
    let space = "";
    while (words.length > 0) {
      let word = words.shift();
      let width = ctx.measureText(line + space + word).width;
      if (width < this.width - this.scrollBox.width - this.scrollBox.width - (this.portrait ? 84 : 0)) {
        line += space + word;
        space = " ";
      } else {
        if (space === "") {
          // if one word too big put it in anyways
          line += word;
        } else {
          words.unshift(word);
        }
        this.lines.push(line);
        space = "";
        line = "";
      }
    }
    if (line !== "") {
      this.lines.push(line);
    }
    this.maxScroll = (this.lines.length + 0.5) * this.textHeight - this.height;
  }
  // Draw Textbox border
  drawBorder(portrait = false) {
    let { ctx } = this;
    let bw = this.border.lineWidth / 2;
    ctx.lineJoin = this.border.corner;
    ctx.lineWidth = this.border.lineWidth;
    ctx.strokeStyle = this.border.style;
    if (portrait) {
      ctx.strokeRect(this.x - bw + 84, this.y - bw, this.width + 2 * bw - 84, this.height + 2 * bw);
    } else {
      ctx.strokeRect(this.x - bw, this.y - bw, this.width + 2 * bw, this.height + 2 * bw);
    }
  }
  // Draw Scrollbar on the side
  drawScrollBox() {
    let { ctx } = this;
    let scale = this.height / (this.lines.length * this.textHeight);
    ctx.fillStyle = this.scrollBox.background;
    ctx.fillRect(this.x + this.width - this.scrollBox.width, this.y, this.scrollBox.width, this.height);
    ctx.fillStyle = this.scrollBox.color;
    let barsize = this.height * scale;
    if (barsize > this.height) {
      barsize = this.height;
    }
    ctx.fillRect(this.x + this.width - this.scrollBox.width, this.y - this.scrollY * scale, this.scrollBox.width, barsize);
  }
  // Draw Scrollbar on the side
  drawPortrait() {
    let { ctx } = this;
    ctx.drawImage(this.portrait.image, this.x, this.y + 38, 76, 76);
  }
  // Scroll to position
  scroll(pos) {
    this.cleanit();
    this.scrollY = -pos;
    if (this.scrollY > 0) {
      this.scrollY = 0;
    } else if (this.scrollY < -this.maxScroll) {
      this.scrollY = -this.maxScroll;
    }
  }
  // Scroll to position
  scrollLines(x) {
    this.cleanit();
    this.scrollY = -this.textHeight * x;
    if (this.scrollY > 0) {
      this.scrollY = 0;
    } else if (this.scrollY < -this.maxScroll) {
      this.scrollY = -this.maxScroll;
    }
  }
  // Draw
  render() {
    let { ctx } = this;
    this.cleanit();
    ctx.font = this.fontStr;
    ctx.textAlign = this.align;
    if (this.portrait) {
      this.drawBorder(true);
      this.drawPortrait();
      ctx.save(); // need this to reset the clip area
      ctx.fillStyle = this.background;
      ctx.fillRect(this.x + 84, this.y, this.width - 84, this.height);
    } else {
      this.drawBorder();
      ctx.save(); // need this to reset the clip area
      ctx.fillStyle = this.background;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.drawScrollBox();

    // Important text does not like being place at fractions of a pixel
    if (this.portrait) {
      ctx.beginPath();
      ctx.rect(this.x + 84, this.y, this.width - this.scrollBox.width - 84, this.height);
      ctx.clip();
      ctx.setTransform(1, 0, 0, 1, this.x + 84, Math.floor(this.y + this.scrollY));
    } else {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width - this.scrollBox.width, this.height);
      ctx.clip();
      ctx.setTransform(1, 0, 0, 1, this.x, Math.floor(this.y + this.scrollY));
    }
    ctx.fillStyle = this.fontStyle;
    for (let i = 0; i < this.lines.length; i++) {
      // Important text does not like being place at fractions of a pixel
      ctx.fillText(this.lines[i], this.textPos, Math.floor(i * this.textHeight) + 2);
    }
    ctx.restore(); // remove the clipping
  }
}

// Mobile Gamepad Controller
export class GamePad {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  constructor(ctx) {
    this.ctx = ctx;
    this.dirty = true;
    this.showTrace = false;
    this.showDebug = true;
    this.fontSize = 24;
    this.opacity = 0.4;
    this.font = "minecraftia";
    // Start & Select Buttons
    this.start = false;
    this.select = false;
    this.touches = {};
    this.map = {};
    this.layout = "BOTTOM_RIGHT";
    // Joystick Radius
    this.radius = 25;
    // Button placement
    this.button_offset = { x: this.radius * 3, y: this.radius * 3 };
    this.observerFunction = () => this.map;
    // Button Colours
    this.colours = {
      red: `rgba(255,0,0,${this.opacity})`,
      green: `rgba(0,255,0,${this.opacity})`,
      blue: `rgba(0,0,255,${this.opacity})`,
      purple: `rgba(255,0,255,${this.opacity})`,
      yellow: `rgba(255,255,0,${this.opacity})`,
      cyan: `rgba(0,255,255,${this.opacity})`,
      black: `rgba(0,0,0,${this.opacity})`,
      white: `rgba(255,255,255,${this.opacity})`,
      joystick: {
        base: `rgba(0,0,0,${this.opacity})`,
        dust: `rgba(0,0,0,${this.opacity})`,
        stick: `rgba(204,204,204,1)`,
        ball: `rgba(255,255,255,1)`,
      },
    };
    // Button Layouts
    this.buttons_layout = [
      { x: -this.radius, y: this.radius, r: this.radius, color: this.colours.red, name: "a" },
      {
        x: this.radius * 2 - this.radius,
        y: -(this.radius + this.radius) + this.radius,
        r: this.radius,
        color: this.colours.green,
        name: "b",
      },
      {
        x: this.radius * 2 - this.radius,
        y: this.radius + this.radius + this.radius,
        r: this.radius,
        color: this.colours.blue,
        name: "x",
      },
      { x: this.radius * 3, y: 0 + this.radius, r: this.radius, color: this.colours.purple, name: "y" },
    ];
    if (this.start) {
      this.buttons_layout.push({ x: this.ctx.canvas.width / 2, y: -15, w: 50, h: 15, color: this.colours.black, name: "start" });
    }
    if (this.select) {
      this.buttons_layout.push({ x: this.ctx.canvas.width / 2, y: -15, w: 50, h: 15, color: this.colours.black, name: "select" });
    }
    // setup controller
    this.controller = new Controller(
      ctx,
      this.layout,
      this.buttons_layout,
      this.button_offset,
      this.map,
      this.touches,
      this.start,
      this.select,
      this.colours
    );
    // use custom round Rect shape
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
  }
  // initialize widget
  init(width, height, options = {}) {
    this.width = width;
    this.height = height;
    this.setOptions(options);
    this.controller.init();
    this.loadCanvas();
  }

  // setup canvas
  loadCanvas() {
    let { ctx, controller, width, height } = this;
    ctx.fillStyle = "rgba(70,70,70,0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "minecraftia 14px";
    ctx.fillText("loading", width / 2, height / 2);
    controller.stick.draw();
    controller.buttons.draw();
    setTimeout(function () {
      this.ready = true;
    }, 250);
  }

  // Apply options
  setOptions(options) {
    Object.keys(this).forEach((key) => {
      if (options[key] !== undefined) {
        this[key] = options[key];
        this.dirty = true;
      }
    });
  }

  // Event Listener
  listen(e) {
    let { touches, controller, buttons_layout } = this;
    if (e.type) {
      var type = e.type;
      if (e.type.indexOf("mouse") != -1) {
        e.identifier = "desktop";
        e = { touches: [e] };
      }
      for (var n = 0; n < (e.touches.length > 5 ? 5 : e.touches.length); n++) {
        var id = e.touches[n].identifier;
        if (!touches[id]) {
          touches[id] = {
            x: e.touches[n].pageX,
            y: e.touches[n].pageY,
          };
        } else {
          touches[id].x = e.touches[n].pageX;
          touches[id].y = e.touches[n].pageY;
        }
      }

      /*
       **
       */
      for (var id in touches) {
        switch (type) {
          case "touchstart":
          case "touchmove":
            controller.stick.state(id);
            for (var n = 0; n < buttons_layout.length; n++) {
              controller.buttons.state(id, n);
            }
            break;
          case "mousedown":
          case "mousemove":
          case "mouseup":
            controller.stick.state(id, type);
            for (var n = 0; n < buttons_layout.length; n++) {
              controller.buttons.state(id, n, type);
            }
            break;
        }
      }

      /*
       ** @description remove touchend from touches
       */
      if (e.type == "touchend") {
        var id = e.changedTouches[0].identifier;
        if (touches[id].id == "stick") {
          controller.stick.reset();
        }
        for (var n = 0; n < buttons_layout.length; n++) {
          if (touches[id].id == buttons_layout[n].name) {
            controller.buttons.reset(n);
          }
        }
        if (touches[id]) {
          delete touches[id];
        }

        if (e.changedTouches.length > e.touches.length) {
          var length = 0;
          var delta = e.changedTouches.length - e.touches.length;
          for (var id in touches) {
            if (length >= delta) {
              delete touches[id];
            }
            length++;
          }
        }
        if (e.touches.length == 0) {
          touches = {};
          for (var n = 0; n < buttons_layout.length; n++) {
            controller.buttons.reset(n);
          }
          controller.stick.reset();
        }
      }
    } else {
      var keys = e;
      var dir = 0;
      for (var prop in keys) {
        switch (prop) {
          case "%": //left
            if (keys[prop]) {
              dir += 1;
            }
            break;
          case "&": //up
            if (keys[prop]) {
              dir += 2;
            }
            break;
          case "'": //right
            if (keys[prop]) {
              dir += 4;
            }
            break;
          case "(": //down
            if (keys[prop]) {
              dir += 8;
            }
            break;
          default:
            if (keys[prop]) {
              for (var n = 0; n < buttons_layout.length; n++) {
                if (buttons_layout[n].key) {
                  if (buttons_layout[n].key == prop) {
                    touches[buttons_layout[n].name] = {
                      id: buttons_layout[n].name,
                      x: buttons_layout[n]["hit"].x[0] + buttons_layout[n].w / 2,
                      y: buttons_layout[n]["hit"].y[0] + buttons_layout[n].h / 2,
                    };
                    controller.buttons.state(buttons_layout[n].name, n, "mousedown");
                  }
                }
              }
            } else {
              if (!keys[prop]) {
                for (var n = 0; n < buttons_layout.length; n++) {
                  if (buttons_layout[n].key) {
                    if (buttons_layout[n].key == prop) {
                      controller.buttons.reset(n);
                      delete touches[buttons_layout[n].name];
                    }
                  }
                }
                delete keys[prop];
              }
            }
            break;
        }
        controller.stick.dx = controller.stick.x;
        controller.stick.dy = controller.stick.y;
        switch (dir) {
          case 1: //left
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            break;
          case 2: //up
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 3: //left up
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 4: //right
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            break;
          case 6: //right up
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 8: //down
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          case 9: //left down
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          case 12: //right down
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          default:
            controller.stick.dx = controller.stick.x;
            controller.stick.dy = controller.stick.y;
            break;
        }
        if (dir != 0) {
          touches["stick"] = { id: "stick" };
          controller.stick.state("stick", "mousemove");
        } else {
          controller.stick.reset();
          delete touches["stick"];
        }
      }
    }

    return this.map;
  }

  // Draw
  render() {
    let { ctx, map, touches } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (this.showDebug) {
      this.dy = 30;
      ctx.fillStyle = "rgba(70,70,70,0.5)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "minecraftia 20px";
      ctx.fillText("debug", 10, this.dy);
      ctx.font = "minecraftia 14px";
      this.dy += 5;
      for (var prop in touches) {
        this.dy += 10;
        let text = prop + " : " + JSON.stringify(touches[prop]).slice(1, -1);
        ctx.fillText(text, 10, this.dy);
      }
    }
    if (this.showTrace) {
      this.dy = 30;
      ctx.fillStyle = "rgba(70,70,70,0.5)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "minecraftia 20px";
      ctx.fillText("trace", this.width - 10, this.dy);
      ctx.font = "minecraftia 14px";
      this.dy += 5;
      for (var prop in map) {
        this.dy += 10;
        let text = prop + " : " + map[prop];
        ctx.fillText(text, this.width - 10, this.dy);
      }
    }
    this.controller.draw();
    this.controller.stick.draw();
    this.controller.buttons.draw();
  }
}

// Controller Manager for Gamepad
class Controller {
  constructor(ctx, layout, buttons_layout, button_offset, map, touches, start, select, colours) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.radius = 40;
    this.layout = layout;
    this.buttons_layout = buttons_layout;
    this.button_offset = button_offset;
    this.stick = new ControllerStick(ctx, this.layout, map, touches, colours, this.radius);
    this.buttons = new ControllerButtons(
      ctx,
      this.layout,
      this.buttons_layout,
      map,
      touches,
      start,
      select,
      colours,
      this.radius
    );
    console.log("loading Controller Manager - ", this);
  }
  // Initialize
  init() {
    let { layout, width, height } = this;
    var layout_string = layout;
    this.layout = { x: 0, y: 0 };
    switch (layout_string) {
      case "TOP_LEFT":
        var shift = 0;
        for (var n = 0; n < this.buttons_layout.length; n++) {
          if (this.buttons_layout[n].r) {
            shift += this.buttons_layout[n].r;
            this.buttons_layout[n].y -= this.buttons_layout[n].r * 2;
          }
        }
        this.layout.x = shift + this.button_offset.x;
        this.layout.y = 0 + this.button_offset.y;
        break;
      case "TOP_RIGHT":
        layout.x = width - this.button_offset.x;
        layout.y = 0 + this.button_offset.y;
        break;
      case "BOTTOM_LEFT":
        var shift = 0;
        for (var n = 0; n < this.buttons_layout.length; n++) {
          if (this.buttons_layout[n].r) {
            shift += this.buttons_layout[n].r;
          }
        }
        this.layout.x = shift + this.button_offset.x;
        this.layout.y = height - this.button_offset.y;
        break;
      case "BOTTOM_RIGHT":
        this.layout.x = width - this.button_offset.x;
        this.layout.y = height - this.button_offset.y;
        break;
    }
    // Initialize
    this.buttons.init();
    this.stick.init();
  }
  // draw
  draw() {
    this.stick.draw();
    this.buttons.draw();
  }
}

// Controller Joystick Manager
class ControllerStick {
  constructor(ctx, layout, map, touches, colours, radius) {
    this.ctx = ctx;
    this.map = map;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.layout = layout;
    this.touches = touches;
    this.radius = radius;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.colours = colours;
    console.log("loading Controller Joystick - ", this);
  }
  // Initialize
  init() {
    let { map, layout, width } = this;
    this.x = width - layout.x;
    this.y = layout.y;
    this.dx = this.x;
    this.dy = this.y;
    map["x-dir"] = 0;
    map["y-dir"] = 0;
    map["x-axis"] = 0;
    map["y-axis"] = 0;
  }
  // draw joystick
  draw() {
    console.log('drawing - joy')
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
  // manage event state
  state(id, type) {
    let { map, touches, observerFunction } = this;
    var touch = {
      x: touches[id].x,
      y: touches[id].y,
    };
    var dx = parseInt(touch.x - this.x);
    var dy = parseInt(touch.y - this.y);
    var dist = parseInt(Math.sqrt(dx * dx + dy * dy));
    if (dist < this.radius * 1.5) {
      if (!type) {
        touches[id].id = "stick";
      } else {
        switch (type) {
          case "mousedown":
            touches[id].id = "stick";
            break;
          case "mouseup":
            delete touches[id].id;
            controller.stick.reset();
            break;
        }
      }
    }
    if (touches[id].id == "stick") {
      if (Math.abs(parseInt(dx)) < this.radius / 2) {
        this.dx = this.x + dx;
      }
      if (Math.abs(parseInt(dy)) < this.radius / 2) {
        this.dy = this.y + dy;
      }
      map["x-axis"] = (this.dx - this.x) / (this.radius / 2);
      map["y-axis"] = (this.dy - this.y) / (this.radius / 2);
      map["x-dir"] = Math.round(map["x-axis"]);
      map["y-dir"] = Math.round(map["y-axis"]);

      if (dist > this.radius * 1.5) {
        controller.stick.reset();
        delete touches[id].id;
      }
      if (typeof observerFunction === "function") {
        observerFunction();
      }
    }
  }
  // reset state
  reset() {
    let { map } = this;
    this.dx = this.x;
    this.dy = this.y;
    map["x-dir"] = 0;
    map["y-dir"] = 0;
    map["x-axis"] = 0;
    map["y-axis"] = 0;
  }
}

// Controller Button Manager
class ControllerButtons {
  constructor(ctx, layout, buttons_layout, map, touches, start, select, colours, radius) {
    this.ctx = ctx;
    this.layout = layout;
    this.map = map;
    this.radius = radius;
    this.touches = touches;
    this.buttons_layout = buttons_layout;
    this.start = start;
    this.select = select;
    this.colours = colours;
    console.log("loading Controller Buttons - ", this);
  }
  // Initialize
  init() {
    let { buttons_layout, layout, width, height } = this;
    for (var n = 0; n < buttons_layout.length; n++) {
      var button = buttons_layout[n];
      var x = layout.x - button.x;
      var y = layout.y - button.y;
      if (button.r) {
        var r = button.r;
        buttons_layout[n]["hit"] = { x: [x - r, x + r * 2], y: [y - r, y + r * 2], active: false };
      } else {
        button.x = width / 2 - button.w;
        if (this.start && this.select) {
          switch (button.name) {
            case "select":
              button.x = width / 2 - button.w - button.h * 2;
              break;
            case "start":
              button.x = width / 2;
              break;
          }
        }
        var x = button.x;
        var y = layout.y - button.y;
        buttons_layout[n]["hit"] = { x: [x, x + button.w], y: [y, y + button.h], active: false };
      }
      this.map[button.name] = 0;
    }
  }
  // render Button
  draw() {
    console.log('drawing - btn')
    let { ctx, buttons_layout, layout } = this;
    for (var n = 0; n < this.buttons_layout.length; n++) {
      var button = buttons_layout[n];
      var name = button.name;
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

        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "minecraftia 12px";
        ctx.fillText(button.name, x, y);
      } else {
        var w = button.w;
        var h = button.h;
        var x = button.x;
        var y = button.dy;
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
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "minecraftia 12px";
        ctx.fillText(button.name, x + w / 2, y + h * 2);
      }

      if (button.key && hint) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "minecraftia 12px";
        if (button.name == "start" || button.name == "select") {
          x += w / 2;
        }
        ctx.fillText(button.key, x, y - r * 1.5);
      }
    }
  }
  // State of Buttons
  state(id, n, type) {
    let { touches, observerFunction, width } = this;
    if (touches[id].id != "stick") {
      var touch = {
        x: touches[id].x,
        y: touches[id].y,
      };
      var button = this.buttons_layout[n];
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
      if (dist < this.radius && touches[id].id != "stick") {
        if (!type) {
          touches[id].id = name;
        } else {
          switch (type) {
            case "mousedown":
              touches[id].id = name;
              break;
            case "mouseup":
              delete touches[id].id;
              controller.buttons.reset(n);
              break;
          }
        }
      }
      if (touches[id].id == name) {
        this.map[name] = 1;
        button.hit.active = true;
        if (dist > this.radius) {
          button.hit.active = false;
          this.map[name] = 0;
          delete touches[id].id;
        }
        if (typeof observerFunction === "function") {
          observerFunction();
        }
      }
    }
  }
  // Reset State
  reset(n) {
    var button = this.buttons_layout[n];
    var name = button.name;
    button.hit.active = false;
    this.map[name] = 0;
  }
}
