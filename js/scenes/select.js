/**
 * 方块大师 - 选关场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class SelectScene {
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
    this.levelButtons = [];
    this.tabButtons = [];
    this.currentTab = 0; // 0-4 对应 1-5 星
    this.scrollY = 0;
    this._createTabs();
    this._createLevelButtons();
  }

  _createTabs() {
    const W = this.W;
    const tabW = (W - 60) / 5;
    const startX = 30;
    const y = 130;
    const labels = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
    for (let i = 0; i < 5; i++) {
      const btn = new Button(this.ctx, startX + i * tabW, y, tabW - 4, 70, labels[i], {
        bg: i === this.currentTab ? '#FF8B6B' : '#FFFFFF',
        color: i === this.currentTab ? '#FFFFFF' : '#8693A6',
        fontSize: 26,
      });
      this.tabButtons.push(btn);
    }
  }

  _createLevelButtons() {
    this.levelButtons = [];
    // 根据当前 tab 获取关卡列表
    const chapter = this.currentTab + 1;
    const levelCount = [40, 50, 50, 40, 20][this.currentTab];
    
    const cellW = 130, cellH = 130;
    const cols = 5;
    const startX = 30;
    const startY = 240;
    const gap = 16;

    for (let i = 1; i <= levelCount; i++) {
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      const x = startX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);
      
      const levelData = {
        chapter,
        level: i,
        stars: this.databus.getStars(chapter, i),
        unlocked: this._isUnlocked(chapter, i),
      };
      
      this.levelButtons.push({ x, y, w: cellW, h: cellH, data: levelData });
    }
  }

  _isUnlocked(chapter, level) {
    // 简单逻辑：前一关 1 星即可解锁
    if (level === 1) return chapter === 1;
    return this.databus.getStars(chapter, level - 1) >= 1 || 
           this.databus.getStars(chapter - 1, this._getMaxLevel(chapter - 1)) >= 1;
  }

  _getMaxLevel(chapter) {
    return [40, 50, 50, 40, 20][chapter - 1];
  }

  update(dt) {}

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 背景
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, W, H);

    // 顶栏
    this._renderHeader();

    // Tab 栏
    for (const btn of this.tabButtons) {
      btn.render();
    }

    // 关卡网格
    this._renderLevelGrid();

    // 底部提示
    this._renderFooter();
  }

  _renderHeader() {
    const ctx = this.ctx;
    const fontScale = this.scaleY;
    // 返回按钮
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, 30, 40, 110, 70, 24);
    ctx.fill();
    ctx.fillStyle = '#2C3E50';
    ctx.font = `${24 * fontScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀ 返回', 85, 75);

    // 标题
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${40 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('选 择 关 卡', this.W / 2, 75);
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

  _renderLevelGrid() {
    const ctx = this.ctx;
    const fontScale = this.scaleY;
    for (const item of this.levelButtons) {
      const { x, y, w, h, data } = item;
      const { chapter, level, stars, unlocked } = data;

      // 背景
      ctx.fillStyle = unlocked ? '#FFFFFF' : '#DEE2E6';
      this._roundRect(ctx, x, y, w, h, 16);
      ctx.fill();

      // 关卡序号
      ctx.fillStyle = unlocked ? '#2C3E50' : '#ADB5BD';
      ctx.font = `bold ${48 * fontScale}px PingFang SC, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${level}`, x + w / 2, y + h / 2 - 20);

      // 星数
      if (stars > 0) {
        ctx.fillStyle = '#FFB400';
        ctx.font = `${28 * fontScale}px sans-serif`;
        ctx.fillText('⭐'.repeat(stars), x + w / 2, y + h / 2 + 30);
      } else if (!unlocked) {
        ctx.fillStyle = '#8693A6';
        ctx.font = `${28 * fontScale}px sans-serif`;
        ctx.fillText('🔒', x + w / 2, y + h / 2 + 30);
      }
    }
  }

  _renderFooter() {
    const ctx = this.ctx;
    ctx.fillStyle = '#8693A6';
    ctx.font = `${18 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('点击关卡开始游戏', this.W / 2, this.H - 40);
  }

  onTouchStart(x, y) {
    // 检查 Tab
    for (const btn of this.tabButtons) {
      if (btn.hitTest(x, y)) {
        this._switchTab(this.tabButtons.indexOf(btn));
        return;
      }
    }
    // 检查关卡
    for (const item of this.levelButtons) {
      if (this._rectContains(item.x, item.y, item.w, item.h, x, y)) {
        if (item.data.unlocked) {
          this._startLevel(item.data.chapter, item.data.level);
        }
        return;
      }
    }
  }

  _rectContains(x, y, w, h, px, py) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  _switchTab(tabIndex) {
    if (tabIndex === this.currentTab) return;
    this.currentTab = tabIndex;
    this._createTabs();
    this._createLevelButtons();
  }

  _startLevel(chapter, level) {
    if (this._sceneManager) {
      this._sceneManager.go('game', { chapter, level });
    }
  }

  onTouchEnd(x, y) {}

  onEnter() {}

  onExit() {}
}

module.exports = SelectScene;
