/**
 * 通关结算场景
 */

const { GameConfig } = require('../GameConfig.js');
const { SceneManager } = require('../core/SceneManager.js');
const { LevelManager } = require('../system/LevelManager.js');
const { RewardSystem } = require('../system/RewardSystem.js');
const { AdManager } = require('../ad/AdManager.js');
const { Button, drawText, drawRoundRect } = require('./UIUtils.js');

class ResultScene {
  constructor(levelData, stars, timeUsedSec, reward) {
    this.levelData = levelData;
    this.stars = stars;
    this.timeUsedSec = timeUsedSec;
    this.reward = reward;
    this.buttons = [];
  }

  onEnter() {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    const btnW = W * 0.7;
    const btnH = 90;
    const cx = (W - btnW) / 2;

    this.buttons = [
      new Button({
        x: cx, y: H * 0.55, w: btnW, h: btnH,
        text: '📺 看广告 +金币×2',
        bgColor: '#FA5252',
        fontSize: 28,
        onClick: () => this._doubleReward(),
      }),
      new Button({
        x: cx, y: H * 0.55 + btnH + 20, w: btnW, h: btnH,
        text: '下一关 →',
        bgColor: '#339AF0',
        fontSize: 32,
        onClick: () => this._nextLevel(),
      }),
      new Button({
        x: cx, y: H * 0.55 + (btnH + 20) * 2, w: btnW, h: btnH,
        text: '返回选关',
        bgColor: '#ADB5BD',
        fontSize: 28,
        onClick: () => {
          const { ChapterScene } = require('./ChapterScene.js');
          SceneManager.replace(new ChapterScene());
        },
      }),
    ];
  }

  async _doubleReward() {
    const ok = await AdManager.showRewardVideo('doubleReward');
    if (ok) {
      RewardSystem.addCoins(this.reward.coins);
      this.reward.coins *= 2;
      this.buttons.shift();
    }
  }

  async _nextLevel() {
    const next = await LevelManager.getLevelById(this.levelData.levelId + 1);
    if (next) {
      const { GameScene } = require('./GameScene.js');
      SceneManager.replace(new GameScene(next));
    } else {
      const { ChapterScene } = require('./ChapterScene.js');
      SceneManager.replace(new ChapterScene());
    }
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

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);

    const panelW = W * 0.85;
    const panelH = H * 0.7;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2 - 50;

    ctx.fillStyle = '#fff';
    drawRoundRect(ctx, panelX, panelY, panelW, panelH, 24);
    ctx.fill();

    drawText(ctx, '🎉 通关成功！', W / 2, panelY + 60, {
      size: 48, bold: true, color: '#333', align: 'center',
    });

    const starY = panelY + 160;
    let starText = '';
    for (let i = 0; i < 3; i++) {
      starText += i < this.stars ? '⭐' : '☆';
    }
    drawText(ctx, starText, W / 2, starY, {
      size: 60, color: '#FFC107', align: 'center',
    });

    drawText(ctx, `用时 ${this.timeUsedSec}s`, W / 2, starY + 90, {
      size: 26, color: '#666', align: 'center',
    });

    let rewardY = starY + 150;
    if (this.reward.coins) {
      drawText(ctx, `🪙 +${this.reward.coins}`, W / 2, rewardY, {
        size: 30, bold: true, color: '#FFA94D', align: 'center',
      });
      rewardY += 40;
    }
    if (this.reward.diamonds) {
      drawText(ctx, `💎 +${this.reward.diamonds}`, W / 2, rewardY, {
        size: 30, bold: true, color: '#339AF0', align: 'center',
      });
      rewardY += 40;
    }
    if (this.reward.stickerPiece) {
      drawText(ctx, `🎫 贴纸碎片 +${this.reward.stickerPiece}`, W / 2, rewardY, {
        size: 28, bold: true, color: '#845EF7', align: 'center',
      });
    }

    for (const b of this.buttons) b.render(ctx);
  }
}

module.exports = { ResultScene };
