/**
 * GameApp - 游戏主入口类
 */

const { GameConfig } = require('./GameConfig.js');
const { SceneManager } = require('./core/SceneManager.js');
const { InputManager } = require('./core/InputManager.js');
const { LevelManager } = require('./system/LevelManager.js');
const { SaveSystem } = require('./system/SaveSystem.js');
const { SkinSystem } = require('./system/SkinSystem.js');
const { RewardSystem } = require('./system/RewardSystem.js');
const { AdManager } = require('./ad/AdManager.js');
const { MainScene } = require('./ui/MainScene.js');

class GameApp {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.lastFrameTime = 0;
    this.running = false;
  }

  start() {
    this._initCanvas();
    this._initSystems();
    this._initFirstScene();
    this._startLoop();
  }

  _initCanvas() {
    // 微信小游戏环境
    if (typeof wx !== 'undefined') {
      this.canvas = wx.createCanvas();
      const sysInfo = wx.getSystemInfoSync();
      this.canvas.width = sysInfo.windowWidth * (sysInfo.pixelRatio || 1);
      this.canvas.height = sysInfo.windowHeight * (sysInfo.pixelRatio || 1);
      GameConfig.canvas.width = this.canvas.width;
      GameConfig.canvas.height = this.canvas.height;
      GameConfig.canvas.dpr = sysInfo.pixelRatio || 1;
    } else {
      // 浏览器调试环境
      this.canvas = document.getElementById('gameCanvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'gameCanvas';
        this.canvas.width = 750;
        this.canvas.height = 1334;
        document.body.appendChild(this.canvas);
      }
      GameConfig.canvas.width = this.canvas.width;
      GameConfig.canvas.height = this.canvas.height;
      GameConfig.canvas.dpr = window.devicePixelRatio || 1;
    }
    this.ctx = this.canvas.getContext('2d');
  }

  _initSystems() {
    SaveSystem.init();
    LevelManager.init();
    SkinSystem.init();
    RewardSystem.init();
    AdManager.init();
    InputManager.init(this.canvas);
    SceneManager.init(this.ctx);
  }

  _initFirstScene() {
    SceneManager.replace(new MainScene());
  }

  _startLoop() {
    this.running = true;
    this.lastFrameTime = Date.now();

    const loop = () => {
      if (!this.running) return;
      const now = Date.now();
      const dt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      this._update(dt);
      this._render();

      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(loop);
      }
    };

    loop();
  }

  _update(dt) {
    SceneManager.update(dt);
  }

  _render() {
    this.ctx.fillStyle = '#F1F3F5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    SceneManager.render(this.ctx);
  }
}

module.exports = { GameApp };
