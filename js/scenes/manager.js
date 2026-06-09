/**
 * 方块大师 - 场景管理器
 */
const MainScene = require('./main.js');
const SelectScene = require('./select.js');
const GameScene = require('./game.js');
const ResultScene = require('./result.js');
const SkinScene = require('./skin.js');
const DailyScene = require('./daily.js');
const SettingsScene = require('./settings.js');

// 设计稿尺寸
const DESIGN_W = 750;
const DESIGN_H = 1334;

class SceneManager {
  constructor(ctx, databus) {
    this.ctx = ctx;
    this.databus = databus;
    this.currentScene = null;
    this.sceneStack = [];
    this.scaleX = 1;
    this.scaleY = 1;
    this.scenes = {
      main: MainScene,
      select: SelectScene,
      game: GameScene,
      result: ResultScene,
      skin: SkinScene,
      daily: DailyScene,
      settings: SettingsScene,
    };
  }

  setScale(scaleX, scaleY) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  go(sceneName, params = {}) {
    if (!this.scenes[sceneName]) {
      console.error(`Scene not found: ${sceneName}`);
      return;
    }
    if (this.currentScene && this.currentScene.onExit) {
      this.currentScene.onExit();
    }
    const SceneClass = this.scenes[sceneName];
    this.currentScene = new SceneClass(this.ctx, this.databus, params, this.scaleX, this.scaleY);
    // 设置 sceneManager 引用到场景
    if (this.currentScene) {
      this.currentScene._sceneManager = this;
    }
    if (this.currentScene.onEnter) {
      this.currentScene.onEnter();
    }
  }

  push(sceneName, params = {}) {
    this.sceneStack.push(this.currentScene);
    this.go(sceneName, params);
  }

  pop() {
    if (this.sceneStack.length === 0) return;
    const prevScene = this.sceneStack.pop();
    if (prevScene && prevScene.onEnter) {
      prevScene.onEnter();
    }
    this.currentScene = prevScene;
  }

  back() {
    this.pop();
  }

  update(dt) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(dt);
    }
  }

  render() {
    if (!this.currentScene || !this.currentScene.render) return;
    
    const ctx = this.ctx;
    
    // 保存原始状态
    ctx.save();
    
    // 应用缩放变换
    ctx.scale(this.scaleX, this.scaleY);
    
    // 渲染当前场景（所有坐标都是设计稿坐标）
    this.currentScene.render();
    
    // 恢复状态
    ctx.restore();
  }

  handleTouchStart(x, y) {
    if (this.currentScene && this.currentScene.onTouchStart) {
      // 将屏幕坐标转换为设计稿坐标
      const designX = x / this.scaleX;
      const designY = y / this.scaleY;
      this.currentScene.onTouchStart(designX, designY);
    }
  }

  handleTouchMove(x, y) {
    if (this.currentScene && this.currentScene.onTouchMove) {
      const designX = x / this.scaleX;
      const designY = y / this.scaleY;
      this.currentScene.onTouchMove(designX, designY);
    }
  }

  handleTouchEnd(x, y) {
    if (this.currentScene && this.currentScene.onTouchEnd) {
      const designX = x / this.scaleX;
      const designY = y / this.scaleY;
      this.currentScene.onTouchEnd(designX, designY);
    }
  }

  handleTouchCancel() {
    if (this.currentScene && this.currentScene.onTouchCancel) {
      this.currentScene.onTouchCancel();
    }
  }
}

module.exports = SceneManager;
