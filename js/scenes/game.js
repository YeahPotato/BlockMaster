/**
 * 方块大师 - 游戏场景
 * 方块拼图游戏 - 优化版
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');
const PuzzleGenerator = require('../puzzle.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

// 固定的游戏区域大小
const BOARD_SIZE = 10;

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
    this.placementArea = puzzle.placementArea;
    this.placements = puzzle.placements;
    this.totalCells = puzzle.totalCells;

    // 计算格子大小 - 根据屏幕适配
    const maxCellSize = Math.min(
      (this.W - 100) / BOARD_SIZE,
      (this.H - 500) / BOARD_SIZE
    );
    this.cellSize = Math.max(35, Math.floor(maxCellSize));
    
    // 游戏区域位置（居中）
    const boardW = BOARD_SIZE * this.cellSize;
    const boardH = BOARD_SIZE * this.cellSize;
    this.boardX = (this.W - boardW) / 2;
    this.boardY = 100;
    
    // 已放置的方块
    this.placedBlocks = [];
    
    // 拖拽状态
    this.dragging = null;
    this.isDragging = false;
    this.dragStartPos = { x: 0, y: 0 };
    this.dragOffset = { x: 0, y: 0 };
    
    // 撤销栈
    this.undoStack = [];
    
    // 操作历史
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
    this.tapThreshold = 300;
    
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
    const btnW = 140, btnH = 70;
    const startX = 30;
    const startY = this.H - 110;
    const gap = 20;
    const fontScale = this.scaleY;
    
    // 提示按钮
    this.toolButtons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, `💡×${this.hintTickets}`, {
        bg: '#FFB400',
        fontSize: 20 * fontScale,
      })
    );
    
    // 撤销按钮
    this.toolButtons.push(
      new Button(this.ctx, startX + btnW + gap, startY, btnW, btnH, '↩ 撤销', {
        bg: '#5B9DF9',
        fontSize: 20 * fontScale,
      })
    );
    
    // 重置按钮
    this.toolButtons.push(
      new Button(this.ctx, startX + (btnW + gap) * 2, startY, btnW, btnH, '🔄 重置', {
        bg: '#6BCB77',
        fontSize: 20 * fontScale,
      })
    );
  }

  _createTopButtons() {
    // 返回按钮
    this.topButtons.push(
      new Button(this.ctx, 30, 30, 100, 60, '◀ 返回', {
        bg: '#FFFFFF',
        fontSize: 22 * this.scaleY,
      })
    );
    // 重置按钮
    this.topButtons.push(
      new Button(this.ctx, this.W - 100 - 30, 30, 100, 60, '🔄 重置', {
        bg: '#FFFFFF',
        fontSize: 22 * this.scaleY,
      })
    );
  }

  update(dt) {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 背景 - 渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#E8F4FD');
    gradient.addColorStop(1, '#F0F8FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // 顶栏
    this._renderTopBar();

    // 游戏区域（10x10 网格）
    this._renderBoard();

    // 放置区域轮廓（带阴影）
    this._renderPlacementArea();

    // 已放置的方块
    for (const block of this.placedBlocks) {
      this._renderBlock(block);
    }

    // 拖拽预览
    if (this.isDragging && this.dragging) {
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

    // 顶部卡片
    const cardW = 400, cardH = 90;
    const cardX = (W - cardW) / 2;
    const cardY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this._roundRect(ctx, cardX + 4, cardY + 6, cardW, cardH, 16);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();

    // 关卡名
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${26 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`第 ${this.chapter}-${this.level} 关`, cardX + 30, cardY + 35);

    // 进度条
    const placedCount = this.placedBlocks.length;
    const totalCount = this.blocks.length;
    const progress = totalCount > 0 ? placedCount / totalCount : 0;
    
    ctx.fillStyle = '#E0E0E0';
    this._roundRect(ctx, cardX + 30, cardY + 55, cardW - 60, 14, 7);
    ctx.fill();
    
    const gradient = ctx.createLinearGradient(cardX + 30, 0, cardX + 30 + (cardW - 60) * progress, 0);
    gradient.addColorStop(0, '#5B9DF9');
    gradient.addColorStop(1, '#6BCB77');
    ctx.fillStyle = gradient;
    this._roundRect(ctx, cardX + 30, cardY + 55, (cardW - 60) * progress, 14, 7);
    ctx.fill();

    // 时间
    ctx.fillStyle = '#8693A6';
    ctx.font = `${20 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'right';
    const time = this._formatTime(this.elapsedTime);
    ctx.fillText(`⏱ ${time}`, W - 30, 60);
  }

  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _renderBoard() {
    const ctx = this.ctx;
    const { boardX, boardY, cellSize } = this;

    // 外阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this._roundRect(ctx, boardX + 4, boardY + 8, 
      BOARD_SIZE * cellSize + 50, BOARD_SIZE * cellSize + 50, 24);
    ctx.fill();

    // 主背景
    const gradient = ctx.createLinearGradient(boardX, boardY, boardX, boardY + BOARD_SIZE * cellSize);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#F5F7FA');
    ctx.fillStyle = gradient;
    this._roundRect(ctx, boardX, boardY, 
      BOARD_SIZE * cellSize + 40, BOARD_SIZE * cellSize + 40, 22);
    ctx.fill();

    // 绘制 10x10 网格
    ctx.strokeStyle = 'rgba(200, 210, 220, 0.6)';
    ctx.lineWidth = 1;
    
    for (let r = 1; r < BOARD_SIZE; r++) {
      const y = boardY + 20 + r * cellSize;
      ctx.beginPath();
      ctx.moveTo(boardX + 20, y);
      ctx.lineTo(boardX + BOARD_SIZE * cellSize + 20, y);
      ctx.stroke();
    }
    
    for (let c = 1; c < BOARD_SIZE; c++) {
      const x = boardX + 20 + c * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, boardY + 20);
      ctx.lineTo(x, boardY + BOARD_SIZE * cellSize + 20);
      ctx.stroke();
    }

    // 边框
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 3;
    this._roundRect(ctx, boardX, boardY, 
      BOARD_SIZE * cellSize + 40, BOARD_SIZE * cellSize + 40, 22);
    ctx.stroke();
  }

  _renderPlacementArea() {
    const ctx = this.ctx;
    const { boardX, boardY, cellSize, placementArea } = this;

    // 阴影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this._roundRect(ctx, boardX + 24, boardY + 24, 
      BOARD_SIZE * cellSize + 34, BOARD_SIZE * cellSize + 34, 18);
    ctx.fill();

    // 绘制放置区域轮廓
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (placementArea[r][c] === 1) {
          const x = boardX + 20 + c * cellSize;
          const y = boardY + 20 + r * cellSize;
          
          // 高亮格子
          ctx.fillStyle = 'rgba(91, 157, 249, 0.15)';
          this._roundRect(ctx, x, y, cellSize, cellSize, 6);
          ctx.fill();
          
          // 边框
          ctx.strokeStyle = 'rgba(91, 157, 249, 0.4)';
          ctx.lineWidth = 1;
          this._roundRect(ctx, x, y, cellSize, cellSize, 6);
          ctx.stroke();
        }
      }
    }

    // 外边框
    ctx.strokeStyle = 'rgba(91, 157, 249, 0.6)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, boardX + 22, boardY + 22, 
      BOARD_SIZE * cellSize + 36, BOARD_SIZE * cellSize + 36, 18);
    ctx.stroke();
  }

  _renderTray() {
    const ctx = this.ctx;
    const W = this.W;
    const trayY = this.boardY + BOARD_SIZE * this.cellSize + 60;
    const trayH = 130;

    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this._roundRect(ctx, 24, trayY + 6, W - 48, trayH, 20);
    ctx.fill();

    // 背景
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, 20, trayY, W - 40, trayH, 20);
    ctx.fill();

    // 标题
    ctx.fillStyle = '#8693A6';
    ctx.font = `bold ${18 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('📋 待放置:', 40, trayY + 18);

    // 分隔线
    ctx.strokeStyle = 'rgba(200, 210, 220, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, trayY + 45);
    ctx.lineTo(W - 40, trayY + 45);
    ctx.stroke();

    // 方块
    const startX = 40;
    const gap = 12;
    let x = startX;
    
    for (const block of this.blocks) {
      if (block.placed) continue;
      
      const bounds = PuzzleGenerator.getBounds(block.shape);
      const blockW = bounds.width * this.cellSize;
      const blockH = bounds.height * this.cellSize;
      
      // 如果放不下，换行
      if (x + blockW > W - 60) {
        x = startX;
      }
      
      block.x = x + (this.cellSize - blockW) / 2;
      block.y = trayY + 55;
      
      this._renderBlock(block, true);
      
      x += blockW + gap;
    }
  }

  _renderBlock(block, inTray = false) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    // 计算实际尺寸
    const blockW = bounds.width * cellSize;
    const blockH = bounds.height * cellSize;
    
    // 计算方块的实际位置
    let blockX, blockY;
    if (block.placed && !inTray) {
      // 已放置的方块：根据 gridX 和 gridY 计算位置
      blockX = this.boardX + 20 + block.gridX * cellSize;
      blockY = this.boardY + 20 + block.gridY * cellSize;
    } else {
      blockX = block.x;
      blockY = block.y;
    }
    
    // 绘制每个单元格
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] === 1) {
          const x = blockX + (c - bounds.minX) * cellSize;
          const y = blockY + (r - bounds.minY) * cellSize;
          
          // 渐变填充
          const gradient = ctx.createLinearGradient(x, y, x, y + cellSize);
          gradient.addColorStop(0, this._lightenColor(block.color, 0.15));
          gradient.addColorStop(1, block.color);
          ctx.fillStyle = gradient;
          this._roundRect(ctx, x, y, cellSize * 0.92, cellSize * 0.92, 6);
          ctx.fill();
          
          // 高光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          this._roundRect(ctx, x + 4, y + 4, cellSize * 0.25, cellSize * 0.25, 3);
          ctx.fill();
          
          // 内边框
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          this._roundRect(ctx, x + 2, y + 2, cellSize * 0.92 - 4, cellSize * 0.92 - 4, 5);
          ctx.stroke();
        }
      }
    }
    
    // 外边框阴影
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, blockX - 3, blockY - 3, blockW + 6, blockH + 6, 10);
    ctx.stroke();
    
    // 如果在托盘中，添加虚线边框
    if (inTray) {
      ctx.strokeStyle = 'rgba(91, 157, 249, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      this._roundRect(ctx, blockX - 3, blockY - 3, blockW + 6, blockH + 6, 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 如果已放置，添加阴影
    if (block.placed && !inTray) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      this._roundRect(ctx, blockX + 3, blockY + 5, blockW, blockH, 10);
      ctx.fill();
    }
  }

  // 颜色变亮
  _lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount * 255);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  _renderDragPreview() {
    const ctx = this.ctx;
    if (!this.dragging || !this.isDragging) return;
    
    const { block, gridX, gridY, canPlace } = this.dragging;
    const cellSize = this.cellSize;
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    // 计算预览位置
    const previewX = this.boardX + 20 + gridX * cellSize;
    const previewY = this.boardY + 20 + gridY * cellSize;
    
    const blockW = bounds.width * cellSize;
    const blockH = bounds.height * cellSize;
    
    if (canPlace) {
      // 可放置：绿色高亮
      ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
      this._roundRect(ctx, previewX - 4, previewY - 4, blockW + 8, blockH + 8, 12);
      ctx.fill();
      
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      this._roundRect(ctx, previewX - 4, previewY - 4, blockW + 8, blockH + 8, 12);
      ctx.stroke();
      
      // 绘制方块
      this._renderBlockAtPosition(block, previewX, previewY);
    } else {
      // 不可放置：红色警告
      ctx.fillStyle = 'rgba(244, 67, 54, 0.15)';
      this._roundRect(ctx, previewX - 4, previewY - 4, blockW + 8, blockH + 8, 12);
      ctx.fill();
      
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 3;
      this._roundRect(ctx, previewX - 4, previewY - 4, blockW + 8, blockH + 8, 12);
      ctx.stroke();
    }
  }

  _renderBlockAtPosition(block, x, y) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const bounds = PuzzleGenerator.getBounds(block.shape);
    
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] === 1) {
          const bx = x + (c - bounds.minX) * cellSize;
          const by = y + (r - bounds.minY) * cellSize;
          
          const gradient = ctx.createLinearGradient(bx, by, bx, by + cellSize);
          gradient.addColorStop(0, this._lightenColor(block.color, 0.15));
          gradient.addColorStop(1, block.color);
          ctx.fillStyle = gradient;
          this._roundRect(ctx, bx, by, cellSize * 0.92, cellSize * 0.92, 6);
          ctx.fill();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          this._roundRect(ctx, bx + 4, by + 4, cellSize * 0.25, cellSize * 0.25, 3);
          ctx.fill();
        }
      }
    }
  }

  _renderWinOverlay() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const fontScale = this.scaleY;

    // 遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);

    // 弹层
    const boxW = 520, boxH = 420;
    const boxX = (W - boxW) / 2;
    const boxY = (H - boxH) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this._roundRect(ctx, boxX + 8, boxY + 12, boxW, boxH, 28);
    ctx.fill();
    
    const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    gradient.addColorStop(0, '#FFF8E1');
    gradient.addColorStop(1, '#FFECB3');
    ctx.fillStyle = gradient;
    this._roundRect(ctx, boxX, boxY, boxW, boxH, 28);
    ctx.fill();

    ctx.strokeStyle = '#FFB400';
    ctx.lineWidth = 4;
    this._roundRect(ctx, boxX, boxY, boxW, boxH, 28);
    ctx.stroke();

    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${52 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 恭喜过关！', W / 2, boxY + 70);

    ctx.fillStyle = '#FFB400';
    ctx.font = `${56 * fontScale}px sans-serif`;
    const stars = '⭐'.repeat(this.winState.stars);
    ctx.fillText(stars, W / 2, boxY + 130);

    ctx.fillStyle = '#8693A6';
    ctx.font = `${22 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText(`⏱ 用时 ${this._formatTime(this.elapsedTime)}`, W / 2, boxY + 175);

    ctx.strokeStyle = 'rgba(200, 150, 50, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 60, boxY + 200);
    ctx.lineTo(boxX + boxW - 60, boxY + 200);
    ctx.stroke();

    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${26 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText(`🪙 +${this.winState.reward.coins}`, boxX + 80, boxY + 230);
    ctx.fillText(`💎 +${this.winState.reward.diamonds}`, boxX + boxW - 80, boxY + 230);

    const btnY = boxY + boxH - 80;
    const btnW = 200, btnH = 56;
    
    const btnX1 = (W - btnW) / 2 - 110;
    const gradient1 = ctx.createLinearGradient(btnX1, btnY, btnX1 + btnW, btnY);
    gradient1.addColorStop(0, '#FFB400');
    gradient1.addColorStop(1, '#FFD43B');
    ctx.fillStyle = gradient1;
    this._roundRect(ctx, btnX1, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    this._roundRect(ctx, btnX1, btnY, btnW, btnH, 16);
    ctx.stroke();
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${22 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText('下一关 →', btnX1 + btnW / 2, btnY + btnH / 2);

    const btnX2 = (W - btnW) / 2 + 110;
    const gradient2 = ctx.createLinearGradient(btnX2, btnY, btnX2 + btnW, btnY);
    gradient2.addColorStop(0, '#5B9DF9');
    gradient2.addColorStop(1, '#7BB8F5');
    ctx.fillStyle = gradient2;
    this._roundRect(ctx, btnX2, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    this._roundRect(ctx, btnX2, btnY, btnW, btnH, 16);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('返回选关', btnX2 + btnW / 2, btnY + btnH / 2);
  }

  _canPlace(block, gridX, gridY) {
    const bounds = PuzzleGenerator.getBounds(block.shape);
    const { placementArea, placedBlocks } = this;
    
    // 边界检查
    if (gridX < 0 || gridY < 0) return false;
    if (gridX + bounds.width > BOARD_SIZE || gridY + bounds.height > BOARD_SIZE) {
      return false;
    }
    
    // 检查是否在放置区域内
    for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
      for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
        if (block.shape[r][c] !== 1) continue;
        
        const gx = gridX + (c - bounds.minX);
        const gy = gridY + (r - bounds.minY);
        
        // 必须在放置区域内
        if (placementArea[gy][gx] !== 1) {
          return false;
        }
        
        // 不能与已放置的方块重叠
        for (const pb of placedBlocks) {
          if (this._blockCoversCell(pb, gx, gy)) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

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

  checkWin() {
    if (this.placedBlocks.length === this.blocks.length && !this.winState) {
      if (this._validatePlacement()) {
        const stars = this._calculateStars();
        const reward = this._calculateReward(stars);
        this.winState = { stars, reward, time: this.elapsedTime };
        
        this.databus.setStars(this.chapter, this.level, stars);
        this.databus.addCoins(reward.coins);
        this.databus.addDiamonds(reward.diamonds);
        
        this._submitScoreToCloud();
      }
    }
    return this.winState !== null;
  }

  _validatePlacement() {
    // 检查是否填满了放置区域
    const filled = new Set();
    
    for (const block of this.placedBlocks) {
      const bounds = PuzzleGenerator.getBounds(block.shape);
      for (let r = bounds.minY; r < bounds.minY + bounds.height; r++) {
        for (let c = bounds.minX; c < bounds.minX + bounds.width; c++) {
          if (block.shape[r][c] === 1) {
            const key = `${block.gridX + (c - bounds.minX)},${block.gridY + (r - bounds.minY)}`;
            if (filled.has(key)) {
              return false;
            }
            filled.add(key);
          }
        }
      }
    }
    
    // 检查是否填满了放置区域
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.placementArea[r][c] === 1) {
          const key = `${c},${r}`;
          if (!filled.has(key)) {
            return false; // 放置区域有空格
          }
        }
      }
    }
    
    return true;
  }

  _calculateStars() {
    const baseTime = this.blocks.length * 20;
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

    // 检查是否点击已放置的方块
    for (const block of this.placedBlocks) {
      const bounds = PuzzleGenerator.getBounds(block.shape);
      const blockW = bounds.width * this.cellSize;
      const blockH = bounds.height * this.cellSize;
      
      const blockX = this.boardX + 20 + block.gridX * this.cellSize;
      const blockY = this.boardY + 20 + block.gridY * this.cellSize;
      
      if (x >= blockX && x <= blockX + blockW && y >= blockY && y <= blockY + blockH) {
        const now = Date.now();
        const dx = x - this.lastTap.x;
        const dy = y - this.lastTap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (now - this.lastTap.time < this.tapThreshold && dist < 30) {
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
        const now = Date.now();
        const dx = x - this.lastTap.x;
        const dy = y - this.lastTap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (now - this.lastTap.time < this.tapThreshold && dist < 30) {
          this._rotateBlock(block);
        } else {
          this.isDragging = true;
          this.dragging = {
            block,
            gridX: -1,
            gridY: -1,
            canPlace: false,
          };
          this.dragStartPos = { x, y };
          this.dragOffset = { x: x - block.x, y: y - block.y };
        }
        this.lastTap = { x, y, time: now };
        return;
      }
    }
  }

  onTouchMove(x, y) {
    if (!this.isDragging || !this.dragging) return;
    
    const block = this.dragging.block;
    const cellSize = this.cellSize;
    
    const relX = x - this.boardX - 20;
    const relY = y - this.boardY - 20;
    
    const gridX = Math.floor((relX + cellSize / 2) / cellSize);
    const gridY = Math.floor((relY + cellSize / 2) / cellSize);
    
    this.dragging.gridX = gridX;
    this.dragging.gridY = gridY;
    this.dragging.canPlace = this._canPlace(block, gridX, gridY);
  }

  onTouchEnd(x, y) {
    if (this.winState) {
      const W = this.W, H = this.H;
      const boxY = (H - 420) / 2;
      const btnY = boxY + 420 - 80;
      const btnH = 56;
      
      const btnW = 200;
      const btnX1 = (W - btnW) / 2 - 110;
      if (this._rectContains(btnX1, btnY, btnW, btnH, x, y)) {
        const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
        if (this._sceneManager) {
          this._sceneManager.go('game', next);
        }
        return;
      }
      
      const btnX2 = (W - btnW) / 2 + 110;
      if (this._rectContains(btnX2, btnY, btnW, btnH, x, y)) {
        if (this._sceneManager) {
          this._sceneManager.go('select');
        }
        return;
      }
      return;
    }
    
    if (this.isDragging && this.dragging) {
      const { block, gridX, gridY, canPlace } = this.dragging;
      
      if (canPlace && gridX >= 0 && gridY >= 0) {
        block.placed = true;
        block.gridX = gridX;
        block.gridY = gridY;
        this.placedBlocks.push(block);
        
        this._pushHistory({
          type: 'place',
          blockId: block.id,
          gridX, gridY,
        });
      }
      
      this.isDragging = false;
      this.dragging = null;
    }
    
    this.checkWin();
  }

  _rectContains(x, y, w, h, px, py) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

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

  _rotatePlacedBlock(block) {
    const oldShape = block.shape;
    const oldGridX = block.gridX;
    const oldGridY = block.gridY;
    
    block.shape = PuzzleGenerator._rotate90(block.shape);
    block.rotation = (block.rotation + 1) % 4;
    
    const bounds = PuzzleGenerator.getBounds(block.shape);
    if (block.gridX + bounds.width > BOARD_SIZE) {
      block.gridX = BOARD_SIZE - bounds.width;
    }
    if (block.gridY + bounds.height > BOARD_SIZE) {
      block.gridY = BOARD_SIZE - bounds.height;
    }
    if (block.gridX < 0) block.gridX = 0;
    if (block.gridY < 0) block.gridY = 0;
    
    let attempts = 0;
    while (this._checkOverlap(block) && attempts < 100) {
      block.gridX = Math.floor(Math.random() * (BOARD_SIZE - bounds.width + 1));
      block.gridY = Math.floor(Math.random() * (BOARD_SIZE - bounds.height + 1));
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
  }

  _undo() {
    if (this.history.length === 0) return;
    
    const last = this.history.pop();
    
    if (last.type === 'place') {
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.placed = false;
        const idx = this.placedBlocks.indexOf(block);
        if (idx > -1) this.placedBlocks.splice(idx, 1);
      }
    } else if (last.type === 'rotate') {
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.shape = last.oldShape;
        block.rotation = (block.rotation - 1 + 4) % 4;
      }
    } else if (last.type === 'rotatePlaced') {
      const block = this.blocks.find(b => b.id === last.blockId);
      if (block) {
        block.shape = last.oldShape;
        block.gridX = last.oldGridX;
        block.gridY = last.oldGridY;
        block.rotation = (block.rotation - 1 + 4) % 4;
      }
    }
  }

  _pushHistory(action) {
    this.history.push(action);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  _autoPlaceOne() {
    const unplaced = this.blocks.filter(b => !b.placed);
    if (unplaced.length === 0) return;
    
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
