/**
 * Grid - 棋盘网格
 */

const { GameConfig } = require('../GameConfig.js');
const { rotateN, shapeCells } = require('./ShapeUtils.js');

class Grid {
  constructor(levelData) {
    this.width = levelData.gridSize.width;
    this.height = levelData.gridSize.height;

    this.targetSet = new Set(levelData.targetCells.map(([r, c]) => `${r},${c}`));
    this.occupied = new Map();
    this.placedBlocks = new Map();

    this.cellSize = GameConfig.grid.cellSize;
    this.gap = GameConfig.grid.cellGap;
    this.x = 0;
    this.y = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  fitToWidth(availableWidth, maxCellSize = 100) {
    const totalGap = (this.width + 1) * this.gap;
    const cellSize = Math.floor((availableWidth - totalGap) / this.width);
    this.cellSize = Math.min(cellSize, maxCellSize);
    return this.cellSize;
  }

  pixelWidth() {
    return this.width * this.cellSize + (this.width + 1) * this.gap;
  }

  pixelHeight() {
    return this.height * this.cellSize + (this.height + 1) * this.gap;
  }

  screenToGrid(sx, sy) {
    const lx = sx - this.x;
    const ly = sy - this.y;
    if (lx < 0 || ly < 0) return null;
    const col = Math.floor((lx - this.gap) / (this.cellSize + this.gap));
    const row = Math.floor((ly - this.gap) / (this.cellSize + this.gap));
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return null;
    return { row, col };
  }

  gridToScreen(row, col) {
    return {
      x: this.x + this.gap + col * (this.cellSize + this.gap),
      y: this.y + this.gap + row * (this.cellSize + this.gap),
    };
  }

  isTarget(row, col) {
    return this.targetSet.has(`${row},${col}`);
  }

  isOccupied(row, col) {
    return this.occupied.has(`${row},${col}`);
  }

  canPlace(shape, rotation, row, col, ignoreBlockId = null) {
    const rotated = rotateN(shape, rotation);
    const cells = shapeCells(rotated);
    for (const [dr, dc] of cells) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= this.height || c < 0 || c >= this.width) return false;
      if (!this.isTarget(r, c)) return false;
      const key = `${r},${c}`;
      if (this.occupied.has(key) && this.occupied.get(key) !== ignoreBlockId) return false;
    }
    return true;
  }

  placeBlock(blockId, shape, rotation, row, col, color) {
    const rotated = rotateN(shape, rotation);
    const cells = shapeCells(rotated).map(([dr, dc]) => [row + dr, col + dc]);
    for (const [r, c] of cells) {
      this.occupied.set(`${r},${c}`, blockId);
    }
    this.placedBlocks.set(blockId, { cells, color, shape, rotation, row, col });
  }

  removeBlock(blockId) {
    const info = this.placedBlocks.get(blockId);
    if (!info) return;
    for (const [r, c] of info.cells) {
      this.occupied.delete(`${r},${c}`);
    }
    this.placedBlocks.delete(blockId);
  }

  isComplete() {
    if (this.occupied.size !== this.targetSet.size) return false;
    for (const key of this.targetSet) {
      if (!this.occupied.has(key)) return false;
    }
    return true;
  }

  reset() {
    this.occupied.clear();
    this.placedBlocks.clear();
  }

  render(ctx) {
    const cs = this.cellSize;
    const radius = GameConfig.grid.borderRadius;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const pos = this.gridToScreen(r, c);
        if (this.isTarget(r, c)) {
          ctx.fillStyle = GameConfig.grid.targetColor;
        } else {
          ctx.fillStyle = GameConfig.grid.emptyColor;
        }
        this._roundRect(ctx, pos.x, pos.y, cs, cs, radius);
        ctx.fill();
      }
    }

    for (const [, info] of this.placedBlocks) {
      ctx.fillStyle = info.color;
      for (const [r, c] of info.cells) {
        const pos = this.gridToScreen(r, c);
        this._roundRect(ctx, pos.x, pos.y, cs, cs, radius);
        ctx.fill();
      }
    }
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

module.exports = { Grid };
