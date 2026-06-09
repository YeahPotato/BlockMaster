/**
 * 方块大师 - 结算场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class ResultScene {
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
    this.buttons = [];
    this._createButtons();
    this.animateIn = 0;
  }

  _createButtons() {
    const W = this.W;
    const btnW = 360, btnH = 90;
    const startX = (W - btnW) / 2;
    const startY = this.H / 2 + 100;
    const gap = 20;

    this.buttons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, '📺 看广告 金币×2', {
        bg: '#FF6B6B',
        fontSize: 28,
      })
    );
    this.buttons.push(
      new Button(this.ctx, startX, startY + btnH + gap, btnW, btnH, '下 一 关  →', {
        bg: '#FFB400',
        fontSize: 32,
      })
    );
    this.buttons.push(
      new Button(this.ctx, startX, startY + (btnH + gap) * 2, btnW, btnH - 10, '返回选关', {
        bg: '#E9ECEF',
        color: '#2C3E50',
        fontSize: 28,
      })
    );
  }

  update(dt) {
    this.animateIn += dt;
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // 遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);

    // 弹层
    const boxW = 560, boxH = 480;
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
    ctx.fillText('🎉 通关成功！', W / 2, boxY + 80);

    // 星级
    ctx.fillStyle = '#FFB400';
    ctx.font = '48px sans-serif';
    ctx.fillText('⭐ ⭐ ⭐', W / 2, boxY + 150);

    // 时间
    ctx.fillStyle = '#8693A6';
    ctx.font = '24px PingFang SC, sans-serif';
    ctx.fillText(`⏱ 0:42`, W / 2, boxY + 220);

    // 提示使用情况
    ctx.fillStyle = '#8693A6';
    ctx.font = '20px PingFang SC, sans-serif';
    ctx.fillText('💡 未使用提示', W / 2, boxY + 250);

    // 奖励
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 28px PingFang SC, sans-serif';
    ctx.fillText('🪙 +120  💎 +5', W / 2, boxY + 300);

    // 按钮
    for (const btn of this.buttons) {
      btn.render();
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
    if (label === '📺 看广告 金币×2') {
      // mock 广告
      console.log('[Mock] 广告播放完成');
    } else if (label === '下 一 关  →') {
      const next = this.databus.getNextLevel(this.params.chapter, this.params.level);
      if (this._sceneManager) {
        this._sceneManager.go('game', next);
      }
    } else if (label === '返回选关') {
      if (this._sceneManager) {
        this._sceneManager.go('select');
      }
    }
  }

  onEnter() {}

  onExit() {}
}

module.exports = ResultScene;
