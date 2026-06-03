/**
 * 游戏主玩法场景
 */

const { GameConfig } = require('../GameConfig.js');
const { SceneManager } = require('../core/SceneManager.js');
const { Grid } = require('../core/Grid.js');
const { Block, BlockState } = require('../core/Block.js');
const { SkinSystem } = require('../system/SkinSystem.js');
const { RewardSystem } = require('../system/RewardSystem.js');
const { AdManager } = require('../ad/AdManager.js');
const { Button, drawText, drawRoundRect } = require('./UIUtils.js');

class GameScene {
  constructor(levelData) {
    this.levelData = levelData;
    this.grid = null;
    this.blocks = [];

    this.draggingBlock = null;
    this.dragStartTime = 0;
    this.dragStartPos = null;
    this.lastTapTime = 0;
    this.lastTapBlockId = null;

    this.startTime = Date.now();
    this.timeUsedSec = 0;
    this.usedHint = false;

    this.buttons = [];
    this.complete = false;
  }

  onEnter() {
    this._buildGrid();
    this._buildBlocks();
    this._buildButtons();
  }

  _buildGrid() {
    const W = GameConfig.canvas.width;
    this.grid = new Grid(this.levelData);
    const targetWidth = W * 0.85;
    this.grid.fitToWidth(targetWidth, 90);

    const gridW = this.grid.pixelWidth();
    const x = (W - gridW) / 2;
    const y = 220;
    this.grid.setPosition(x, y);
  }

  _buildBlocks() {
    const colors = SkinSystem.getCurrentColors();

    this.blocks = this.levelData.availableBlocks.map((data, idx) => {
      const block = new Block({
        id: data.id || `block_${idx}`,
        shape: data.shape,
        color: colors[idx % colors.length],
      });
      block.trayCellSize = 36;
      return block;
    });

    this._layoutTray();
  }

  _layoutTray() {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    const trayY = this.grid.y + this.grid.pixelHeight() + 60;
    const trayHeight = H - trayY - 120;

    const padding = 20;
    const trayBlocks = this.blocks.filter((b) => b.state === BlockState.IN_TRAY);
    if (trayBlocks.length === 0) return;

    const slotWidth = (W - padding * 2) / trayBlocks.length;

    trayBlocks.forEach((block, idx) => {
      const slotX = padding + idx * slotWidth;
      const { rows, cols } = block.shapeSize();
      const blockW = cols * block.trayCellSize;
      const blockH = rows * block.trayCellSize;

      block.trayX = slotX + (slotWidth - blockW) / 2;
      block.trayY = trayY + (trayHeight - blockH) / 2;
    });
  }

  _buildButtons() {
    const W = GameConfig.canvas.width;

    this.buttons = [
      new Button({
        x: 20, y: 40, w: 100, h: 60,
        text: '< 返回',
        bgColor: '#ADB5BD',
        fontSize: 24,
        onClick: () => {
          const { ChapterScene } = require('./ChapterScene.js');
          SceneManager.replace(new ChapterScene());
        },
      }),
      new Button({
        x: W - 220, y: 40, w: 100, h: 60,
        text: '🔄重置',
        bgColor: '#FFA94D',
        fontSize: 22,
        onClick: () => this._resetLevel(),
      }),
      new Button({
        x: W - 110, y: 40, w: 90, h: 60,
        text: '💡提示',
        bgColor: '#51CF66',
        fontSize: 22,
        onClick: () => this._useHint(),
      }),
    ];
  }

  _resetLevel() {
    this.grid.reset();
    for (const b of this.blocks) {
      b.state = BlockState.IN_TRAY;
      b.rotation = 0;
    }
    this._layoutTray();
    this.complete = false;
  }

  async _useHint() {
    if (this.usedHint) {
      const ok = await AdManager.showRewardVideo('hint');
      if (!ok) return;
    } else {
      this.usedHint = true;
    }
    console.log('[Hint] 提示功能：自动放置一个正确的块（待实现）');
  }

  onTouchStart(x, y) {
    for (const b of this.buttons) {
      if (b.onTouchStart(x, y)) return;
    }

    const hitPlaced = this._hitTestPlaced(x, y);
    if (hitPlaced) {
      const now = Date.now();
      if (now - this.lastTapTime < 300 && this.lastTapBlockId === hitPlaced.id) {
        this._returnBlockToTray(hitPlaced);
        this.lastTapTime = 0;
        this.lastTapBlockId = null;
      } else {
        this.lastTapTime = now;
        this.lastTapBlockId = hitPlaced.id;
      }
      return;
    }

    for (const block of this.blocks) {
      if (block.state === BlockState.IN_TRAY && block.hitTestTray(x, y)) {
        this.draggingBlock = block;
        block.state = BlockState.DRAGGING;
        block.dragX = x;
        block.dragY = y;
        this.dragStartTime = Date.now();
        this.dragStartPos = { x, y };
        return;
      }
    }
  }

