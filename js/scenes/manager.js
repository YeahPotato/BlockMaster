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
    this.scale = 1; // 由 main.js 设置
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

  setScale(scale) {
    this.scale = scale;
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
    this.currentScene = new SceneClass(this.ctx, this.databus, params, this.scale);
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
    const canvas = ctx.canvas;
    
    // 获取屏幕实际尺寸
    const sysInfo = wx.getSystemInfoSync();
    const screenWidth = sysInfo.screenWidth;
    const screenHeight = sysInfo.screenHeight;
    
    // 计算居中偏移（以短边为基准时会出现黑边）
    const scaleX = screenWidth / DESIGN_W;
    const scaleY = screenHeight / DESIGN_H;
    const scale = Math.min(scaleX, scaleY);
    
    // 计算黑边偏移量
    const offsetX = (screenWidth - DESIGN_W * scale) / 2;
    const offsetY = (screenHeight - DESIGN_H * scale) / 2;
    
    // 保存原始状态
    ctx.save();
    
    // 平移到居中位置，然后缩放
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // 渲染当前场景（所有坐标都是设计稿坐标）
    this.currentScene.render();
    
    // 恢复状态
    ctx.restore();
  }

  handleTouchStart(x, y) {
    if (this.currentScene && this.currentScene.onTouchStart) {
      this.currentScene.onTouchStart(x, y);
    }
  }

  handleTouchMove(x, y) {
    if (this.currentScene && this.currentScene.onTouchMove) {
      this.currentScene.onTouchMove(x, y);
    }
  }

  handleTouchEnd(x, y) {
    if (this.currentScene && this.currentScene.onTouchEnd) {
      this.currentScene.onTouchEnd(x, y);
    }
  }

  handleTouchCancel() {
    if (this.currentScene && this.currentScene.onTouchCancel) {
      this.currentScene.onTouchCancel();
    }
  }
}

module.exports = SceneManager;
