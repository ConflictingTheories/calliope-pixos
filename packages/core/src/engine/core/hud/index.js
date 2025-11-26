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

import GLEngine from '../index.js';

export const minecraftia = new FontFace('minecraftia', 'url(/pixospritz/font/minecraftia.ttf)');

/**
 * Hud - Manages Heads-Up Display elements for the Pixos game engine.
 * Handles drawing buttons, text, mode labels, and scrolling textboxes.
 */
export default class Hud {
  /**
   * Creates an instance of Hud.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Hud} The singleton instance.
   */
  constructor(engine) {
    if (!Hud._instance) {
      /** @type {GLEngine} */
      this.engine = engine;
      /** @type {Image|null} */
      this.backdropImage = null;
      /** @type {Array} */
      this.cutoutImages = []; // Array of {image, position} objects
      Hud._instance = this;
    }
    return Hud._instance;
  }

  /**
   * Initializes the HUD context.
   */
  init = () => {
    // setup anything needed at the start (run once)
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.engine.ctx;
  }

  /**
   * Draws a button
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {*} colours
   */
  drawButton = (text, x, y, w, h, colours) => {
    const { ctx } = this;

    // Apply HUD style
    this.applyStyle({
      font: '20px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: colours.background,
      globalAlpha: 1.0,
    });

    // Draw the button background
    ctx.fillStyle = colours.background;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();

    // Light gradient effect on top of the button
    var grad = ctx.createLinearGradient(x, y, x, y + h / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, y, w, h / 2);

    // Draw the button text
    ctx.fillStyle = colours.text;
    ctx.fillText(text, x + w / 2, y + h / 2);

    // Add hover effect
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.rect(x, y, w, h);
    ctx.stroke();

  }


  /**
   * Clears the HUD overlay.
   */
  clearHud = () => {
    this.ctx.clearRect(0, 0, this.engine.ctx.canvas.width, this.engine.ctx.canvas.height);
  }

  /**
   * Handles canvas resize events. Updates internal references if needed.
   * @param {number} width - The new canvas width.
   * @param {number} height - The new canvas height.
   * @returns {void}
   */
  handleResize = (width, height) => {
    // HUD context is directly tied to the canvas, so it automatically
    // reflects the new dimensions. This hook is available for any
    // HUD-specific resize handling if needed in the future.
    // Re-acquire context reference in case it changed
    this.ctx = this.engine.ctx;
  }

  /**
   * Sets the backdrop image for cutscenes.
   * @param {Image|null} image - The backdrop image.
   */
  setBackdrop = (image) => {
    this.backdropImage = image;
  }

  /**
   * Sets the cutout images for cutscenes.
   * @param {Array} cutouts - Array of {image, position} objects.
   */
  setCutouts = (cutouts) => {
    this.cutoutImages = cutouts;
  }

  /**
   * Applies style configuration to the canvas context.
   * @param {Object} styleConfig - The style properties to apply.
   * @param {string} [styleConfig.font='20px invasion2000'] - Font style.
   * @param {string} [styleConfig.textAlign='center'] - Text alignment.
   * @param {string} [styleConfig.textBaseline='middle'] - Text baseline.
   * @param {string} [styleConfig.fillStyle='#ffffff'] - Fill color.
   * @param {number} [styleConfig.globalAlpha=1.0] - Global alpha.
   */
  applyStyle = (styleConfig) => {
    // Apply style to the context
    const defaultStyle = {
      font: '20px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: '#ffffff',
      globalAlpha: 1.0,
    };

    Object.assign(this.ctx, defaultStyle, styleConfig);
  }

