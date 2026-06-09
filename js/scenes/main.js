/**
 * 方块大师 - 主菜单场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

// 设计稿尺寸
const DESIGN_W = 750;
const DESIGN_H = 1334;

class MainScene {
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
    this.buttons = [];
    this._createButtons();
    this.animateIn = 0;
    this.titleBounce = 0;
  }

  _createButtons() {
    const W = this.W, H = this.H;
    const btnW = 520, btnH = 96;
    const startX = (W - btnW) / 2;
    const startY = 580;
    const gap = 24;

    this.buttons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, '▶ 开始游戏', {
        bg: '#FFB400',
        fontSize: 40 * this.scaleY,
      })
    );

    // 双联小按钮
    const smallW = 240, smallH = 80;
    this.buttons.push(
      new Button(this.ctx, startX + 20, startY + btnH + gap + 20, smallW, smallH, '📅 签到', {
        bg: '#5B9DF9',
        fontSize: 28 * this.scaleY,
      })
    );
    this.buttons.push(
      new Button(this.ctx, startX + smallW + 20, startY + btnH + gap + 20, smallW, smallH, '🎁 挑战', {
        bg: '#6BCB77',
        fontSize: 28 * this.scaleY,
      })
    );

    this.buttons.push(
      new Button(this.ctx, startX + 20, startY + btnH + gap + 20 + smallH + 12, smallW, smallH, '🎨 皮肤', {
        bg: '#B084EE',
        fontSize: 28 * this.scaleY,
      })
    );
    this.buttons.push(
      new Button(this.ctx, startX + smallW + 20, startY + btnH + gap + 20 + smallH + 12, smallW, smallH, '📊 排行榜', {
        bg: '#FF8B6B',
        fontSize: 28 * this.scaleY,
      })
    );
  }

  update(dt) {
    this.animateIn += dt;
    this.titleBounce = Math.sin(this.animateIn * 0.003) * 4;
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#FFE9A0');
    grad.addColorStop(0.5, '#FFFFFF');
    grad.addColorStop(1, '#E8F4FC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 装饰积木
    this._renderDecorBlocks();

    // 标题
    this._renderTitle();

    // 进度摘要
    this._renderProgress();

    // 按钮
    for (const btn of this.buttons) {
      btn.render();
    }

    // 版本号
    this._renderVersion();
  }

  _renderDecorBlocks() {
    const ctx = this.ctx;
    const blocks = [
      { x: 80, y: 280, color: '#5B9DF9', shape: [[1, 1], [1, 1]] },
      { x: 590, y: 200, color: '#FF8B6B', shape: [[1, 1, 1]] },
      { x: 600, y: 500, color: '#6BCB77', shape: [[1, 0], [1, 1]] },
      { x: 100, y: 480, color: '#B084EE', shape: [[0, 1], [1, 1], [1, 0]] },
    ];
    for (const b of blocks) {
      this._drawBlock(b.x, b.y, 50, b.color, b.shape);
    }
  }

  _drawBlock(x, y, cellSize, color, shape) {
    const ctx = this.ctx;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          ctx.fillStyle = color;
          const px = x + c * cellSize;
          const py = y + r * cellSize;
          const r2 = cellSize * 0.25;
          ctx.beginPath();
          ctx.moveTo(px + r2, py);
          ctx.lineTo(px + cellSize - r2, py);
          ctx.quadraticCurveTo(px + cellSize, py, px + cellSize, py + r2);
          ctx.lineTo(px + cellSize, py + cellSize - r2);
          ctx.quadraticCurveTo(px + cellSize, py + cellSize, px + cellSize - r2, py + cellSize);
          ctx.lineTo(px + r2, py + cellSize);
          ctx.quadraticCurveTo(px, py + cellSize, px, py + cellSize - r2);
          ctx.lineTo(px, py + r2);
          ctx.quadraticCurveTo(px, py, px + r2, py);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  _renderTitle() {
    const ctx = this.ctx;
    const W = this.W;
    const bounce = this.titleBounce;
    const fontScale = this.scaleY;

    // Emoji
    ctx.font = `${120 * fontScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧩', W / 2, 220 + bounce);

    // 标题
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${64 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText('方块大师', W / 2, 340 + bounce);

    // 副标
    ctx.fillStyle = '#8693A6';
    ctx.font = `${24 * fontScale}px PingFang SC, sans-serif`;
    ctx.fillText('Block Master', W / 2, 380 + bounce);
  }

  _renderProgress() {
    const ctx = this.ctx;
    const W = this.W;
    const totalStars = this.databus.getTotalStars();
    const text = `已通关 ${this.databus.save.currentLevel || '1-1'} 关 · ⭐ ${totalStars}`;
    ctx.fillStyle = '#2C3E50';
    ctx.font = `${20 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, 440);
  }

  _renderVersion() {
    const ctx = this.ctx;
    ctx.fillStyle = '#8693A6';
    ctx.font = `${16 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('v1.0.0', this.W / 2, this.H - 40);
  }

  onTouchStart(x, y) {
    for (const btn of this.buttons) {
      if (btn.hitTest(x, y)) {
        btn.pressed = true;
        break;
      }
    }
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (btn.pressed && btn.hitTest(x, y)) {
        this._handleButtonClick(btn.label);
      }
      btn.pressed = false;
    }
  }

  _handleButtonClick(label) {
    switch (label) {
      case '▶ 开始游戏':
        this._goToSelect();
        break;
      case '📅 签到':
        this._goToDaily();
        break;
      case '🎁 挑战':
        this._showComingSoon('每日挑战');
        break;
      case '🎨 皮肤':
        this._goToSkin();
        break;
      case '📊 排行榜':
        this._showRankList();
        break;
    }
  }

  async _showRankList() {
    try {
      if (wx.cloud) {
        const res = await wx.cloud.callFunction({
          name: 'blockMaster',
          data: {
            action: 'getRank',
            data: { chapter: 1, level: 1, limit: 10 },
          },
        });
        
        if (res.result.code === 0) {
          const list = res.result.data;
          console.log('排行榜:', list);
          // 可以显示排行榜弹窗
          wx.showModal({
            title: '排行榜 (1-1)',
            content: list.map((item, i) => `${i + 1}. ${item.nickname} - ${item.bestTime}s`).join('\n') || '暂无数据',
            showCancel: false,
          });
        }
      }
    } catch (e) {
      console.error('Get rank error:', e);
      wx.showToast({ title: '排行榜加载失败', icon: 'none' });
    }
  }

  _showComingSoon(feature) {
    wx.showToast({ title: `${feature} 敬请期待`, icon: 'none' });
  }

  _goToSelect() {
    if (this._sceneManager) {
      this._sceneManager.go('select');
    }
  }

  _goToDaily() {
    if (this._sceneManager) {
      this._sceneManager.go('daily');
    }
  }

  _goToSkin() {
    if (this._sceneManager) {
      this._sceneManager.go('skin');
    }
  }

  _showComingSoon(feature) {
    // 简单的 toast 提示
    console.log(`${feature} 敬请期待`);
  }

  onEnter() {}

  onExit() {}
}

module.exports = MainScene;
