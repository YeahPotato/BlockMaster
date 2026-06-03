/**
 * 章节选择 + 关卡选择场景
 */

const { GameConfig } = require('../GameConfig.js');
const { SceneManager } = require('../core/SceneManager.js');
const { LevelManager } = require('../system/LevelManager.js');
const { SaveSystem } = require('../system/SaveSystem.js');
const { Button, drawText, drawRoundRect } = require('./UIUtils.js');

class ChapterScene {
  constructor() {
    this.chapters = [];
    this.selectedChapter = null;
    this.chapterButtons = [];
    this.levelButtons = [];
    this.backButton = null;
    this.scrollY = 0;
    this.maxScrollY = 0;
    this._dragStartY = null;
    this._dragStartScroll = 0;
  }

  onEnter() {
    this.chapters = LevelManager.getChapters();

    if (this.chapters.length === 0) {
      // 异步加载情形（浏览器调试），延迟重试
      setTimeout(() => {
        this.chapters = LevelManager.getChapters();
        this._buildChapterUI();
      }, 300);
    }

    this._buildChapterUI();
  }

  _buildChapterUI() {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    this.chapterButtons = [];
    const padding = 30;
    const btnW = W - padding * 2;
    const btnH = 110;
    const startY = 160;

    this.chapters.forEach((ch, idx) => {
      this.chapterButtons.push(
        new Button({
          x: padding, y: startY + idx * (btnH + 16), w: btnW, h: btnH,
          text: `${ch.icon}  第${ch.id}章 · ${ch.name}`,
          bgColor: this._chapterColor(idx),
          fontSize: 32,
          onClick: () => this._selectChapter(ch),
        })
      );
    });

    this.maxScrollY = Math.max(
      0,
      startY + this.chapters.length * (btnH + 16) - H + 100
    );

    this.backButton = new Button({
      x: padding, y: 40, w: 120, h: 70,
      text: '< 返回',
      bgColor: '#ADB5BD',
      fontSize: 26,
      onClick: () => {
        if (this.selectedChapter) {
          this.selectedChapter = null;
          this.levelButtons = [];
        } else {
          const { MainScene } = require('./MainScene.js');
          SceneManager.replace(new MainScene());
        }
      },
    });
  }

  _chapterColor(idx) {
    const palette = ['#51CF66', '#339AF0', '#F783AC', '#FFA94D', '#9775FA',
                     '#FA5252', '#FCC419', '#5C7CFA', '#82C91E', '#E64980'];
    return palette[idx % palette.length];
  }

  async _selectChapter(chapter) {
    this.selectedChapter = chapter;
    this.scrollY = 0;
    try {
      const data = await LevelManager.loadChapter(chapter.id);
      this._buildLevelUI(data);
    } catch (e) {
      console.error('Load chapter failed:', e);
    }
  }

  _buildLevelUI(chapterData) {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    this.levelButtons = [];
    if (!chapterData || !chapterData.levels) return;

    const cols = 5;
    const padding = 30;
    const gap = 16;
    const btnSize = (W - padding * 2 - gap * (cols - 1)) / cols;
    const startY = 160;
    const maxLevel = SaveSystem.progress.maxUnlockedLevel;

    chapterData.levels.forEach((lv, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padding + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);
      const unlocked = lv.levelId <= maxLevel;
      const stars = SaveSystem.progress.stars[lv.levelId] || 0;

      this.levelButtons.push({
        x, y, w: btnSize, h: btnSize, level: lv, unlocked, stars,
        _pressed: false,
        onTouchStart(px, py) {
          if (px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h) {
            this._pressed = true;
            return true;
          }
          return false;
        },
        onTouchEnd(px, py) {
          const hit = px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
          const wasPressed = this._pressed;
          this._pressed = false;
          if (hit && wasPressed && this.unlocked) {
            const { GameScene } = require('./GameScene.js');
            SceneManager.replace(new GameScene(this.level));
          }
        },
      });
    });

    const totalRows = Math.ceil(chapterData.levels.length / cols);
    this.maxScrollY = Math.max(0, startY + totalRows * (btnSize + gap) - H + 100);
  }

  onTouchStart(x, y) {
    if (this.backButton.onTouchStart(x, y)) return;
    this._dragStartY = y;
    this._dragStartScroll = this.scrollY;

    const adjY = y + this.scrollY;
    if (this.selectedChapter) {
      for (const b of this.levelButtons) b.onTouchStart(x, adjY);
    } else {
      for (const b of this.chapterButtons) b.onTouchStart(x, adjY);
    }
  }

  onTouchMove(x, y) {
    if (this._dragStartY !== null) {
      const dy = this._dragStartY - y;
      this.scrollY = Math.max(0, Math.min(this.maxScrollY, this._dragStartScroll + dy));
    }
  }

  onTouchEnd(x, y) {
    if (this.backButton.onTouchEnd(x, y)) {
      this._dragStartY = null;
      return;
    }
    const dragDist = this._dragStartY === null ? 0 : Math.abs(y - this._dragStartY);
    this._dragStartY = null;

    if (dragDist > 10) return;

    const adjY = y + this.scrollY;
    if (this.selectedChapter) {
      for (const b of this.levelButtons) b.onTouchEnd(x, adjY);
    } else {
      for (const b of this.chapterButtons) b.onTouchEnd(x, adjY);
    }
  }

  update(dt) {}

  render(ctx) {
    const W = GameConfig.canvas.width;
    const H = GameConfig.canvas.height;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, W, H);

    const title = this.selectedChapter
      ? `${this.selectedChapter.icon} ${this.selectedChapter.name}`
      : '选择章节';
    drawText(ctx, title, W / 2, 60, {
      size: 40, bold: true, color: '#333', align: 'center',
    });

    ctx.save();
    ctx.translate(0, -this.scrollY);

    if (this.selectedChapter) {
      this._renderLevels(ctx);
    } else {
      for (const b of this.chapterButtons) b.render(ctx);
    }

    ctx.restore();

    if (this.backButton) this.backButton.render(ctx);
  }

  _renderLevels(ctx) {
    for (const lb of this.levelButtons) {
      ctx.save();
      if (lb._pressed) ctx.globalAlpha = 0.7;
      ctx.fillStyle = lb.unlocked ? '#fff' : '#DEE2E6';
      drawRoundRect(ctx, lb.x, lb.y, lb.w, lb.h, 16);
      ctx.fill();

      const levelInChapter = lb.level.levelInChapter;
      drawText(ctx, `${levelInChapter}`, lb.x + lb.w / 2, lb.y + lb.h * 0.4, {
        size: 38, bold: true, color: lb.unlocked ? '#333' : '#999',
        align: 'center', baseline: 'middle',
      });

      let starText = '';
      for (let i = 0; i < 3; i++) {
        starText += i < lb.stars ? '★' : '☆';
      }
      drawText(ctx, starText, lb.x + lb.w / 2, lb.y + lb.h * 0.75, {
        size: 22, color: lb.unlocked ? '#FFC107' : '#CCC',
        align: 'center', baseline: 'middle',
      });

      if (!lb.unlocked) {
        drawText(ctx, '🔒', lb.x + lb.w / 2, lb.y + lb.h * 0.4, {
          size: 36, align: 'center', baseline: 'middle',
        });
      }

      ctx.restore();
    }
  }
}

module.exports = { ChapterScene };