  /**
   * Writes text to the HUD.
   * @param {string} text - The text to write.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @param {string|null} [src=null] - Optional image source for portrait.
   */
  writeText = (text, x, y, src = null) => {
    // Apply style
    this.applyStyle({
      font: '24px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: '#ffffff',
    });

    if (src) {
      // Draw portrait if set
      this.ctx.drawImage(src, x ?? this.ctx.canvas.clientWidth / 2, y ?? this.ctx.canvas.clientHeight / 2, 76, 76);
      this.ctx.fillText(text, x ?? this.ctx.canvas.clientWidth / 2 + 80, y ?? this.ctx.canvas.clientHeight / 2);
    } else {
      this.ctx.fillText(text, x ?? this.ctx.canvas.clientWidth / 2, y ?? this.ctx.canvas.clientHeight / 2);
    }
  }

  /**
   * Draws the active mode name in the HUD (top-left).
   */
  drawModeLabel = () => {
    try {
      const mode = this.engine?.spritz?.world?.modeManager?.getMode();
      if (!mode) return;
      this.applyStyle({ font: '18px invasion2000', textAlign: 'left', textBaseline: 'top', fillStyle: '#ff0' });
      this.ctx.fillText(`MODE: ${mode}`, 12, 12);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Draws height debug overlay showing tile and sprite heights.
   * Call this after rendering the 3D scene to overlay debug info.
   */
  drawHeightDebugOverlay = () => {
    if (!this.engine?.debugHeightOverlay) return;
    try {
      const world = this.engine?.spritz?.world;
      if (!world) return;
      const { ctx } = this;
      const camera = this.engine?.renderManager?.camera;
      if (!camera) return;

      // Helper to project world position to screen
      const projectToScreen = (worldX, worldY, worldZ) => {
        const gl = this.engine.gl;
        const rm = this.engine.renderManager;
        const modelMat = rm.uModelMat;
        const viewMat = camera.uViewMat;
        const projMat = rm.uProjMat;
        
        // Transform: world -> clip -> NDC -> screen
        const vec4 = [worldX, worldY, worldZ, 1.0];
        // model * vec
        let x = modelMat[0] * vec4[0] + modelMat[4] * vec4[1] + modelMat[8] * vec4[2] + modelMat[12];
        let y = modelMat[1] * vec4[0] + modelMat[5] * vec4[1] + modelMat[9] * vec4[2] + modelMat[13];
        let z = modelMat[2] * vec4[0] + modelMat[6] * vec4[1] + modelMat[10] * vec4[2] + modelMat[14];
        let w = modelMat[3] * vec4[0] + modelMat[7] * vec4[1] + modelMat[11] * vec4[2] + modelMat[15];
        // view * (model * vec)
        const vx = viewMat[0] * x + viewMat[4] * y + viewMat[8] * z + viewMat[12] * w;
        const vy = viewMat[1] * x + viewMat[5] * y + viewMat[9] * z + viewMat[13] * w;
        const vz = viewMat[2] * x + viewMat[6] * y + viewMat[10] * z + viewMat[14] * w;
        const vw = viewMat[3] * x + viewMat[7] * y + viewMat[11] * z + viewMat[15] * w;
        // proj * (view * model * vec)
        const px = projMat[0] * vx + projMat[4] * vy + projMat[8] * vz + projMat[12] * vw;
        const py = projMat[1] * vx + projMat[5] * vy + projMat[9] * vz + projMat[13] * vw;
        const pw = projMat[3] * vx + projMat[7] * vy + projMat[11] * vz + projMat[15] * vw;
        // NDC
        if (Math.abs(pw) < 0.0001) return null; // behind camera or at infinity
        const ndcX = px / pw;
        const ndcY = py / pw;
        // screen
        const screenX = (ndcX * 0.5 + 0.5) * gl.canvas.width;
        const screenY = (1.0 - (ndcY * 0.5 + 0.5)) * gl.canvas.height;
        return { x: screenX, y: screenY, behind: pw < 0 };
      };

      this.applyStyle({ font: '12px monospace', textAlign: 'center', textBaseline: 'middle', fillStyle: '#0f0' });

      // Draw tile heights
      world.zoneList.forEach((zone) => {
        if (!zone.loaded || !zone.zoneData?.cells) return;
        const cells = zone.zoneData.cells;
        for (let row = 0; row < cells.length; row++) {
          for (let col = 0; col < cells[row].length; col++) {
            try {
              const tileHeight = zone.getHeight(col + 0.5, row + 0.5);
              const screenPos = projectToScreen(col + 0.5, row + 0.5, tileHeight);
              if (screenPos && !screenPos.behind) {
                ctx.fillStyle = '#0ff';
                ctx.fillText(`${tileHeight.toFixed(2)}`, screenPos.x, screenPos.y);
              }
            } catch (e) {
              // ignore projection errors
            }
          }
        }
      });

      // Draw sprite heights
      this.applyStyle({ font: '14px monospace', textAlign: 'center', textBaseline: 'bottom', fillStyle: '#ff0' });
      world.spriteList.forEach((sprite) => {
        if (!sprite.pos) return;
        try {
          const screenPos = projectToScreen(sprite.pos.x, sprite.pos.y, sprite.pos.z + 0.5);
          if (screenPos && !screenPos.behind) {
            ctx.fillStyle = '#ff0';
            ctx.fillText(`${sprite.id}: z=${sprite.pos.z.toFixed(2)}`, screenPos.x, screenPos.y);
          }
        } catch (e) {
          // ignore projection errors
        }
      });

      // Draw object heights
      this.applyStyle({ font: '14px monospace', textAlign: 'center', textBaseline: 'bottom', fillStyle: '#f0f' });
      world.objectList.forEach((obj) => {
        if (!obj.pos) return;
        try {
          const screenPos = projectToScreen(obj.pos.x, obj.pos.y, obj.pos.z + 0.5);
          if (screenPos && !screenPos.behind) {
            ctx.fillStyle = '#f0f';
            ctx.fillText(`${obj.id}: z=${obj.pos.z.toFixed(2)}`, screenPos.x, screenPos.y);
          }
        } catch (e) {
          // ignore projection errors
        }
      });
    } catch (e) {
      console.warn('drawHeightDebugOverlay error:', e);
    }
  }

  /**
   * Draws the backdrop and cutouts for cutscenes.
   */
  drawCutsceneElements = () => {
    const { ctx } = this;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Draw backdrop if set
    if (this.backdropImage) {
      ctx.drawImage(this.backdropImage, 0, 0, canvasWidth, canvasHeight);
    }

    // Draw cutouts
    this.cutoutImages.forEach(({ image, position }) => {
      if (image) {
        const x = position === 'left' ? 50 : canvasWidth - 250;
        const y = canvasHeight / 2 - 100;
        const width = 200;
        const height = 200;
        if (position === 'right') {
          // Mirror for right side
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(image, -x - width, y, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(image, x, y, width, height);
        }
      }
    });
  }

  /**
   * Creates a scrolling textbox for dialogue.
   * @param {string} text - The text to display.
   * @param {boolean} [scrolling=false] - Whether to enable scrolling.
   * @param {Object} [options={}] - Additional options for the textbox.
   * @returns {textScrollBox} The created textbox instance.
   */
  scrollText = (text, scrolling = false, options = {}) => {
    // Draw cutscene elements first (backdrop and cutouts)
    this.drawCutsceneElements();

    let txt = new textScrollBox(this.engine.ctx);
    txt.init(text, 10, (2 * this.engine.ctx.canvas.height) / 3, this.engine.ctx.canvas.width - 20, this.engine.ctx.canvas.height / 3 - 20, options);
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  }
}

/**
 * textScrollBox - A scrolling text box UI for dialogue.
 * Courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
 */
export class textScrollBox {
  /**
   * Creates an instance of textScrollBox.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.dirty = true; // indicates that variouse setting need update
    this.scrollY = 0;
    this.fontSize = 24;
    this.font = 'minecraftia';
    this.align = 'left';
    this.background = '#333';
    this.border = {
      lineWidth: 2,
      style: '#fff',
      corner: 'round',
    };
    this.scrollBox = {
      width: 5,
      background: '#777',
      color: '#999',
    };
    this.fontStyle = '#fff';
    this.lines = [];
    this.x = 0;
    this.y = 0;
  }

  /**
   * Initializes the textbox.
   * @param {string} text - The text to display.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @param {number} width - The width.
   * @param {number} height - The height.
   * @param {Object} [options={}] - Additional options.
   */
  init = (text, x, y, width, height, options = {}) => {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.portrait = options.portrait ?? null;
    this.setOptions(options);
    this.cleanit();
  }

  /**
   * Cleans and formats the text.
   * @param {boolean} [dontFitText=false] - Whether to skip fitting text.
   */
  cleanit = (dontFitText) => {
    if (this.dirty) {
      this.setFont();
      this.getTextPos();
      this.dirty = false;
      if (!dontFitText) {
        this.fitText();
      }
    }
  }

  /**
   * Applies options to the textbox.
   * @param {Object} options - The options to apply.
   */
  setOptions = (options) => {
    Object.keys(this).forEach((key) => {
      if (options[key] !== undefined) {
        this[key] = options[key];
        this.dirty = true;
      }
    });
  }

  /**
   * Applies the font settings.
   */
  setFont = () => {
    this.fontStr = this.fontSize + 'px ' + this.font;
    this.textHeight = this.fontSize + Math.ceil(this.fontSize * 0.05);
  }

  /**
   * Gets the text position.
   */
  getTextPos = () => {
    if (this.align === 'left') {
      this.textPos = 2;
    } else if (this.align === 'right') {
      this.textPos = Math.floor(this.width - this.scrollBox.width - this.fontSize / 4);
    } else {
      this.textPos = Math.floor((this.width - -this.scrollBox.width) / 2);
    }
  }

  /**
   * Fits the text to the textbox.
   */
  fitText = () => {
    let { ctx } = this;
    this.cleanit(true); // MUST PASS TRUE or will recurse to call stack overflow
    ctx.font = this.fontStr;
    ctx.textAlign = this.align;
    ctx.textBaseline = 'top';
    let words = this.text.split(' ');
    this.lines.length = 0;
    let line = '';
    let space = '';
    while (words.length > 0) {
      let word = words.shift();
      let width = ctx.measureText(line + space + word).width;
      if (width < this.width - this.scrollBox.width - this.scrollBox.width - (this.portrait ? 84 : 0)) {
        line += space + word;
        space = ' ';
      } else {
        if (space === '') {
          // if one word too big put it in anyways
          line += word;
        } else {
          words.unshift(word);
        }
        this.lines.push(line);
        space = '';
        line = '';
      }
    }
    if (line !== '') {
      this.lines.push(line);
    }
    this.maxScroll = (this.lines.length + 0.5) * this.textHeight - this.height;
  }

  /**
   * Draws the textbox border.
   * @param {boolean} [portrait=false] - Whether to include portrait space.
   */
  drawBorder = (portrait = false) => {
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

  /**
   * Draws the scrollbar on the side.
   */
  drawScrollBox = () => {
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

  /**
   * Draws the portrait.
   */
  drawPortrait = () => {
    let { ctx } = this;
    ctx.drawImage(this.portrait.image, this.x, this.y + 38, 76, 76);
  }

  /**
   * Scrolls to a position.
   * @param {number} pos - The scroll position.
   */
  scroll = (pos) => {
    this.cleanit();
    this.scrollY = -pos;
    if (this.scrollY > 0) {
      this.scrollY = 0;
    } else if (this.scrollY < -this.maxScroll) {
      this.scrollY = -this.maxScroll;
    }
  }

  /**
   * Scrolls by lines.
   * @param {number} x - The number of lines to scroll.
   */
  scrollLines = (x) => {
    this.cleanit();
    this.scrollY = -this.textHeight * x;
    if (this.scrollY > 0) {
      this.scrollY = 0;
    } else if (this.scrollY < -this.maxScroll) {
      this.scrollY = -this.maxScroll;
    }
  }

  /**
   * Renders the textbox.
   */
  render = () => {
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
