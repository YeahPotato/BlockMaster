/**
 * 方块大师 - 设置场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class SettingsScene {
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
    this.items = [];
    this.buttons = [];
    this._createItems();
    this._createButtons();
  }

  _createItems() {
    const W = this.W;
    const startY = 180;
    const itemH = 80;
    const settings = this.databus.getSettings();

    // 背景音乐
    this.items.push({
      icon: '🎵',
      label: '背景音乐',
      value: settings.bgm,
      type: 'toggle',
      key: 'bgm',
      y: startY,
    });

    // 音效
    this.items.push({
      icon: '🔊',
      label: '音效',
      value: settings.sfx,
      type: 'toggle',
      key: 'sfx',
      y: startY + itemH,
    });

    // 震动
    this.items.push({
      icon: '📳',
      label: '震动反馈',
      value: settings.vibration,
      type: 'toggle',
      key: 'vibration',
      y: startY + itemH * 2,
    });

    // 语言
    this.items.push({
      icon: '🌐',
      label: '语言',
      value: settings.language === 'zh_CN' ? '简体中文' : settings.language,
      type: 'text',
      y: startY + itemH * 3 + 20,
    });

    // 当前皮肤
    this.items.push({
      icon: '🎨',
      label: '当前皮肤',
      value: this.databus.save.currentSkin || '经典糖果',
      type: 'text',
      y: startY + itemH * 4 + 20,
    });
  }

  _createButtons() {
    const W = this.W;
    const btnW = 360, btnH = 80;
    const startX = (W - btnW) / 2;
    const startY = this.H - 200;

    this.buttons.push(
      new Button(this.ctx, startX, startY, btnW, btnH, '⚠ 重置游戏数据', {
        bg: '#FF6B6B',
        fontSize: 28 * this.scaleY,
      })
    );
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

    // 设置项
    for (const item of this.items) {
      this._renderItem(item);
    }

    // 分隔线
    ctx.strokeStyle = '#E9ECEF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, this.items[2].y + 80);
    ctx.lineTo(W - 60, this.items[2].y + 80);
    ctx.stroke();

    // 按钮
    for (const btn of this.buttons) {
      btn.render();
    }

    // 版本号
    ctx.fillStyle = '#8693A6';
    ctx.font = `${16 * this.scaleY}px PingFang SC, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('v1.0.0', W / 2, H - 40);
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
    ctx.fillText('设 置', W / 2, 75);
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

  _renderItem(item) {
    const ctx = this.ctx;
    const W = this.W;
    const fontScale = this.scaleY;

    // 图标
    ctx.font = `${32 * fontScale}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 60, item.y + 40);

    // 标签
    ctx.fillStyle = '#2C3E50';
    ctx.font = '28px PingFang SC, sans-serif';
    ctx.fillText(item.label, 100, item.y + 20);

    // 值/开关
    if (item.type === 'toggle') {
      const switchX = W - 120;
      const switchY = item.y + 15;
      const switchW = 90, switchH = 50;
      
      ctx.fillStyle = item.value ? '#5B9DF9' : '#E9ECEF';
      this._roundRect(ctx, switchX, switchY, switchW, switchH, 25);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${24 * this.scaleY}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(item.value ? 'ON' : 'OFF', switchX + switchW / 2, switchY + switchH / 2);
    } else if (item.type === 'text') {
      ctx.fillStyle = '#8693A6';
      ctx.font = `${24 * this.scaleY}px PingFang SC, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(item.value + ' ▶', W - 80, item.y + 40);
    }
  }

  onTouchStart(x, y) {
    // 检查返回按钮
    if (this._rectContains(30, 40, 110, 70, x, y)) {
      if (typeof this._sceneManager !== 'undefined') {
        this._sceneManager.back();
      }
      return;
    }

    // 检查设置项
    for (const item of this.items) {
      if (y >= item.y && y <= item.y + 80) {
        if (item.type === 'toggle') {
          this.databus.setSetting(item.key, !item.value);
          this.init();
        }
        break;
      }
    }

    // 检查按钮
    for (const btn of this.buttons) {
      if (btn.hitTest(x, y)) {
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
      if (btn.pressed && btn.hitTest(x, y)) {
        this._handleButtonClick(btn.label);
      }
      btn.pressed = false;
    }
  }

  _handleButtonClick(label) {
    if (label === '⚠ 重置游戏数据') {
      // 确认重置
      console.log('重置游戏数据');
      // 实际项目中应弹出确认对话框
    }
  }

  onEnter() {}

  onExit() {}
}

module.exports = SettingsScene;
