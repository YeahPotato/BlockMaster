/**
 * 方块大师 - 游戏场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class GameScene {
  constructor(ctx, databus, params = {}, scale = 1) {
    this.ctx = ctx;
    this.databus = databus;
    this.params = params;
    this.scale = scale;
    this.W = DESIGN_W;
    this.H = DESIGN_H;
    this.init();
  }

  init() {
    const { chapter = 1, level = 1 } = this.params;
    this.chapter = chapter;
    this.level = level;
    this.levelKey = `${chapter}-${level}`;
    
    // 棋盘配置
    this.gridSize = 8; // 8x8
    this.cellSize = 70;
    this.padding = 40;
    
    // 计算棋盘位置
    const boardW = this.gridSize * this.cellSize;
    const boardH = this.gridSize * this.cellSize;
    this.boardX = (this.W - boardW) / 2;
    this.boardY = 200;
    
    // 目标格（示例数据，实际应从关卡数据加载）
    this.targetCells = this._generateTargetCells();
    
    // 积木
    this.blocks = this._generateBlocks();
    this.placedBlocks = [];
    
    // 拖拽状态
    this.dragging = null;
    
    // 工具栏按钮
    this.toolButtons = [];
    this._createToolButtons();
    
    // 顶部按钮
    this.topButtons = [];
    this._createTopButtons();
    
    // 计时
    this.startTime = Date.now();
    this.elapsedTime = 0;
    
    // 提示次数
    this.hintTickets = this.databus.save.hintTickets || 3;
    this.hintTicketsUsed = 0;
    
    // 撤销栈
    this.undoStack = [];
    
    // 胜利状态
    this.winState = null; // { stars, reward, time }
  }

  _generateTargetCells() {
    // 简单示例：随机生成一些目标格
    const cells = [];
    for (let i = 0; i < 20; i++) {
      cells.push({
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      });
    }
    return cells;
  }

  _generateBlocks() {
    // 简单示例：生成 4 块积木
    const shapes = [
      [[1, 1], [1, 1]],
      [[1, 1, 1]],
      [[1, 0], [1, 1]],
      [[0, 1], [1, 1], [1, 0]],
    ];
    const colors = ['#5B9DF9', '#FF8B6B', '#6BCB77', '#B084EE'];
    return shapes.map((shape, i) => ({
      id: i,
      shape,
      color: colors[i],
      placed: false,
      x: 0,
      y: 0,
    }));
  }

  _createToolButtons() {
    const W = this.W;
    const btnW = 160, btnH = 80;
    const startX = 30;
    const startY = this.H - 120;
    
    this.toolButtons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, `💡×${this.hintTickets}`, {
        bg: '#FFB400',
        fontSize: 22,
      })
    );
    this.toolButtons.push(
      new Button(this.ctx, startX + btnW + 20, startY, btnW, btnH, '🎯 撤销', {
        bg: '#5B9DF9',
        fontSize: 22,
      })
    );
    this.toolButtons.push(
      new Button(this.ctx, startX + (btnW + 20) * 2, startY, btnW, btnH, '📺 看广告跳关', {
        bg: '#FF8B6B',
        fontSize: 20,
      })
    );
    this.toolButtons.push(
      new Button(this.ctx, startX + (btnW + 20) * 3, startY, btnW, btnH, '🔀 打乱', {
        bg: '#6BCB77',
        fontSize: 22,
      })
    );
  }

  _createTopButtons() {
    // 返回按钮
    this.topButtons.push(
      new Button(this.ctx, 30, 40, 110, 70, '◀ 返回', {
        bg: '#FFFFFF',
        fontSize: 24,
      })
    );
    // 重置按钮
    this.topButtons.push(
      new Button(this.ctx, this.W - 110 - 30, 40, 110, 70, '🔄 重置', {
        bg: '#FFFFFF',
        fontSize: 24,
      })
    );
  }

  update(dt) {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 背景
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, W, H);

    // 顶栏
    this._renderTopBar();

    // 棋盘
    this._renderBoard();

    // 已放置的积木
    for (const block of this.placedBlocks) {
      this._renderBlock(block);
    }

    // 托盘
    this._renderTray();

    // 工具栏
    for (const btn of this.toolButtons) {
      btn.render();
    }

    // 胜利提示
    if (this.checkWin()) {
      this._renderWinOverlay();
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

  _renderTopBar() {
    const ctx = this.ctx;
    const W = this.W;

    // 返回按钮
    for (const btn of this.topButtons) {
      btn.render();
    }

    // 关卡名
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 24px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`第 ${this.chapter}-${this.level} 关`, W / 2 - 60, 75);

    // 计时器
    ctx.fillStyle = '#8693A6';
    ctx.font = '20px PingFang SC, sans-serif';
    const time = this._formatTime(this.elapsedTime);
    ctx.fillText(`⏱ ${time}`, W / 2 + 60, 75);

    // 星级
    ctx.fillStyle = '#FFB400';
    ctx.font = '28px sans-serif';
    ctx.fillText('⭐ ⭐ ⭐', W / 2, 110);
  }

  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _renderBoard() {
    const ctx = this.ctx;
    const { boardX, boardY, cellSize, gridSize, targetCells } = this;

    // 背景
    ctx.fillStyle = '#E9ECEF';
    this._roundRect(ctx, boardX - 10, boardY - 10, 
      gridSize * cellSize + 20, gridSize * cellSize + 20, 16);
    ctx.fill();

    // 网格
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = boardX + c * cellSize;
        const y = boardY + r * cellSize;
        
        // 目标格
        const isTarget = targetCells.some(tc => tc.x === c && tc.y === r);
        if (isTarget) {
          ctx.fillStyle = '#FFE9A0';
        } else {
          ctx.fillStyle = '#FFFFFF';
        }
        this._roundRect(ctx, x, y, cellSize, cellSize, 8);
        ctx.fill();
      }
    }

    // 拖拽预览
    if (this.dragging) {
      this._renderDragPreview();
    }
  }

  _renderDragPreview() {
    const ctx = this.ctx;
    if (!this.dragging || !this.dragging.canPlace) return;
    
    const { block, gridX, gridY } = this.dragging;
    const cellSize = this.cellSize;
    
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          const x = this.boardX + (gridX + c) * cellSize;
          const y = this.boardY + (gridY + r) * cellSize;
          
          ctx.strokeStyle = this.dragging.canPlace ? '#4CAF50' : '#F44336';
          ctx.lineWidth = 2;
          this._roundRect(ctx, x, y, cellSize, cellSize, 8);
          ctx.stroke();
        }
      }
    }
  }

  _renderTray() {
    const ctx = this.ctx;
    const W = this.W;
    const trayY = this.boardY + this.gridSize * this.cellSize + 40;
    const trayH = 180;

    // 背景
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, 20, trayY, W - 40, trayH, 20);
    ctx.fill();

    // 积木
    const startX = 40;
    const gap = 10;
    let x = startX;
    
    for (const block of this.blocks) {
      if (block.placed) continue;
      
      const maxW = block.shape[0].length * this.cellSize;
      const maxH = block.shape.length * this.cellSize;
      
      block.x = x + (this.cellSize - maxW) / 2;
      block.y = trayY + (trayH - maxH) / 2 - 20;
      
      this._renderBlock(block);
      
      x += maxW + gap;
    }
  }

  _renderBlock(block) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          const x = block.x + c * cellSize;
          const y = block.y + r * cellSize;
          
          ctx.fillStyle = block.color;
          this._roundRect(ctx, x, y, cellSize * 0.9, cellSize * 0.9, 6);
          ctx.fill();
          
          // 高光
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          this._roundRect(ctx, x + 4, y + 4, cellSize * 0.35, cellSize * 0.35, 4);
          ctx.fill();
        }
      }
    }
  }

  _renderWinOverlay() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);

    // 弹层
    const boxW = 500, boxH = 380;
    const boxX = (W - boxW) / 2;
    const boxY = (H - boxH) / 2;
    
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.fill();

    // 标题
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 48px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 通关！', W / 2, boxY + 60);

    // 星级
    ctx.fillStyle = '#FFB400';
    ctx.font = '48px sans-serif';
    ctx.fillText(this.winStars, W / 2, boxY + 120);

    // 时间
    ctx.fillStyle = '#8693A6';
    ctx.font = '24px PingFang SC, sans-serif';
    ctx.fillText(`⏱ ${this._formatTime(this.elapsedTime)}`, W / 2, boxY + 170);

    // 提示使用情况
    ctx.fillStyle = '#8693A6';
    ctx.font = '20px PingFang SC, sans-serif';
    ctx.fillText(`💡 使用提示: ${this.hintTicketsUsed} 次`, W / 2, boxY + 200);

    // 奖励
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 28px PingFang SC, sans-serif';
    ctx.fillText(`🪙 +${this.winReward.coins}  💎 +${this.winReward.diamonds}`, W / 2, boxY + 250);

    // 按钮区域
    const btnY = boxY + boxH - 70;
    
    // 下一关按钮
    const btnW1 = 200, btnH1 = 60;
    const btnX1 = (W - btnW1) / 2 - 100;
    ctx.fillStyle = '#FFB400';
    this._roundRect(ctx, btnX1, btnY, btnW1, btnH1, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px PingFang SC, sans-serif';
    ctx.fillText('下一关 →', btnX1 + btnW1 / 2, btnY + 30);

    // 返回选关按钮
    const btnW2 = 200;
    const btnX2 = (W - btnW2) / 2 + 100;
    ctx.fillStyle = '#5B9DF9';
    this._roundRect(ctx, btnX2, btnY, btnW2, btnH1, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('返回选关', btnX2 + btnW2 / 2, btnY + 30);
  }

  _isWin() {
    // 检查所有目标格是否都被填满
    for (const tc of this.targetCells) {
      const filled = this.placedBlocks.some(block => 
        this._blockCoversCell(block, tc.x, tc.y)
      );
      if (!filled) return false;
    }
    return true;
  }

  _calculateStars() {
    // 根据时间计算星级
    const baseTime = this.targetCells.length * 3; // 每个目标格3秒
    if (this.elapsedTime <= baseTime) return 3;
    if (this.elapsedTime <= baseTime * 1.5) return 2;
    if (this.elapsedTime <= baseTime * 2) return 1;
    return 1;
  }

  _calculateReward() {
    // 根据星级计算奖励
    const stars = this.winState?.stars || 1;
    const baseCoins = 50 + this.chapter * 10 + this.level * 2;
    const coins = Math.floor(baseCoins * (1 + (stars - 1) * 0.5));
    const diamonds = stars >= 3 ? 5 : (stars >= 2 ? 2 : 1);
    return { coins, diamonds };
  }

  checkWin() {
    if (this._isWin() && !this.winState) {
      const stars = this._calculateStars();
      const reward = this._calculateReward();
      this.winState = { stars, reward, time: this.elapsedTime };
      
      // 保存进度
      this.databus.setStars(this.chapter, this.level, stars);
      this.databus.addCoins(reward.coins);
      this.databus.addDiamonds(reward.diamonds);
      
      // 提交到云数据库
      this._submitScoreToCloud();
    }
    return this.winState !== null;
  }

  async _submitScoreToCloud() {
    try {
      if (wx.cloud) {
        await wx.cloud.callFunction({
          name: 'blockMaster',
          data: {
            action: 'submitScore',
            data: {
              chapter: this.chapter,
              level: this.level,
              time: this.winState.time,
              stars: this.winState.stars,
            },
          },
        });
      }
    } catch (e) {
      console.error('Submit score error:', e);
    }
  }

  _blockCoversCell(block, cellX, cellY) {
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1 && 
            block.gridX === cellX - c && 
            block.gridY === cellY - r) {
          return true;
        }
      }
    }
    return false;
  }

  onTouchStart(x, y) {
    // 检查顶部按钮
    for (const btn of this.topButtons) {
      if (btn.hitTest(x, y)) {
        this._handleTopButtonClick(btn.label);
        return;
      }
    }

    // 检查工具栏
    for (const btn of this.toolButtons) {
      if (btn.hitTest(x, y)) {
        this._handleToolButtonClick(btn.label);
        return;
      }
    }

    // 检查托盘积木
    for (const block of this.blocks) {
      if (block.placed) continue;
      if (this._rectContains(block.x, block.y, 
        block.shape[0].length * this.cellSize,
        block.shape.length * this.cellSize, x, y)) {
        this._startDrag(block);
        return;
      }
    }
  }

  _rectContains(x, y, w, h, px, py) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  _startDrag(block) {
    this.dragging = {
      block,
      offsetX: 0,
      offsetY: 0,
      gridX: 0,
      gridY: 0,
      canPlace: false,
    };
  }

  onTouchMove(x, y) {
    if (!this.dragging) return;
    
    const block = this.dragging.block;
    const cellSize = this.cellSize;
    
    // 计算相对于积木左上角的偏移
    const relX = x - block.x;
    const relY = y - block.y;
    
    // 计算格子坐标
    const gridX = Math.floor((relX + cellSize / 2) / cellSize);
    const gridY = Math.floor((relY + cellSize / 2) / cellSize);
    
    this.dragging.gridX = gridX;
    this.dragging.gridY = gridY;
    this.dragging.canPlace = this._canPlace(block, gridX, gridY);
  }

  _canPlace(block, gridX, gridY) {
    const { boardX, boardY, cellSize, gridSize, targetCells, placedBlocks } = this;
    
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] !== 1) continue;
        const gx = gridX + c;
        const gy = gridY + r;
        
        // 边界检查
        if (gx < 0 || gx >= gridSize || gy < 0 || gy >= gridSize) {
          return false;
        }
        
        // 必须是目标格
        const isTarget = targetCells.some(tc => tc.x === gx && tc.y === gy);
        if (!isTarget) return false;
        
        // 不能与已放置的积木重叠
        for (const pb of placedBlocks) {
          if (this._blockCoversCell(pb, gx, gy)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  onTouchEnd(x, y) {
    // 胜利状态下处理按钮点击
    if (this.winState) {
      const W = this.W, H = this.H;
      const boxY = (H - 380) / 2;
      const btnY = boxY + 380 - 70;
      const btnH1 = 60;
      
      // 下一关按钮
      const btnW1 = 200;
      const btnX1 = (W - btnW1) / 2 - 100;
      if (this._rectContains(btnX1, btnY, btnW1, btnH1, x, y)) {
        const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
        if (this._sceneManager) {
          this._sceneManager.go('game', next);
        }
        return;
      }
      
      // 返回选关按钮
      const btnW2 = 200;
      const btnX2 = (W - btnW2) / 2 + 100;
      if (this._rectContains(btnX2, btnY, btnW2, btnH1, x, y)) {
        if (this._sceneManager) {
          this._sceneManager.go('select');
        }
        return;
      }
      return;
    }
    
    if (this.dragging) {
      const { block, gridX, gridY, canPlace } = this.dragging;
      
      if (canPlace) {
        // 放置积木
        block.placed = true;
        block.gridX = gridX;
        block.gridY = gridY;
        this.placedBlocks.push(block);
        this.undoStack.push(block);
      }
      
      this.dragging = null;
    }
  }

  _handleTopButtonClick(label) {
    if (label === '◀ 返回') {
      if (this._sceneManager) {
        this._sceneManager.back();
      }
    } else if (label === '🔄 重置') {
      this.init();
    }
  }

  _handleToolButtonClick(label) {
    if (label.startsWith('💡×')) {
      if (this.hintTickets > 0) {
        // 自动放置一块
        this.databus.useHintTicket();
        this.hintTickets = this.databus.save.hintTickets;
        this.hintTicketsUsed++;
        this._autoPlaceOne();
      }
    } else if (label === '🎯 撤销') {
      if (this.undoStack.length > 0) {
        const block = this.undoStack.pop();
        block.placed = false;
        const idx = this.placedBlocks.indexOf(block);
        if (idx > -1) this.placedBlocks.splice(idx, 1);
      }
    } else if (label === '🚫 跳关') {
      // 消耗钻石跳关
      if (this.databus.spendDiamonds(5)) {
        const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
        if (this._sceneManager) {
          this._sceneManager.go('game', next);
        }
      } else {
        this._showToast('💎 不足，看广告可获得');
      }
    } else if (label === '📺 看广告跳关') {
      // 模拟广告
      console.log('[Mock] 广告播放完成');
      const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
      if (this._sceneManager) {
        this._sceneManager.go('game', next);
      }
    } else if (label === '🔀 打乱') {
      // 打乱托盘
      this._shuffleTray();
    }
  }

  _showToast(message) {
    console.log(message);
    // 可以接入微信原生 toast
  }

  _autoPlaceOne() {
    // 简单实现：找到第一个可以放置的位置
    for (const block of this.blocks) {
      if (block.placed) continue;
      for (let gy = 0; gy < this.gridSize; gy++) {
        for (let gx = 0; gx < this.gridSize; gx++) {
          if (this._canPlace(block, gx, gy)) {
            block.placed = true;
            block.gridX = gx;
            block.gridY = gy;
            this.placedBlocks.push(block);
            this.undoStack.push(block);
            return;
          }
        }
      }
    }
  }

  _shuffleTray() {
    const unplaced = this.blocks.filter(b => !b.placed);
    for (let i = unplaced.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unplaced[i].shape, unplaced[j].shape] = [unplaced[j].shape, unplaced[i].shape];
    }
  }

  onEnter() {}

  onExit() {}
}

module.exports = GameScene;
