import GLEngine from '../index.js';

export const minecraftia = new FontFace('minecraftia', 'url(/pixos/font/minecraftia.ttf)');

export default class Hud {
  /**
   *
   * @param {GLEngine} engine
   * @returns
   */
  constructor(engine) {
    if (!Hud._instance) {
      this.engine = engine;
      Hud._instance = this;
    }
    return Hud._instance;
  }

  init = () => {
    // setup anything needed at the start (run once)
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
   * clear HUD overlay
   */
  clearHud = () => {
    this.ctx.clearRect(0, 0, this.engine.ctx.canvas.width, this.engine.ctx.canvas.height);
  }

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
   * Write Text to HUD
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} src
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
   * Scrolling Textbox
   * @param {string} text
   * @param {boolean} scrolling
   * @param {*} options
   * @returns
   */
  scrollText = (text, scrolling = false, options = {}) => {
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

export class textScrollBox {
  /**
   * Scrolling Text Box UI (For Dialogue)
   * --> courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
   * @param {*} ctx
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
   * initialize textbox
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {*} options
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
   * Clean & format text
   * @param {boolean} dontFitText
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
   * Apply options
   * @param {*} options
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
   * Apply font
   */
  setFont = () => {
    this.fontStr = this.fontSize + 'px ' + this.font;
    this.textHeight = this.fontSize + Math.ceil(this.fontSize * 0.05);
  }

  /**
   * Get Text Position
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
   * Fit to Text box
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
   * Draw Textbox border
   * @param {boolean} portrait
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
   * Draw Scrollbar on the side
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
   * Draw Scrollbar on the side
   */
  drawPortrait = () => {
    let { ctx } = this;
    ctx.drawImage(this.portrait.image, this.x, this.y + 38, 76, 76);
  }

  /**
   * Scroll to position
   * @param {number} pos
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
   * Scroll to position
   * @param {number} x
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
   * Draw
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
