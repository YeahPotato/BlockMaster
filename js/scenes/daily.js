/**
 * 方块大师 - 签到场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class DailyScene {
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
    this._updateRewards();
  }

  _createButtons() {
    const W = this.W;
    const btnW = 400, btnH = 90;
    const startX = (W - btnW) / 2;
    const startY = this.H / 2 + 150;
    
    this.buttons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, '签 到 领 取', {
        bg: '#FFB400',
        fontSize: 32,
      })
    );
    
    this.buttons.push(
      new Button(this.ctx, startX, startY + btnH + 20, btnW, btnH - 10, '📺 看广告 翻倍领取', {
        bg: '#FF6B6B',
        fontSize: 26,
      })
    );
  }

  _updateRewards() {
    const day = this.databus.save.dailyCheckIn.streak;
    this.rewards = [
      { coins: 50, label: '🪙 50' },
      { coins: 80, label: '🪙 80' },
      { coins: 100, label: '🪙 100' },
      { coins: 150, label: '🪙 150' },
      { hintTicket: 1, label: '⭐ 碎片' },
      { coins: 200, label: '🪙 200' },
      { diamonds: 10, label: '💎 10' },
    ];
    this.todayReward = this.rewards[(day - 1 + 7) % 7]; // 循环显示
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

    // 连续签到天数
    this._renderStreak();

    // 奖励格
    this._renderRewardGrid();

    // 按钮
    for (const btn of this.buttons) {
      btn.enabled = !this._isTodayChecked();
      if (btn.enabled) {
        btn.render();
      } else {
        // 灰色禁用态
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#E9ECEF';
        this._roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 24);
        ctx.fill();
        ctx.fillStyle = '#ADB5BD';
        ctx.font = 'bold 32px PingFang SC, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.restore();
      }
    }
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
    ctx.fillText('每 日 签 到', this.W / 2, 75);
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

  _renderStreak() {
    const ctx = this.ctx;
    const streak = this.databus.save.dailyCheckIn.streak;
    const fontScale = this.scaleY;
    
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${32 * fontScale}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`连续签到第 ${streak} 天 ${streak >= 3 ? '🔥' : ''}`, this.W / 2, 180);
  }

  _renderRewardGrid() {
    const ctx = this.ctx;
    const fontScale = this.scaleY;
    const W = this.W;
    const cellW = 90, cellH = 110;
    const cols = 7;
    const startX = (W - cols * cellW) / 2;
    const startY = 240;

    const today = this.getTodayIndex();

    for (let i = 0; i < 7; i++) {
      const x = startX + i * cellW;
      const y = startY;
      
      // 格子背景
      let bgColor = '#FFFFFF';
      if (i < today) bgColor = '#E8F5E9'; // 已签到
      else if (i === today) bgColor = '#FFF3CD'; // 今日
      
      ctx.fillStyle = bgColor;
      this._roundRect(ctx, x, y, cellW, cellH, 12);
      ctx.fill();

      // 天数
      ctx.fillStyle = '#2C3E50';
      ctx.font = `bold ${24 * fontScale}px PingFang SC, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, x + cellW / 2, y + 35);

      // 状态
      if (i < today) {
        ctx.fillStyle = '#6BCB77';
        ctx.font = `${24 * fontScale}px sans-serif`;
        ctx.fillText('✓', x + cellW / 2, y + 70);
      } else if (i === today) {
        ctx.fillStyle = '#FFB400';
        ctx.font = `${24 * fontScale}px sans-serif`;
        ctx.fillText('👉', x + cellW / 2, y + 70);
      } else {
        ctx.fillStyle = '#8693A6';
        ctx.font = `${24 * fontScale}px sans-serif`;
        ctx.fillText('🔒', x + cellW / 2, y + 70);
      }

      // 奖励
      const reward = this.rewards[i];
      ctx.fillStyle = '#2C3E50';
      ctx.font = `${18 * fontScale}px PingFang SC, sans-serif`;
      ctx.fillText(reward.label, x + cellW / 2, y + 95);
    }
  }

  getTodayIndex() {
    const day = this.databus.save.dailyCheckIn.streak;
    return (day - 1 + 7) % 7;
  }

  _isTodayChecked() {
    const today = this.getTodayStr();
    return this.databus.save.dailyCheckIn.lastDate === today;
  }

  getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onTouchStart(x, y) {
    // 检查返回按钮
    if (this._rectContains(30, 40, 110, 70, x, y)) {
      if (this._sceneManager) {
        this._sceneManager.back();
      }
      return;
    }

    // 检查按钮
    for (const btn of this.buttons) {
      if (btn.hitTest(x, y) && btn.enabled) {
        btn.pressed = true;
        break;
      }
    }
  }

  _rectContains(x, y, w, h, px, py) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (btn.pressed && btn.hitTest(x, y) && btn.enabled) {
        this._handleButtonClick(btn.label);
      }
      btn.pressed = false;
    }
  }

  _handleButtonClick(label) {
    if (label === '签 到 领 取') {
      if (this.databus.checkIn()) {
        const reward = this.todayReward;
        if (reward.coins) {
          this.databus.addCoins(reward.coins);
        }
        if (reward.diamonds) {
          this.databus.addDiamonds(reward.diamonds);
        }
        if (reward.hintTicket) {
          this.databus.addHintTicket();
        }
        this.init(); // 刷新
      }
    } else if (label === '📺 看广告 翻倍领取') {
      // mock 广告
      console.log('[Mock] 广告播放完成');
    }
  }

  onEnter() {}

  onExit() {}
}

module.exports = DailyScene;
