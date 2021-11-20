"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textScrollBox = exports.minecraftia = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var minecraftia = new FontFace("minecraftia", "url(/minecraftia.ttf)"); // Scrolling Text Box UI (For Dialogue)

exports.minecraftia = minecraftia;

var textScrollBox = /*#__PURE__*/function () {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  function textScrollBox(ctx) {
    _classCallCheck(this, textScrollBox);

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
      corner: "round"
    };
    this.scrollBox = {
      width: 5,
      background: "#568",
      color: "#78a"
    };
    this.fontStyle = "white";
    this.lines = [];
  } // initialize widget


  _createClass(textScrollBox, [{
    key: "init",
    value: function init(text, x, y, width, height) {
      var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      this.text = text;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.setOptions(options);
      this.cleanit();
    } // Clean & format text

  }, {
    key: "cleanit",
    value: function cleanit(dontFitText) {
      if (this.dirty) {
        this.setFont();
        this.getTextPos();
        this.dirty = false;

        if (!dontFitText) {
          this.fitText();
        }
      }
    } // Apply options

  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var _this = this;

      Object.keys(this).forEach(function (key) {
        if (options[key] !== undefined) {
          _this[key] = options[key];
          _this.dirty = true;
        }
      });
    } // Apply font

  }, {
    key: "setFont",
    value: function setFont() {
      this.fontStr = this.fontSize + "px " + this.font;
      this.textHeight = this.fontSize + Math.ceil(this.fontSize * 0.05);
    } // Get Text Position

  }, {
    key: "getTextPos",
    value: function getTextPos() {
      if (this.align === "left") {
        this.textPos = 0;
      } else if (this.align === "right") {
        this.textPos = Math.floor(this.width - this.scrollBox.width - this.fontSize / 4);
      } else {
        this.textPos = Math.floor((this.width - -this.scrollBox.width) / 2);
      }
    } // Fit to Text box

  }, {
    key: "fitText",
    value: function fitText() {
      var ctx = this.ctx;
      this.cleanit(true); // MUST PASS TRUE or will recurse to call stack overflow

      ctx.font = this.fontStr;
      ctx.textAlign = this.align;
      ctx.textBaseline = "top";
      var words = this.text.split(" ");
      this.lines.length = 0;
      var line = "";
      var space = "";

      while (words.length > 0) {
        var word = words.shift();
        var width = ctx.measureText(line + space + word).width;

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
    } // Draw Textbox border

  }, {
    key: "drawBorder",
    value: function drawBorder() {
      var ctx = this.ctx;
      var bw = this.border.lineWidth / 2;
      ctx.lineJoin = this.border.corner;
      ctx.lineWidth = this.border.lineWidth;
      ctx.strokeStyle = this.border.style;
      ctx.strokeRect(this.x - bw, this.y - bw, this.width + 2 * bw, this.height + 2 * bw);
    } // Draw Scrollbar on the side

  }, {
    key: "drawScrollBox",
    value: function drawScrollBox() {
      var ctx = this.ctx;
      var scale = this.height / (this.lines.length * this.textHeight);
      ctx.fillStyle = this.scrollBox.background;
      ctx.fillRect(this.x + this.width - this.scrollBox.width, this.y, this.scrollBox.width, this.height);
      ctx.fillStyle = this.scrollBox.color;
      var barsize = this.height * scale;

      if (barsize > this.height) {
        barsize = this.height;
      }

      ctx.fillRect(this.x + this.width - this.scrollBox.width, this.y - this.scrollY * scale, this.scrollBox.width, barsize);
    } // Scroll to position

  }, {
    key: "scroll",
    value: function scroll(pos) {
      this.cleanit();
      this.scrollY = -pos;

      if (this.scrollY > 0) {
        this.scrollY = 0;
      } else if (this.scrollY < -this.maxScroll) {
        this.scrollY = -this.maxScroll;
      }
    } // Scroll to position

  }, {
    key: "scrollLines",
    value: function scrollLines(x) {
      this.cleanit();
      this.scrollY = -this.textHeight * x;

      if (this.scrollY > 0) {
        this.scrollY = 0;
      } else if (this.scrollY < -this.maxScroll) {
        this.scrollY = -this.maxScroll;
      }
    } // Draw

  }, {
    key: "render",
    value: function render() {
      var ctx = this.ctx;
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
      ctx.clip(); // Important text does not like being place at fractions of a pixel

      ctx.setTransform(1, 0, 0, 1, this.x, Math.floor(this.y + this.scrollY));
      ctx.fillStyle = this.fontStyle;

      for (var i = 0; i < this.lines.length; i++) {
        // Important text does not like being place at fractions of a pixel
        ctx.fillText(this.lines[i], this.textPos, Math.floor(i * this.textHeight));
      }

      ctx.restore(); // remove the clipping
    }
  }]);

  return textScrollBox;
}();

exports.textScrollBox = textScrollBox;