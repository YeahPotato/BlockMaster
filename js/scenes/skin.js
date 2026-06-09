/**
 * 方块大师 - 皮肤场景
 */
const { Sprite, Rect, Text, Button } = require('../base/sprite.js');

const DESIGN_W = 750;
const DESIGN_H = 1334;

class SkinScene {
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
    this.tabButtons = [];
    this.skinCards = [];
    this.currentTab = 0;
    this.scrollY = 0;
    this._createTabs();
    this._createSkinCards();
  }

  _createTabs() {
    const W = this.W;
    const tabW = (W - 60) / 2;
    const startX = 30;
    const y = 130;
    
    this.tabButtons.push(
      new Button(this.ctx, startX, y, tabW - 4, 70, '积木皮肤 (25)', {
        bg: '#FFB400',
        fontSize: 24,
      })
    );
    this.tabButtons.push(
      new Button(this.ctx, startX + tabW, y, tabW - 4, 70, '背景皮肤', {
        bg: '#FFFFFF',
        color: '#8693A6',
        fontSize: 24,
      })
    );
  }

  _createSkinCards() {
    this.skinCards = [];
    // 模拟皮肤数据
    const skins = [
      { id: 'classic', name: '经典糖果', level: 0, colors: ['#5B9DF9', '#FF8B6B', '#6BCB77', '#B084EE'], owned: true, current: true },
      { id: 'cat', name: '猫咪头像', level: 3, colors: ['#FFB4A2', '#FFCDB2', '#A8DADC', '#F1FAEE'], owned: false, cost: '🪙 15000' },
      { id: 'meteor', name: '流星划过', level: 3, colors: ['#3D348B', '#7678ED', '#F35B04', '#F18701'], owned: false, cost: '🪙 20000' },
      { id: 'sakura', name: '樱花飘落', level: 3, colors: ['#FFAEBC', '#FFC4D6', '#FFE0EC', '#FFB6C8'], owned: false, cost: '⭐ 600' },
      { id: 'coral', name: '珊瑚海底', level: 3, colors: ['#1971C2', '#15AABF', '#22B8CF', '#74C0FC'], owned: false, cost: '💎 100' },
      { id: 'iceCrystal', name: '冰晶雪花', level: 3, colors: ['#A5D8FF', '#74C0FC', '#D0BFFF', '#E599F7'], owned: false, cost: '📺×30' },
    ];

    const cardW = 220, cardH = 280;
    const cols = 3;
    const startX = 20;
    const startY = 240;
    const gap = 12;

    for (let i = 0; i < skins.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      this.skinCards.push({ x, y, w: cardW, h: cardH, data: skins[i] });
    }
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

    // 皮肤卡片
    this._renderSkinCards();

    // 底部提示
    this._renderFooter();
  }

  _renderHeader() {
    const ctx = this.ctx;
    
    // 返回按钮
    ctx.fillStyle = '#FFFFFF';
    this._roundRect(ctx, 30, 40, 110, 70, 24);
    ctx.fill();
    ctx.fillStyle = '#2C3E50';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀ 返回', 85, 75);

    // 标题
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 40px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('皮 肤 商 店', this.W / 2, 75);
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

  _renderSkinCards() {
    const ctx = this.ctx;
    for (const card of this.skinCards) {
      const { x, y, w, h, data } = card;
      const { level, name, colors, owned, current, cost } = data;

      // 卡片背景
      ctx.fillStyle = owned ? '#FFFFFF' : '#F8F9FA';
      this._roundRect(ctx, x, y, w, h, 18);
      ctx.fill();

      // 复杂度徽章
      const levelNames = ['L0 纯色', 'L1 几何', 'L2 渐变', 'L3 收藏', 'L4 大师', 'L5 巅峰', 'L6 限定'];
      const badgeColors = ['#E9ECEF', '#D1ECF1', '#FFF3CD', '#F8D7DA', '#E2D9F3', '#FFE0B2', '#FFD3E0'];
      const badgeTextColors = ['#495057', '#0C5460', '#856404', '#721C24', '#4A148C', '#E65100', '#AD1457'];
      
      ctx.fillStyle = badgeColors[level];
      this._roundRect(ctx, x + 12, y + 12, 92, 28, 14);
      ctx.fill();
      ctx.fillStyle = badgeTextColors[level];
      ctx.font = 'bold 16px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(levelNames[level], x + 58, y + 26);

      // 4 色块预览
      const cellSize = 18;
      const shapes = [
        [[1, 1], [1, 1]],
        [[1, 1, 1]],
        [[1, 0], [1, 1]],
        [[0, 1], [1, 1], [1, 0]],
      ];
      const slotW = (w - 12) / 4;
      const previewY = y + 50;
      const previewH = 100;
      
      for (let k = 0; k < 4; k++) {
        const shape = shapes[k];
        const color = colors[k];
        const sw = shape[0].length * cellSize;
        const sh = shape.length * cellSize;
        const slotX = x + 6 + k * slotW + (slotW - sw) / 2;
        const slotY = previewY + (previewH - sh) / 2;

        ctx.fillStyle = color;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
              this._roundRect(ctx, slotX + c * cellSize + 1, slotY + r * cellSize + 1, cellSize - 2, cellSize - 2, 4);
              ctx.fill();
            }
          }
        }
      }

      // 皮肤名
      ctx.fillStyle = owned ? '#2C3E50' : '#8693A6';
      ctx.font = 'bold 22px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name, x + w / 2, y + 165);

      // 按钮
      const btnH = 40;
      const btnY = y + h - btnH - 14;
      const btnW = w - 32;
      const btnX = x + 16;

      let btnBg, btnText;
      if (current) {
        btnBg = '#6BCB77';
        btnText = '使用中 ✓';
      } else if (owned) {
        btnBg = '#FFB400';
        btnText = '点击启用';
      } else {
        btnBg = '#FF6B6B';
        btnText = cost || '🔒';
      }

      ctx.fillStyle = btnBg;
      this._roundRect(ctx, btnX, btnY, btnW, btnH, 12);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px PingFang SC, sans-serif';
      ctx.fillText(btnText, x + w / 2, btnY + 24);
    }
  }

  _renderFooter() {
    const ctx = this.ctx;
    ctx.fillStyle = '#8693A6';
    ctx.font = '18px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↓ 下滑查看更多 ↓', this.W / 2, this.H - 30);
  }

  onTouchStart(x, y) {
    // 检查返回按钮
    if (this._rectContains(30, 40, 110, 70, x, y)) {
      if (this._sceneManager) {
        this._sceneManager.back();
      }
      return;
    }

    // 检查 Tab
    for (const btn of this.tabButtons) {
      if (btn.hitTest(x, y)) {
        this._switchTab(this.tabButtons.indexOf(btn));
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
  }

  onTouchEnd(x, y) {
    // 检查皮肤卡片按钮
    for (const card of this.skinCards) {
      const { x, y, w, h, data } = card;
      const btnY = y + h - 54;
      const btnH = 40;
      const btnW = w - 32;
      
      if (this._rectContains(x + 16, btnY, btnW, btnH, x, y)) {
        this._handleSkinCardClick(data);
        return;
      }
    }
  }

  _handleSkinCardClick(skin) {
    if (skin.current) {
      // 已使用
      return;
    }
    
    if (skin.owned) {
      // 切换使用
      this.databus.setCurrentSkin(skin.id);
      this.init(); // 刷新
      return;
    }
    
    // 购买皮肤
    const costMap = {
      '🪙 15000': { type: 'coins', value: 15000 },
      '🪙 20000': { type: 'coins', value: 20000 },
      '⭐ 600': { type: 'stars', value: 600 },
      '💎 100': { type: 'diamonds', value: 100 },
      '📺×30': { type: 'ad', value: 30 },
    };
    
    const cost = costMap[skin.cost];
    if (!cost) return;
    
    if (cost.type === 'coins') {
      if (this.databus.spendCoins(cost.value)) {
        this.databus.ownSkin(skin.id);
        this.init(); // 刷新
      } else {
        this._showToast('🪙 金币不足');
      }
    } else if (cost.type === 'diamonds') {
      if (this.databus.spendDiamonds(cost.value)) {
        this.databus.ownSkin(skin.id);
        this.init(); // 刷新
      } else {
        this._showToast('💎 钻石不足');
      }
    } else if (cost.type === 'stars') {
      if (this.databus.getTotalStars() >= cost.value) {
        this.databus.ownSkin(skin.id);
        this.init(); // 刷新
      } else {
        this._showToast(`⭐ 需要 ${cost.value} 星`);
      }
    } else if (cost.type === 'ad') {
      // 模拟广告
      console.log('[Mock] 广告播放完成');
      this.databus.ownSkin(skin.id);
      this.init(); // 刷新
    }
  }

  _showToast(message) {
    console.log(message);
  }

  _switchTab(tabIndex) {
    if (tabIndex === this.currentTab) return;
    this.currentTab = tabIndex;
    this._createTabs();
  }

  onEnter() {}

  onExit() {}
}

module.exports = SkinScene;
