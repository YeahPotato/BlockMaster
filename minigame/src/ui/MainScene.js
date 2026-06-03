/**
 * 主菜单场景
 */

const { GameConfig } = require('../GameConfig.js');
const { SceneManager } = require('../core/SceneManager.js');
const { SaveSystem } = require('../system/SaveSystem.js');
const { RewardSystem } = require('../system/RewardSystem.js');
const { Button, drawText, drawRoundRect } = require('./UIUtils.js');

class MainScene {
  constructor() {
    this.buttons = [];
  }

  onEnter() {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    const btnW = W * 0.6;
    const btnH = 100;
    const cx = (W - btnW) / 2;

    this.buttons = [
      new Button({
        x: cx, y: H * 0.5, w: btnW, h: btnH,
        text: '开始游戏',
        bgColor: '#339AF0',
        fontSize: 36,
        onClick: () => {
          // 延迟 require 避免循环依赖
          const { ChapterScene } = require('./ChapterScene.js');
          SceneManager.replace(new ChapterScene());
        },
      }),
      new Button({
        x: cx, y: H * 0.5 + 130, w: btnW, h: btnH,
        text: '皮肤商店',
        bgColor: '#845EF7',
        fontSize: 32,
        onClick: () => {
          console.log('皮肤商店待开发');
        },
      }),
      new Button({
        x: cx, y: H * 0.5 + 260, w: btnW, h: btnH,
        text: '每日挑战',
        bgColor: '#51CF66',
        fontSize: 32,
        onClick: () => {
          console.log('每日挑战待开发');
        },
      }),
    ];

    RewardSystem.checkDailySignin();
  }

  onTouchStart(x, y) {
    for (const b of this.buttons) b.onTouchStart(x, y);
  }
  onTouchEnd(x, y) {
    for (const b of this.buttons) b.onTouchEnd(x, y);
  }

  update(dt) {}

  render(ctx) {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#FFE9A0');
    grad.addColorStop(1, '#A0D8FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawText(ctx, '🧩 方块大师', W / 2, H * 0.18, {
      size: 72, bold: true, color: '#333', align: 'center',
    });
    drawText(ctx, 'Block Master', W / 2, H * 0.18 + 90, {
      size: 28, color: '#666', align: 'center',
    });

    this._renderTopBar(ctx);

    const progress = SaveSystem.progress;
    drawText(
      ctx,
      `已通关 ${progress.maxUnlockedLevel - 1} 关  ⭐ ${progress.totalStars}`,
      W / 2, H * 0.4,
      { size: 28, color: '#555', align: 'center' }
    );

    for (const b of this.buttons) b.render(ctx);

    drawText(ctx, `v${GameConfig.version}`, W / 2, H - 60, {
      size: 22, color: '#999', align: 'center',
    });
  }

  _renderTopBar(ctx) {
    const y = 30;
    const h = 60;
    const padding = 20;

    ctx.fillStyle = '#fff';
    drawRoundRect(ctx, padding, y, 180, h, 30);
    ctx.fill();
    drawText(ctx, `🪙 ${RewardSystem.getCoins()}`, padding + 90, y + h / 2, {
      size: 26, bold: true, color: '#333', align: 'center', baseline: 'middle',
    });

    ctx.fillStyle = '#fff';
    drawRoundRect(ctx, padding + 200, y, 180, h, 30);
    ctx.fill();
    drawText(ctx, `💎 ${RewardSystem.getDiamonds()}`, padding + 200 + 90, y + h / 2, {
      size: 26, bold: true, color: '#333', align: 'center', baseline: 'middle',
    });
  }
}

module.exports = { MainScene };
