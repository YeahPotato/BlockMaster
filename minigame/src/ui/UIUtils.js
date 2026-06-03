/**
 * UI 工具
 */

const { GameConfig } = require('../GameConfig.js');

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

class Button {
  constructor({ x, y, w, h, text, bgColor, textColor, fontSize, onClick }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.bgColor = bgColor || '#339AF0';
    this.textColor = textColor || '#fff';
    this.fontSize = fontSize || 28;
    this.onClick = onClick;
    this._pressed = false;
  }

  hitTest(x, y) {
    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
  }

  onTouchStart(x, y) {
    if (this.hitTest(x, y)) {
      this._pressed = true;
      return true;
    }
    return false;
  }

  onTouchEnd(x, y) {
    const hit = this.hitTest(x, y);
    const wasPressed = this._pressed;
    this._pressed = false;
    if (hit && wasPressed && this.onClick) {
      this.onClick();
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    if (this._pressed) ctx.globalAlpha = 0.7;
    ctx.fillStyle = this.bgColor;
    drawRoundRect(ctx, this.x, this.y, this.w, this.h, 16);
    ctx.fill();

    ctx.fillStyle = this.textColor;
    ctx.font = `bold ${this.fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);
    ctx.restore();
  }
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.save();
  ctx.fillStyle = options.color || '#333';
  ctx.font = `${options.bold ? 'bold ' : ''}${options.size || 24}px ${options.family || 'sans-serif'}`;
  ctx.textAlign = options.align || 'left';
  ctx.textBaseline = options.baseline || 'top';
  ctx.fillText(text, x, y);
  ctx.restore();
}

module.exports = { drawRoundRect, Button, drawText };
