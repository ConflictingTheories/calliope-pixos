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
import GLEngine from '@Engine/core/index.js';

import { Controller } from '@Engine/core/input/gamepad/Controller.js';
export class GamePad {
  /** Game Pad
   * inspired by https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
   *
   * @param {GLEngine} engine
   * @returns
   */
  constructor(engine) {
    if (!GamePad._instance) {
      /** @type {GLEngine} */
      this.engine = engine;
      /** @type {boolean} */
      this.dirty = true;
      /** @type {boolean} */
      this.showTrace = true;
      /** @type {boolean} */
      this.showDebug = true;
      /** @type {number} */
      this.opacity = 0.4;
      /** @type {string} */
      this.font = 'minecraftia';

      // Start & Select Buttons
      /** @type {boolean} */
      this.start = false;
      /** @type {boolean} */
      this.select = false;
      /** @type {Object.<string, any>} */
      this.touches = {};
      /** @type {number} */
      this.lastKey = new Date().getTime();
      /** @type {any[]} */
      this.listeners = [];
      /** @type {Object.<string, any>} */
      this.map = {};
      /** @type {number} */
      this.x = 0;
      /** @type {number} */
      this.y = 0;

      // Button Colours
      /** @type {Object.<string, string>} */
      this.colours = {
        red: `rgba(255,0,0,${this.opacity})`,
        green: `rgba(5,220,30,${this.opacity})`,
        blue: `rgba(5,30,220,${this.opacity})`,
        purple: `rgba(240,5,240,${this.opacity})`,
        yellow: `rgba(240,240,5,${this.opacity})`,
        cyan: `rgba(5,240,240,${this.opacity})`,
        black: `rgba(5,5,5,${this.opacity})`,
        white: `rgba(250,250,250,${this.opacity})`,
        joystick: {
          base: `rgba(0,0,0,${this.opacity})`,
          dust: `rgba(0,0,0,${this.opacity})`,
          stick: `rgba(214,214,214,1)`,
          ball: `rgba(245,245,245,1)`,
        },
      };
      GamePad._instance = this;
    }
    return GamePad._instance;
  }

  /**
   * Initializes the gamepad with layout and controller setup.
   */
  init() {
    // Font
    this.fontSize = this.engine.gp.canvas.width / 12;

    // Joystick Radius
    this.radius = this.engine.gp.canvas.width / 12;

    // Button placement
    this.buttonOffset = { x: this.radius * 2.5, y: 105 };

    // Button Layouts
    let buttonsLayout = [
      {
        x: -this.radius - this.radius / 2 + this.radius / 4,
        y: -this.radius / 4,
        r: (3 / 4) * this.radius,
        color: this.colours.red,
        name: 'b',
      },
      {
        x: this.radius - this.radius / 2,
        y: -(this.radius + this.radius / 2),
        r: (3 / 4) * this.radius,
        color: this.colours.green,
        name: 'a',
      },
      {
        x: this.radius - this.radius / 2,
        y: this.radius,
        r: (3 / 4) * this.radius,
        color: this.colours.blue,
        name: 'x',
      },
      {
        x: this.radius * 3 - this.radius / 2 - this.radius / 4,
        y: 0 - this.radius / 4,
        r: (3 / 4) * this.radius,
        color: this.colours.yellow,
        name: 'y',
      },
    ];
    if (this.start) {
      buttonsLayout.push({
        color: this.colours.black,
        y: -55,
        w: 50,
        h: 15,
        name: 'start',
      });
    }
    if (this.select) {
      buttonsLayout.push({
        y: -55,
        w: 50,
        h: 15,
        color: this.colours.black,
        name: 'select',
      });
    }

    // setup controller
    this.buttonsLayout = buttonsLayout;
    this.controller = new Controller(this.engine.gp, this.buttonOffset, this.touches, this.start, this.select, this.colours, this);
    this.initOptions();
  }

  // initialize widget
  initOptions(options = {}) {
    this.setOptions(options);
    this.resize();
    this.loadCanvas();
  }

  // attach external event listener (spliced into)
  attachListener(listener) {
    return this.listeners.push(listener);
  }

  // removed an attached external event listener
  removeListener(id) {
    this.listeners.splice(id - 1, 1);
  }

  // check input status
  checkInput() {
    return this.map;
  }

  // Handle resize (TODO - needs work)
  resize() {
    this.width = this.engine.gp.canvas.width;
    this.height = this.engine.gp.canvas.height;
    this.controller.init();
  }

