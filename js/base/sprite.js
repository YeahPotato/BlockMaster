/**
 * 方块大师 - 基础渲染类
 */

class Sprite {
  constructor(ctx, x, y, width, height) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.alpha = 1;
  }

  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  update(dt) {}

  render() {}
}

class Rect extends Sprite {
  constructor(ctx, x, y, width, height, color, radius = 0) {
    super(ctx, x, y, width, height);
    this.color = color;
    this.radius = radius;
    this.borderWidth = 0;
    this.borderColor = null;
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    this._roundRect(ctx, this.x, this.y, this.width, this.height, this.radius);
    ctx.fill();
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      this._roundRect(ctx, this.x, this.y, this.width, this.height, this.radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
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
}

class Text extends Sprite {
  constructor(ctx, text, x, y, opts = {}) {
    super(ctx, x, y, 0, 0);
    this.text = text;
    this.color = opts.color || '#2C3E50';
    this.size = opts.size || 28;
    this.bold = opts.bold || false;
    this.align = opts.align || 'left';
    this.baseline = opts.baseline || 'top';
    this.family = opts.family || 'PingFang SC, sans-serif';
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    const weight = this.bold ? 'bold ' : '';
    ctx.font = `${weight}${this.size}px ${this.family}`;
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class Button extends Rect {
  constructor(ctx, x, y, width, height, label, opts = {}) {
    super(ctx, x, y, width, height, opts.bg || '#FFB400', opts.radius || 24);
    this.label = label;
    this.labelColor = opts.color || '#FFFFFF';
    this.fontSize = opts.fontSize || 36;
    this.bold = opts.bold !== false;
    this.enabled = true;
    this.pressed = false;
  }

  render() {
    super.render();
    if (!this.visible) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.labelColor;
    ctx.font = `${this.bold ? 'bold ' : ''}${this.fontSize}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
    ctx.restore();
  }

  hitTest(px, py) {
    return this.enabled && this.visible && this.contains(px, py);
  }
}

module.exports = { Sprite, Rect, Text, Button };
