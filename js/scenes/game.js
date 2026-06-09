/**
 * 方块大师 - 游戏场景
 * 方块拼图游戏
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');
const PuzzleGenerator = require('../puzzle.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class GameScene {
  constructor(ctx, databus, params = {}, scaleX = 1, scaleY = 1) {
    this.ctx = ctx;
    this.databus = databus;
    this.params = params;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.W = DESIGN_W;
    this.H = DESIGN_H;
    this.init();
  }

  init() {
    const { chapter = 1, level = 1 } = this.params;
    this.chapter = chapter;
    this.level = level;
    this.levelKey = `${chapter}-${level}`;
    
    // 生成题目
    const puzzle = PuzzleGenerator.generate(level);
    this.blocks = puzzle.blocks;
    this.targetShape = puzzle.targetShape;
    this.targetWidth = puzzle.targetShape.width;
    this.targetHeight = puzzle.targetShape.height;
    this.placements = puzzle.placements; // 正确答案

    // 计算游戏区域
    const cellSize = Math.min(
      (this.W - 100) / this.targetWidth,
      (this.H - 400) / this.targetHeight
    );
    this.cellSize = Math.floor(cellSize);
    
    // 目标区域位置（居中）
    const targetW = this.targetWidth * this.cellSize;
    const targetH = this.targetHeight * this.cellSize;
    this.targetX = (this.W - targetW) / 2;
    this.targetY = 150;
    
    // 已放置的方块
    this.placedBlocks = [];
    
    // 拖拽状态
    this.dragging = null;
    this.dragOffset = { x: 0, y: 0 };
    
    // 撤销栈
    this.undoStack = [];
    
    // 操作历史（用于撤销）
    this.history = [];
    this.maxHistory = 20;
    
    // 计时
    this.startTime = Date.now();
    this.elapsedTime = 0;
    
    // 提示次数
    this.hintTickets = this.databus.save.hintTickets || 3;
    this.hintTicketsUsed = 0;
    
    // 双击检测
    this.lastTap = { x: 0, y: 0, time: 0 };
    this.tapThreshold = 300; // 双击间隔阈值
    
    // 胜利状态
    this.winState = null;
    
    // 创建按钮
    this.toolButtons = [];
    this._createToolButtons();
    
    this.topButtons = [];
    this._createTopButtons();
  }

  _createToolButtons() {
    const W = this.W;
    const btnW = 160, btnH = 80;
    const startX = 30;
    const startY = this.H - 120;
    const fontScale = this.scaleY;
    
    // 提示按钮
    this.toolButtons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, `💡×${this.hintTickets}`, {
        bg: '#FFB400',
        fontSize: 22 * fontScale,
      })
    );
    
    // 撤销按钮
    this.toolButtons.push(
      new Button(this.ctx, startX + btnW + 15, startY, btnW, btnH, '↩ 撤销', {
        bg: '#5B9DF9',
        fontSize: 22 * fontScale,
      })
    );
    
    // 重置按钮
    this.toolButtons.push(
      new Button(this.ctx, startX + (btnW + 15) * 2, startY, btnW, btnH, '🔄 重置', {
        bg: '#6BCB77',
        fontSize: 22 * fontScale,
      })
    );
  }

  _createTopButtons() {
    // 返回按钮
    this.topButtons.push(
      new Button(this.ctx, 30, 40, 110, 70, '◀ 返回', {
        bg: '#FFFFFF',
        fontSize: 24 * this.scaleY,
      })
    );
    // 重置按钮
    this.topButtons.push(
      new Button(this.ctx, this.W - 110 - 30, 40, 110, 70, '🔄 重置', {
        bg: '#FFFFFF',
        fontSize: 24 * this.scaleY,
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

    // 目标区域（空白）
    this._renderTargetArea();

    // 已放置的方块
    for (const block of this.placedBlocks) {
      this._renderBlock(block);
    }

    // 拖拽预览
    if (this.dragging) {
      this._renderDragPreview();
    }

    // 待放置的方块（托盘）
    this._renderTray();

    // 工具栏
    for (const btn of this.toolButtons) {
      btn.render();
    }

    // 胜利提示
    if (this.winState) {
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
    const fontScale = this.scaleY;

    // 返回按钮
    for (const btn of this.topButtons) {
      btn.render();
    }

    // 关卡名
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${24 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`第 ${this.chapter}-${this.level} 关`, W / 2 - 60, 75);

    // 计时器
    ctx.fillStyle = '#8693A6';
    ctx.font = `${20 * fontScale}px PingFang SC, sans-serif`;
    const time = this._formatTime(this.elapsedTime);
    ctx.fillText(`⏱ ${time}`, W / 2 + 60, 75);

    // 方块数量
    const placedCount = this.placedBlocks.length;
    const totalCount = this.blocks.length;
    ctx.fillStyle = '#FF6B6B';
    ctx.font = `bold ${24 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText(`${placedCount}/${totalCount}`, W / 2, 110);
  }

  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _renderTargetArea() {
    const ctx = this.ctx;
    const { targetX, targetY, targetWidth, targetHeight, cellSize } = this;

    // 背景
    ctx.fillStyle = '#E9ECEF';
    this._roundRect(ctx, targetX - 20, targetY - 20, 
      targetWidth * cellSize + 40, targetHeight * cellSize + 40, 20);
    ctx.fill();

    // 网格（虚线效果）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    for (let r = 0; r <= targetHeight; r++) {
      const y = targetY + r * cellSize;
      ctx.beginPath();
      ctx.moveTo(targetX, y);
      ctx.lineTo(targetX + targetWidth * cellSize, y);
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    for (let c = 0; c <= targetWidth; c++) {
      const x = targetX + c * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, targetY);
      ctx.lineTo(x, targetY + targetHeight * cellSize);
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 边框
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 3;
    this._roundRect(ctx, targetX - 20, targetY - 20, 
      targetWidth * cellSize + 40, targetHeight * cellSize + 40, 20);
    ctx.stroke();
  }

  _renderTray() {
    const ctx = this.ctx;
    const W = this.W;
    const trayY = this.targetY + this.targetHeight * this.cellSize + 60;
    const trayH = 150;

    // 背景
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, 20, trayY, W - 40, trayH, 20);
    ctx.fill();

    // 标题
    ctx.fillStyle = '#8693A6';
    ctx.font = `bold ${20 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('待放置方块:', 40, trayY + 15);

    // 方块
    const startX = 40;
    const gap = 15;
    let x = startX;
    
    for (const block of this.blocks) {
      if (block.placed) continue;
      
      const bounds = PuzzleGenerator.getBounds(block.shape);
      const blockW = bounds.width * this.cellSize;
      const blockH = bounds.height * this.cellSize;
      
      block.x = x + (this.cellSize - blockW) / 2;
      block.y = trayY + 50;
      
      this._renderBlock(block);
      
      x += blockW + gap;
    }
  }

  _renderBlock(block) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    // 绘制每个单元格
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] === 1) {
          const x = block.x + (c - bounds.minX) * cellSize;
          const y = block.y + (r - bounds.minY) * cellSize;
          
          // 填充
          ctx.fillStyle = block.color;
          this._roundRect(ctx, x, y, cellSize * 0.9, cellSize * 0.9, 8);
          ctx.fill();
          
          // 高光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          this._roundRect(ctx, x + 4, y + 4, cellSize * 0.35, cellSize * 0.35, 4);
          ctx.fill();
          
          // 边框
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          this._roundRect(ctx, x, y, cellSize * 0.9, cellSize * 0.9, 8);
          ctx.stroke();
        }
      }
    }
    
    // 如果是已放置的方块，添加阴影
    if (block.placed) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      this._roundRect(ctx, block.x - 5, block.y - 5, 
        bounds.width * cellSize + 10, bounds.height * cellSize + 10, 12);
      ctx.stroke();
    }
  }

  _renderDragPreview() {
    const ctx = this.ctx;
    if (!this.dragging) return;
    
    const { block, gridX, gridY, canPlace } = this.dragging;
    const cellSize = this.cellSize;
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    // 计算预览位置
    const previewX = this.targetX + gridX * cellSize;
    const previewY = this.targetY + gridY * cellSize;
    
    // 绘制预览
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] === 1) {
          const x = previewX + (c - bounds.minX) * cellSize;
          const y = previewY + (r - bounds.minY) * cellSize;
          
          if (canPlace) {
            // 可放置：绿色边框
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
          } else {
            // 不可放置：红色边框
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 3;
          }
          
          this._roundRect(ctx, x, y, cellSize, cellSize, 8);
          ctx.stroke();
        }
      }
    }
  }

  _renderWinOverlay() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const fontScale = this.scaleY;

    // 遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, W, H);

    // 弹层
    const boxW = 500, boxH = 400;
    const boxX = (W - boxW) / 2;
    const boxY = (H - boxH) / 2;
    
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.fill();

    // 标题
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${48 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 通关！', W / 2, boxY + 60);

    // 星级
    ctx.fillStyle = '#FFB400';
    ctx.font = `${48 * fontScale}px sans-serif`;
    const stars = '⭐'.repeat(this.winState.stars);
    ctx.fillText(stars, W / 2, boxY + 120);

    // 时间
    ctx.fillStyle = '#8693A6';
    ctx.font = `${24 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText(`⏱ ${this._formatTime(this.elapsedTime)}`, W / 2, boxY + 170);

    // 奖励
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${28 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText(`🪙 +${this.winState.reward.coins}  💎 +${this.winState.reward.diamonds}`, W / 2, boxY + 220);

    // 按钮区域
    const btnY = boxY + boxH - 70;
    const btnW = 200, btnH = 56;
    
    // 下一关按钮
    const btnX1 = (W - btnW) / 2 - 110;
    ctx.fillStyle = '#FFB400';
    this._roundRect(ctx, btnX1, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${24 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText('下一关 →', btnX1 + btnW / 2, btnY + btnH / 2);

    // 返回选关按钮
    const btnX2 = (W - btnW) / 2 + 110;
    ctx.fillStyle = '#5B9DF9';
    this._roundRect(ctx, btnX2, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('返回选关', btnX2 + btnW / 2, btnY + btnH / 2);
  }

  // 检查方块是否可以放置
  _canPlace(block, gridX, gridY) {
    const bounds = PuzzleGenerator.getBounds(block.shape);
    const { targetWidth, targetHeight, placedBlocks } = this;
    
    // 边界检查
    if (gridX < 0 || gridY < 0) return false;
    if (gridX + bounds.width > targetWidth || gridY + bounds.height > targetHeight) {
      return false;
    }
    
    // 检查是否与已放置的方块重叠
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] !== 1) continue;
        
        const gx = gridX + (c - bounds.minX);
        const gy = gridY + (r - bounds.minY);
        
        // 检查是否与已放置方块重叠
        for (const pb of placedBlocks) {
          if (this._blockCoversCell(pb, gx, gy)) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  // 检查已放置方块是否覆盖指定格子
  _blockCoversCell(block, cellX, cellY) {
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] === 1) {
          const gx = block.gridX + (c - bounds.minX);
          const gy = block.gridY + (r - bounds.minY);
          if (gx === cellX && gy === cellY) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 检查是否胜利
  checkWin() {
    if (this.placedBlocks.length === this.blocks.length && !this.winState) {
      // 验证所有方块是否正确放置
      if (this._validatePlacement()) {
        const stars = this._calculateStars();
        const reward = this._calculateReward(stars);
        this.winState = { stars, reward, time: this.elapsedTime };
        
        // 保存进度
        this.databus.setStars(this.chapter, this.level, stars);
        this.databus.addCoins(reward.coins);
        this.databus.addDiamonds(reward.diamonds);
        
        // 提交到云数据库
        this._submitScoreToCloud();
      }
    }
    return this.winState !== null;
  }

  // 验证放置是否正确
  _validatePlacement() {
    // 简单验证：检查所有格子都被填满且无重叠
    const filled = new Set();
    
    for (const block of this.placedBlocks) {
      const bounds = PuzzleGenerator.getBounds(block.shape);
      for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
        for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
          if (block.shape[r][c] === 1) {
            const key = `${block.gridX + (c - bounds.minX)},${block.gridY + (r - bounds.minY)}`;
            if (filled.has(key)) {
              return false; // 重叠
            }
            filled.add(key);
          }
        }
      }
    }
    
    // 检查是否填满了目标区域
    const expected = this.targetWidth * this.targetHeight;
    return filled.size === expected;
  }

  _calculateStars() {
    const baseTime = this.blocks.length * 15; // 每个方块 15 秒
    if (this.elapsedTime <= baseTime) return 3;
    if (this.elapsedTime <= baseTime * 1.5) return 2;
    if (this.elapsedTime <= baseTime * 2) return 1;
    return 1;
  }

  _calculateReward(stars) {
    const baseCoins = 50 + this.chapter * 10 + this.level * 2;
    const coins = Math.floor(baseCoins * (1 + (stars - 1) * 0.5));
    const diamonds = stars >= 3 ? 5 : (stars >= 2 ? 2 : 1);
    return { coins, diamonds };
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

    // 检查是否点击已放置的方块（用于双击旋转）
    for (const block of this.placedBlocks) {
      const bounds = PuzzleGenerator.getBounds(block.shape);
      const blockW = bounds.width * this.cellSize;
      const blockH = bounds.height * this.cellSize;
      
      const blockX = this.targetX + block.gridX * this.cellSize;
      const blockY = this.targetY + block.gridY * this.cellSize;
      
      if (x >= blockX && x <= blockX + blockW && y >= blockY && y <= blockY + blockH) {
        // 检测双击
        const now = Date.now();
        const dx = x - this.lastTap.x;
        const dy = y - this.lastTap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (now - this.lastTap.time < this.tapThreshold && dist < 30) {
          // 双击：旋转方块
          this._rotatePlacedBlock(block);
        }
        this.lastTap = { x, y, time: now };
        return;
      }
    }

    // 检查托盘中的方块
    for (const block of this.blocks) {
      if (block.placed) continue;
      
      const bounds = PuzzleGenerator.getBounds(block.shape);
      const blockW = bounds.width * this.cellSize;
      const blockH = bounds.height * this.cellSize;
      
      if (x >= block.x && x <= block.x + blockW && y >= block.y && y <= block.y + blockH) {
        // 检测双击
        const now = Date.now();
        const dx = x - this.lastTap.x;
        const dy = y - this.lastTap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (now - this.lastTap.time < this.tapThreshold && dist < 30) {
          // 双击：旋转方块
          this._rotateBlock(block);
        } else {
          // 单击：开始拖拽
          this._startDrag(block, x, y);
        }
        this.lastTap = { x, y, time: now };
        return;
      }
    }
  }

  _startDrag(block, x, y) {
    const bounds = PuzzleGenerator.getBounds(block.shape);
    const blockW = bounds.width * this.cellSize;
    const blockH = bounds.height * this.cellSize;
    
    this.dragging = {
      block,
      gridX: 0,
      gridY: 0,
      canPlace: false,
    };
    
    // 计算拖拽偏移
    this.dragOffset.x = x - block.x;
    this.dragOffset.y = y - block.y;
  }

  onTouchMove(x, y) {
    if (!this.dragging) return;
    
    const block = this.dragging.block;
    const cellSize = this.cellSize;
    
    // 计算目标区域内的格子坐标
    const relX = x - this.targetX;
    const relY = y - this.targetY;
    
    const gridX = Math.floor((relX + cellSize / 2) / cellSize);
    const gridY = Math.floor((relY + cellSize / 2) / cellSize);
    
    this.dragging.gridX = gridX;
    this.dragging.gridY = gridY;
    this.dragging.canPlace = this._canPlace(block, gridX, gridY);
  }

  onTouchEnd(x, y) {
    // 胜利状态下处理按钮点击
    if (this.winState) {
      const W = this.W, H = this.H;
      const boxY = (H - 400) / 2;
      const btnY = boxY + 400 - 70;
      const btnH = 56;
      
      // 下一关按钮
      const btnW = 200;
      const btnX1 = (W - btnW) / 2 - 110;
      if (this._rectContains(btnX1, btnY, btnW, btnH, x, y)) {
        const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
        if (this._sceneManager) {
          this._sceneManager.go('game', next);
        }
        return;
      }
      
      // 返回选关按钮
      const btnX2 = (W - btnW) / 2 + 110;
      if (this._rectContains(btnX2, btnY, btnW, btnH, x, y)) {
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
        // 放置方块
        block.placed = true;
        block.gridX = gridX;
        block.gridY = gridY;
        this.placedBlocks.push(block);
        
        // 记录历史
        this._pushHistory({
          type: 'place',
          blockId: block.id,
          gridX, gridY,
        });
      }
      
      this.dragging = null;
    }
    
    this.checkWin();
  }

  _rectContains(x, y, w, h, px, py) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  // 旋转托盘中的方块
  _rotateBlock(block) {
    const oldShape = block.shape;
    block.shape = PuzzleGenerator._rotate90(block.shape);
    block.rotation = (block.rotation + 1) % 4;
    
    this._pushHistory({
      type: 'rotate',
      blockId: block.id,
      oldShape: JSON.parse(JSON.stringify(oldShape)),
    });
  }

  // 旋转已放置的方块
  _rotatePlacedBlock(block) {
    const oldShape = block.shape;
    const oldGridX = block.gridX;
    const oldGridY = block.gridY;
    
    block.shape = PuzzleGenerator._rotate90(block.shape);
    block.rotation = (block.rotation + 1) % 4;
    
    // 调整位置以保持方块在目标区域内
    const bounds = PuzzleGenerator.getBounds(block.shape);
    if (block.gridX + bounds.width > this.targetWidth) {
      block.gridX = this.targetWidth - bounds.width;
    }
    if (block.gridY + bounds.height > this.targetHeight) {
      block.gridY = this.targetHeight - bounds.height;
    }
    if (block.gridX < 0) block.gridX = 0;
    if (block.gridY < 0) block.gridY = 0;
    
    // 检查是否与其它方块重叠
    let attempts = 0;
    while (this._checkOverlap(block) && attempts < 100) {
      // 尝试移动到不重叠的位置
      block.gridX = Math.floor(Math.random() * (this.targetWidth - bounds.width + 1));
      block.gridY = Math.floor(Math.random() * (this.targetHeight - bounds.height + 1));
      attempts++;
    }
    
    this._pushHistory({
      type: 'rotatePlaced',
      blockId: block.id,
      oldShape: JSON.parse(JSON.stringify(oldShape)),
      oldGridX,
      oldGridY,
    });
  }

  // 检查是否与其它方块重叠
  _checkOverlap(block) {
    const bounds = PuzzleGenerator.getBounds(block.shape);
    for (const pb of this.placedBlocks) {
      if (pb === block) continue;
      for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
        for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
          if (block.shape[r][c] === 1) {
            const gx = block.gridX + (c - bounds.minX);
            const gy = block.gridY + (r - bounds.minY);
            if (this._blockCoversCell(pb, gx, gy)) {
              return true;
            }
          }
        }
      }
    }
    return false;
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
        this.databus.useHintTicket();
        this.hintTickets = this.databus.save.hintTickets;
        this.hintTicketsUsed++;
        this._autoPlaceOne();
      }
    } else if (label === '↩ 撤销') {
      this._undo();
    } else if (label === '🔄 重置') {
      this.init();
  }

  // 撤销操作
  _undo() {
    if (this.history.length === 0) return;
    
    const last = this.history.pop();
    
    if (last.type === 'place') {
      // 取消放置
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.placed = false;
        const idx = this.placedBlocks.indexOf(block);
        if (idx > -1) this.placedBlocks.splice(idx, 1);
      }
    } else if (last.type === 'rotate') {
      // 撤销旋转
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.shape = last.oldShape;
        block.rotation = (block.rotation - 1 + 4) % 4;
      }
    } else if (last.type === 'rotatePlaced') {
      // 撤销已放置方块的旋转
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.shape = last.oldShape;
        block.gridX = last.oldGridX;
        block.gridY = last.oldGridY;
        block.rotation = (block.rotation - 1 + 4) % 4;
      }
    }
  }

  // 记录历史
  _pushHistory(action) {
    this.history.push(action);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  // 自动放置一个方块（提示功能）
  _autoPlaceOne() {
    // 找到第一个未放置的方块
    const unplaced = this.blocks.filter(b => !b.placed);
    if (unplaced.length === 0) return;
    
    // 从正确答案中找到该方块的放置位置
    const block = unplaced[0];
    const placement = this.placements.find(p => 
      JSON.stringify(block.shape) === JSON.stringify(PuzzleGenerator._rotateShape(
        PuzzleGenerator.SHAPES[block.shapeKey], p.rotation
      ))
    );
    
    if (placement) {
      block.placed = true;
      block.gridX = placement.x;
      block.gridY = placement.y;
      this.placedBlocks.push(block);
      
      this._pushHistory({
        type: 'place',
        blockId: block.id,
        gridX: placement.x,
        gridY: placement.y,
      });
    }
  }

  onEnter() {}

  onExit() {}
}

module.exports = GameScene;
