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
      this.textPos = 0;
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
      if (width < this.width - this.scrollBox.width - this.scrollBox.width) {
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
  drawBorder() {
    let { ctx } = this;
    let bw = this.border.lineWidth / 2;
    ctx.lineJoin = this.border.corner;
    ctx.lineWidth = this.border.lineWidth;
    ctx.strokeStyle = this.border.style;
    ctx.strokeRect(this.x - bw, this.y - bw, this.width + 2 * bw, this.height + 2 * bw);
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
    this.drawBorder();
    ctx.save(); // need this to reset the clip area
    ctx.fillStyle = this.background;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    this.drawScrollBox();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width - this.scrollBox.width, this.height);
    ctx.clip();
    // Important text does not like being place at fractions of a pixel
    ctx.setTransform(1, 0, 0, 1, this.x, Math.floor(this.y + this.scrollY));
    ctx.fillStyle = this.fontStyle;
    for (let i = 0; i < this.lines.length; i++) {
      // Important text does not like being place at fractions of a pixel
      ctx.fillText(this.lines[i], this.textPos, Math.floor(i * this.textHeight));
    }
    ctx.restore(); // remove the clipping
  }
}
