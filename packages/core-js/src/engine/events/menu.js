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

/**
 * Menu event handler for displaying interactive menus with touch and keyboard support.
 * Handles menu rendering, input processing, and navigation through menu sections.
 */
export default {
  /**
   * Initializes the menu event with configuration and input handling.
   * @param {object} menu - Menu configuration object with sections.
   * @param {string[]} activeMenus - Array of active menu IDs to display.
   * @param {boolean} [scrolling=true] - Whether text should scroll.
   * @param {object} [options={}] - Additional options for menu behavior.
   * @param {boolean} [options.autoclose=false] - Auto-close after timeout.
   * @param {boolean} [options.closeOnEnter=false] - Close on Enter key.
   */
  init: function (
    menu,
    activeMenus,
    scrolling = true,
    options = { autoclose: false, closeOnEnter: false }
  ) {
    this.engine = this.world.engine;
    this.text = '';
    this.prompt = '';
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.onOpen = menu?.start?.onOpen ?? null;
    this.lastKey = new Date().getTime();
    this.touches = [];
    this.menuDict = menu ?? {};
    this.activeMenus = activeMenus ?? [];
    this.selectedMenu = {};
    this.selectedMenuId = null;
    this.isTouched = false;
    this.speechOutput = false;
    this.quittable = true;
    this.listenerId = this.engine.gamepad.attachListener(this.hookListener());
    this.speechOutput = true;
    // load voices and then play
    window.speechSynthesis.onvoiceschanged = () => { };

    // Register this menu as an active HUD element so it gets re-rendered each frame
    this.hudElementId = `menu-${Date.now()}`;
    this.engine.hud.registerElement(this.hudElementId, this);
  },
  /**
   * Updates the menu state and renders active menu sections.
   * @param {number} time - Current timestamp for timing operations.
   * @returns {boolean} True if the menu event is completed.
   */
  tick: function (time) {
    if (!this.loaded) return;
    // Check for autoclose (manual triggers and sections implemented in dialogue.js)
    if (this.options && this.options.autoclose) {
      this.endTime = this.endTime
        ? this.endTime
        : (this.options.endTime ?? new Date().getTime() + 10000); // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }

    // Handle Input
    this.checkInput(time);
    // Draw Active Menus to Screen
    Object.keys(this.menuDict)
      .filter(key => this.activeMenus.includes(key))
      .forEach(id => {
        let section = this.menuDict[id];
        let colors = section.colours;
        if (section.active) {
          colors['background'] = '#555';
        }
        this.engine.hud.drawButton(
          section.text,
          section.x,
          section.y,
          section.w,
          section.h,
          section.colours
        );
        if (section.prompt) {
          if (this.speechOutput) {
            this.engine.speechSynthesis(section.prompt);
          }
          this.textbox = this.engine.hud.scrollText(section.prompt, this.scrolling, this.options);
        }
      });
    // don't keep repeating speech
    this.speechOutput = false;

    if (this.completed) {
      this.unhookListener();
      window.speechSynthesis.cancel();
    }
    return this.completed;
  },
  /**
   * Renders the menu UI elements without processing input.
   * This is called by the HUD rendering system each frame to ensure UI stays visible.
   */
  render: function () {
    if (!this.engine || !this.menuDict) return;

    // Draw Active Menus to Screen
    Object.keys(this.menuDict)
      .filter(key => this.activeMenus.includes(key))
      .forEach(id => {
        let section = this.menuDict[id];
        let colors = section.colours;
        if (section.active) {
          colors['background'] = '#555';
        }
        this.engine.hud.drawButton(
          section.text,
          section.x,
          section.y,
          section.w,
          section.h,
          section.colours
        );
        if (section.prompt && !this.speechOutput) {
          // Re-render textbox without speech synthesis on every frame
          this.textbox = this.engine.hud.scrollText(section.prompt, this.scrolling, this.options);
        }
      });
  },
  // Unhook from the Touch & mouse handler
  unhookListener: function () {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
    // Unregister from HUD to stop rendering
    if (this.hudElementId) {
      this.engine.hud.unregisterElement(this.hudElementId);
    }
  },
  // Hook into the Touch & Mouse handler
  hookListener: function () {
    // open hook
    if (this.onOpen) this.onOpen(this);

    /**
     * Normalize event to extract touches array.
     * Works with mouse events, touch events, and pre-processed events from WebGLView.
     */
    const normalizeTouches = e => {
      // Pre-computed canvas coordinates from WebGLView
      if (e.canvasX !== undefined && e.canvasY !== undefined) {
        return [{ x: e.canvasX, y: e.canvasY, identifier: 'normalized' }];
      }

      // Helper to convert clientX/Y to canvas coordinates
      const convertToCanvasCoordinates = (clientX, clientY) => {
        const canvas = this.engine.canvas;
        if (!canvas) return { x: clientX, y: clientY };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY,
        };
      };

      // Touch events
      if (e.touches && e.touches.length > 0) {
        return Array.from(e.touches).map(t => {
          const coords = convertToCanvasCoordinates(t.clientX, t.clientY);
          return { x: coords.x, y: coords.y, identifier: t.identifier };
        });
      }
      // Touch end uses changedTouches
      if (e.changedTouches && e.changedTouches.length > 0) {
        return Array.from(e.changedTouches).map(t => {
          const coords = convertToCanvasCoordinates(t.clientX, t.clientY);
          return { x: coords.x, y: coords.y, identifier: t.identifier };
        });
      }
      // Mouse events
      if (e.clientX !== undefined && e.clientY !== undefined) {
        const coords = convertToCanvasCoordinates(e.clientX, e.clientY);
        return [{ x: coords.x, y: coords.y, identifier: 'mouse' }];
      }
      // Already normalized (legacy format)
      if (e.touches) {
        return e.touches;
      }
      return [];
    };

    // attach handler
    let touchstart = e => {
      const touches = normalizeTouches(e);
      this.isTouched = true;
      this.touches = touches;
      if (this.isTouched && this.touches.length > 0 && this.lastKey + 100 < new Date().getTime()) {
        let x = this.touches[0].x;
        let y = this.touches[0].y;
        let self = this;
        self.activeMenus
          .filter(key => {
            let w = self.menuDict[key];
            if (x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
              return true;
            }
            return false;
          })
          .map(key => {
            let w = self.menuDict[key];
            if (w.trigger) w.trigger(this);
            if (w.children) {
              self.activeMenus = w.children;
            }
          });
      }
    };
    let touchmove = e => {
      this.touches = normalizeTouches(e);
    };
    let touchend = e => {
      this.isTouched = false;
      this.touches = normalizeTouches(e);
    };
    let mousemove = touchmove;
    let mousedown = touchstart;
    let mouseup = touchend;
    return {
      touchstart,
      touchmove,
      touchend,
      mousedown,
      mousemove,
      mouseup,
    };
  },
  // Handle Keyboard & Input States
  checkInput: function (time) {
    // Keyboard
    if (time > this.lastKey + 200) {
      switch (this.engine.keyboard.lastPressedCode()) {
        case 'Escape':
          if (this.quittable) {
            this.completed = true;
          }
          break;
        case 'Enter':
          Object.keys(this.menuDict)
            .filter(key => this.activeMenus.includes(key))
            .map(id => {
              let section = this.menuDict[id];
              if (section.onEnter) section.trigger(this);
            });
          if (this.quittable || this.options.closeOnEnter) {
            this.completed = true;
          }
          break;
      }
    }
  },
};
