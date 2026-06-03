/**
 * Block - 单个积木块
 */

const { GameConfig } = require('../GameConfig.js');
const { rotateN } = require('./ShapeUtils.js');

const BlockState = {
  IN_TRAY: 'in_tray',
  DRAGGING: 'dragging',
  PLACED: 'placed',
};

class Block {
  constructor(data) {
    this.id = data.id;
    this.shape = data.shape;
    this.color = data.color;
    this.rotation = 0;

    this.state = BlockState.IN_TRAY;

    this.trayX = 0;
    this.trayY = 0;
    this.trayCellSize = GameConfig.block.cellSize;

    this.dragX = 0;
    this.dragY = 0;

    this.gridRow = -1;
    this.gridCol = -1;
  }

  currentShape() {
    return rotateN(this.shape, this.rotation);
  }

  rotate() {
    this.rotation = (this.rotation + 1) % 4;
  }

  shapeSize() {
    const s = this.currentShape();
    return { rows: s.length, cols: s[0].length };
  }

  hitTestTray(x, y) {
    if (this.state !== BlockState.IN_TRAY) return false;
    const { rows, cols } = this.shapeSize();
    const w = cols * this.trayCellSize;
    const h = rows * this.trayCellSize;
    return x >= this.trayX && x <= this.trayX + w && y >= this.trayY && y <= this.trayY + h;
  }

  renderInTray(ctx) {
    const cs = this.trayCellSize;
    const shape = this.currentShape();
    ctx.fillStyle = this.color;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          this._cell(ctx, this.trayX + j * cs, this.trayY + i * cs, cs, 6);
        }
      }
    }
  }

  renderDragging(ctx, cellSize) {
    const shape = this.currentShape();
    const { rows, cols } = this.shapeSize();
    const w = cols * cellSize;
    const h = rows * cellSize;
    const startX = this.dragX - w / 2;
    const startY = this.dragY - h / 2;

    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          this._cell(ctx, startX + j * cellSize, startY + i * cellSize, cellSize, 6);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  _cell(ctx, x, y, size, radius) {
    const r = radius;
    const w = size - 2;
    const h = size - 2;
    x += 1;
    y += 1;
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
    ctx.fill();
  }
}

module.exports = { Block, BlockState };