  onTouchMove(x, y) {
    if (this.draggingBlock) {
      this.draggingBlock.dragX = x;
      this.draggingBlock.dragY = y;
    }
  }

  onTouchEnd(x, y) {
    for (const b of this.buttons) {
      if (b.onTouchEnd(x, y)) {
        this.draggingBlock = null;
        return;
      }
    }

    if (this.draggingBlock) {
      const block = this.draggingBlock;
      const dragDist = this.dragStartPos
        ? Math.hypot(x - this.dragStartPos.x, y - this.dragStartPos.y)
        : 0;
      const dragDuration = Date.now() - this.dragStartTime;

      if (dragDist < 15 && dragDuration < 300) {
        block.rotate();
        block.state = BlockState.IN_TRAY;
        this._layoutTray();
        this.draggingBlock = null;
        return;
      }

      this._tryPlace(block, x, y);
      this.draggingBlock = null;
    }
  }

  _tryPlace(block, dragCenterX, dragCenterY) {
    const cellSize = this.grid.cellSize + this.grid.gap;
    const { rows, cols } = block.shapeSize();
    const halfW = (cols * cellSize) / 2;
    const halfH = (rows * cellSize) / 2;
    const topLeftX = dragCenterX - halfW;
    const topLeftY = dragCenterY - halfH;

    const gridPos = this.grid.screenToGrid(topLeftX + cellSize / 2, topLeftY + cellSize / 2);
    if (!gridPos) {
      block.state = BlockState.IN_TRAY;
      this._layoutTray();
      return;
    }

    if (this.grid.canPlace(block.shape, block.rotation, gridPos.row, gridPos.col)) {
      this.grid.placeBlock(block.id, block.shape, block.rotation, gridPos.row, gridPos.col, block.color);
      block.state = BlockState.PLACED;
      block.gridRow = gridPos.row;
      block.gridCol = gridPos.col;
      this._layoutTray();
      this._checkComplete();
    } else {
      block.state = BlockState.IN_TRAY;
      this._layoutTray();
    }
  }

  _hitTestPlaced(x, y) {
    for (const block of this.blocks) {
      if (block.state !== BlockState.PLACED) continue;
      const info = this.grid.placedBlocks.get(block.id);
      if (!info) continue;
      for (const [r, c] of info.cells) {
        const pos = this.grid.gridToScreen(r, c);
        if (
          x >= pos.x && x <= pos.x + this.grid.cellSize &&
          y >= pos.y && y <= pos.y + this.grid.cellSize
        ) {
          return block;
        }
      }
    }
    return null;
  }

  _returnBlockToTray(block) {
    this.grid.removeBlock(block.id);
    block.state = BlockState.IN_TRAY;
    this._layoutTray();
  }

  _checkComplete() {
    if (this.grid.isComplete()) {
      this.complete = true;
      this._onLevelComplete();
    }
  }

  _onLevelComplete() {
    this.timeUsedSec = Math.floor((Date.now() - this.startTime) / 1000);
    const stars = this._calculateStars();
    const reward = RewardSystem.applyLevelReward(this.levelData, stars, this.timeUsedSec);

    setTimeout(() => {
      const { ResultScene } = require('./ResultScene.js');
      SceneManager.push(new ResultScene(this.levelData, stars, this.timeUsedSec, reward));
    }, 600);
  }

  _calculateStars() {
    let stars = 1;
    if (!this.usedHint) stars = 2;
    const timeThreshold = 30 + this.levelData.difficulty * 15;
    if (!this.usedHint && this.timeUsedSec <= timeThreshold) stars = 3;
    return stars;
  }

  update(dt) {}

  render(ctx) {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, W, H);

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    drawText(ctx, `第 ${this.levelData.levelInChapter} 关`, W / 2, 60, {
      size: 36, bold: true, color: '#333', align: 'center',
    });
    drawText(ctx, `⏱ ${elapsed}s`, W / 2, 120, {
      size: 24, color: '#888', align: 'center',
    });

    drawText(ctx, '拖拽方块到棋盘上，单击旋转', W / 2, 170, {
      size: 22, color: '#999', align: 'center',
    });

    this.grid.render(ctx);

    const trayY = this.grid.y + this.grid.pixelHeight() + 30;
    const trayH = H - trayY - 100;
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, 10, trayY, W - 20, trayH, 16);
    ctx.fill();

    drawText(ctx, '可用方块', 30, trayY + 16, {
      size: 22, color: '#888',
    });

    for (const block of this.blocks) {
      if (block.state === BlockState.IN_TRAY) {
        block.renderInTray(ctx);
      }
    }

    if (this.draggingBlock) {
      this.draggingBlock.renderDragging(ctx, this.grid.cellSize);
    }

    for (const b of this.buttons) b.render(ctx);
  }
}

module.exports = { GameScene };