  // setup canvas
  loadCanvas() {
    let { controller, width, height } = this;
    this.engine.gp.fillStyle = 'rgba(70,70,70,0.5)';
    this.engine.gp.textAlign = 'center';
    this.engine.gp.textBaseline = 'middle';
    this.engine.gp.font = 'minecraftia 14px';
    this.engine.gp.fillText('loading', width / 2, height / 2);
    controller.stick.draw();
    controller.buttons.draw();
    window.addEventListener('resize', () => this.resize());
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

  // debounce
  debounce() {
    let { controller, buttonsLayout } = this;
    let t = this.lastKey;
    this.lastKey = new Date().getTime() + 100;
    // todo - clear key
    for (var n = 0; n < buttonsLayout.length; n++) {
      controller.buttons.reset(n);
    }
    return t < this.lastKey;
  }

  // debounce and check key
  keyPressed(key) {
    return this.map[key] === 1 && this.debounce();
  }

  // Event Listener
  listen(e) {
    let { touches, controller, buttonsLayout } = this;
    if (e.type) {
      var type = e.type;
      
      // Normalize event to always have a touches-like array
      // Handle mouse events (click, mousedown, mouseup, mousemove)
      let eventTouches;
      if (e.type.indexOf('mouse') !== -1 || e.type === 'click') {
        // Mouse/click events - wrap in array
        eventTouches = [{
          identifier: 'desktop',
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          canvasX: e.canvasX,
          canvasY: e.canvasY
        }];
      } else if (e.touches && e.touches.length > 0) {
        // Touch events with active touches
        eventTouches = Array.from(e.touches).map(t => ({
          identifier: t.identifier,
          clientX: t.clientX,
          clientY: t.clientY,
          pageX: t.pageX,
          pageY: t.pageY,
          canvasX: e.canvasX, // Use pre-computed from WebGLView
          canvasY: e.canvasY
        }));
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touch end events - use changedTouches
        eventTouches = Array.from(e.changedTouches).map(t => ({
          identifier: t.identifier,
          clientX: t.clientX,
          clientY: t.clientY,
          pageX: t.pageX,
          pageY: t.pageY,
          canvasX: e.canvasX,
          canvasY: e.canvasY
        }));
      } else if (e.canvasX !== undefined) {
        // Adjusted event from WebGLView with pre-computed coordinates
        eventTouches = [{
          identifier: 'desktop',
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          canvasX: e.canvasX,
          canvasY: e.canvasY
        }];
      } else {
        // Fallback - no valid touch data
        return;
      }
      
      // Get canvas offset using getBoundingClientRect for accuracy
      const canvas = this.engine.gp.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // run against attached listeners
      this.listeners.map((l) => {
        if (l[type]) {
          return l[type](e);
        }
      });

      const touchCount = Math.min(eventTouches.length, 5);
      for (var n = 0; n < touchCount; n++) {
        var id = eventTouches[n].identifier;
        
        // Use pre-computed canvas coordinates if available, otherwise calculate
        let x, y;
        if (eventTouches[n].canvasX !== undefined) {
          x = eventTouches[n].canvasX;
          y = eventTouches[n].canvasY;
        } else {
          // Calculate coordinates relative to canvas with proper scaling
          const clientX = eventTouches[n].clientX ?? eventTouches[n].pageX;
          const clientY = eventTouches[n].clientY ?? eventTouches[n].pageY;
          x = (clientX - rect.left) * scaleX;
          y = (clientY - rect.top) * scaleY;
        }
        
        if (!touches[id]) {
          touches[id] = {
            x: x,
            y: y,
            leftClick: false,
            rightClick: false,
          };
        } else {
          touches[id].x = x;
          touches[id].y = y;
        }
      }

      for (var id in touches) {
        // handle controller
        switch (type) {
          case 'touchstart':
          case 'touchmove':
            this.disableScroll();
            controller.stick.state(id);
            if (new Date().getTime() > this.lastKey + 150) {
              for (var n = 0; n < buttonsLayout.length; n++) {
                controller.buttons.state(id, n);
              }
              this.lastKey = new Date().getTime();
            }
            break;
          case 'touchend':
            for (var n = 0; n < buttonsLayout.length; n++) {
              controller.buttons.reset(n);
            }
            break;
          case 'mousemove':
            if (touches[id].leftClick) { // camera move - needs work - not aligned with camera
              // let rotateSpeed = 0.01;
              // let angleChange = [touches[id].y * rotateSpeed, -touches[id].x * rotateSpeed + touches[id].y * rotateSpeed, -touches[id].x * rotateSpeed - touches[id].y * rotateSpeed,];
              // this.engine.renderManager.camera.changeAngle(angleChange);
            }
            this.x = touches[id].x;
            this.y = touches[id].y;
            break;
          case 'mousedown':
            if (e.touches && e.touches[0]?.which) {
              // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
              touches[id].leftClick = e.touches[0].which === 1;
              touches[id].rightClick = e.touches[0].which === 3;
            } else if ('button' in e) {
              // IE, Opera
              touches[id].leftClick = e.button == 1;
              touches[id].rightClick = e.button == 2;
            }
            controller.stick.state(id, type);
            for (var n = 0; n < buttonsLayout.length; n++) {
              controller.buttons.state(id, n, type);
            }
            break;
          case 'mouseup':
            controller.stick.state(id, type);
            for (var n = 0; n < buttonsLayout.length; n++) {
              controller.buttons.state(id, n, type);
            }
            touches[id].leftClick = 0;
            touches[id].rightClick = 0;
            break;
        }
      }

      if (e.type == 'touchend') {
        if (e.changedTouches && e.changedTouches.length > 0) {
          var id = e.changedTouches[0].identifier;
          if (touches[id] && touches[id].id == 'stick') {
            controller.stick.reset();
          }
          for (var n = 0; n < buttonsLayout.length; n++) {
            if (touches[id] && touches[id].id == buttonsLayout[n].name) {
              controller.buttons.reset(n);
            }
          }
          if (touches[id]) {
            delete touches[id];
          }
        }

        if (e.changedTouches && e.touches && e.changedTouches.length > e.touches.length) {
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
          for (var n = 0; n < buttonsLayout.length; n++) {
            controller.buttons.reset(n);
          }
          controller.stick.reset();
        }

        // Enable Scroll Again
        this.enableScroll();
      }
    } else {
      var keys = e;
      var dir = 0;
      for (var prop in keys) {
        switch (prop) {
          case '%': //left
            if (keys[prop]) {
              dir += 1;
            }
            break;
          case '&': //up
            if (keys[prop]) {
              dir += 2;
            }
            break;
          case "'": //right
            if (keys[prop]) {
              dir += 4;
            }
            break;
          case '(': //down
            if (keys[prop]) {
              dir += 8;
            }
            break;
          default:
            if (keys[prop]) {
              for (var n = 0; n < buttonsLayout.length; n++) {
                if (buttonsLayout[n].key) {
                  if (buttonsLayout[n].key == prop) {
                    touches[buttonsLayout[n].name] = {
                      id: buttonsLayout[n].name,
                      x: buttonsLayout[n]['hit'].x[0] + buttonsLayout[n].w / 2,
                      y: buttonsLayout[n]['hit'].y[0] + buttonsLayout[n].h / 2,
                    };
                    controller.buttons.state(buttonsLayout[n].name, n, 'mousedown');
                  }
                }
              }
            } else {
              if (!keys[prop]) {
                for (var n = 0; n < buttonsLayout.length; n++) {
                  if (buttonsLayout[n].key) {
                    if (buttonsLayout[n].key == prop) {
                      controller.buttons.reset(n);
                      delete touches[buttonsLayout[n].name];
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
          touches['stick'] = { id: 'stick' };
          controller.stick.state('stick', 'mousemove');
        } else {
          controller.stick.reset();
          delete touches['stick'];
        }
      }
    }

    return this.map;
  }

  // Draw
  render() {
    this.engine.gp.clearRect(0, 0, this.engine.gp.canvas.width, this.engine.gp.canvas.height);
    if (this.showDebug) {
      this.debug();
    }
    if (this.showTrace) {
      this.trace();
    }
    this.controller.stick.draw();
    this.controller.buttons.draw();
  }

  // debug information
  debug() {
    let { gp, map, touches } = this;
    this.dy = 30;
    this.engine.gp.fillStyle = 'rgba(70,70,70,0.5)';
    this.engine.gp.textAlign = 'left';
    this.engine.gp.textBaseline = 'middle';
    this.engine.gp.font = 'minecraftia 20px';
    this.engine.gp.fillText('debug', 10, this.dy);
    this.engine.gp.font = 'minecraftia 14px';
    this.dy += 5;
    for (var prop in touches) {
      this.dy += 10;
      let text = prop + ' : ' + JSON.stringify(touches[prop]).slice(1, -1);
      this.engine.gp.fillText(text, 10, this.dy);
    }
  }

  // map trace output
  trace() {
    let { map } = this;
    this.dy = 30;
    this.engine.gp.fillStyle = 'rgba(70,70,70,0.5)';
    this.engine.gp.textAlign = 'right';
    this.engine.gp.textBaseline = 'middle';
    this.engine.gp.font = 'minecraftia 20px';
    this.engine.gp.fillText('trace', this.width - 10, this.dy);
    this.engine.gp.font = 'minecraftia 14px';
    this.dy += 5;
    for (var prop in map) {
      this.dy += 10;
      let text = prop + ' : ' + map[prop];
      this.engine.gp.fillText(text, this.width - 10, this.dy);
    }
  }

  // get position with correct offset
  getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
      xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
      yPosition += element.offsetTop - element.scrollTop + element.clientTop;
      element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
  }

  // disable scroll while touching canvas
  enableScroll() {
    document.body.removeEventListener('touchmove', this.preventDefault);
  }

  // reenable once done
  disableScroll() {
    document.body.addEventListener('touchmove', this.preventDefault, { passive: false });
  }

  // stop event
  preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}
