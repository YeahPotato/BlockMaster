/**
 * 方块大师 - 主入口
 */
const DataBus = require('./databus.js');
const SceneManager = require('./scenes/manager.js');

// 屏幕尺寸（设计稿 750x1334）
const DESIGN_W = 750;
const DESIGN_H = 1334;

let canvas;
let ctx;
let databus;
let sceneManager;
let lastTime = 0;
// 缩放比例
let scaleX = 1;
let scaleY = 1;

function initCanvas() {
  canvas = wx.createCanvas();
  ctx = canvas.getContext('2d');
  
  // 获取系统信息
  const sysInfo = wx.getSystemInfoSync();
  const screenWidth = sysInfo.screenWidth;
  const screenHeight = sysInfo.screenHeight;
  const dpr = sysInfo.pixelRatio || 1;
  
  console.log(`屏幕尺寸: ${screenWidth}x${screenHeight}, DPR: ${dpr}`);
  
  // 计算缩放比例（以短边为基准，保证比例不变形）
  scaleX = screenWidth / DESIGN_W;
  scaleY = screenHeight / DESIGN_H;
  const scale = Math.min(scaleX, scaleY);
  
  // 设置 canvas 实际像素尺寸为屏幕尺寸（保证填满屏幕）
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  
  console.log(`Canvas 尺寸: ${canvas.width}x${canvas.height}, 缩放: ${scale.toFixed(3)}`);
}

function initGame() {
  databus = new DataBus();
  sceneManager = new SceneManager(ctx, databus);
  
  // 设置缩放比例
  sceneManager.setScale(scaleX, scaleY);
  
  // 设置 sceneManager 引用到当前全局，方便场景间通信
  window._bmSceneMgr = sceneManager;
  
  // 进入主菜单
  sceneManager.go('main');
}

function onTouchStart(e) {
  const touch = e.touches[0];
  if (touch && sceneManager) {
    // 触摸坐标已经是屏幕坐标，直接使用
    const x = touch.clientX;
    const y = touch.clientY;
    sceneManager.handleTouchStart(x, y);
  }
}

function onTouchMove(e) {
  const touch = e.touches[0];
  if (touch && sceneManager) {
    const x = touch.clientX;
    const y = touch.clientY;
    sceneManager.handleTouchMove(x, y);
  }
}

function onTouchEnd(e) {
  const touch = e.changedTouches[0];
  if (touch && sceneManager) {
    const x = touch.clientX;
    const y = touch.clientY;
    sceneManager.handleTouchEnd(x, y);
  }
}

function loop(currentTime) {
  const dt = (currentTime - lastTime) / 1000; // 转换为秒
  lastTime = currentTime;
  
  // 更新
  if (sceneManager) {
    sceneManager.update(dt);
  }
  
  // 渲染
  if (sceneManager) {
    sceneManager.render();
  }
  
  requestAnimationFrame(loop);
}

// 全局场景切换回调（场景间通信用）
function setSceneManagerToScenes() {
  // 这是一个简化方案：实际应通过依赖注入
  // 场景文件中可通过 this._sceneManager = window._bmSceneMgr 获取
}

function start() {
  console.log('方块大师启动...');
  
  initCanvas();
  initGame();
  setSceneManagerToScenes();
  
  // 绑定触摸事件
  wx.onTouchStart(onTouchStart);
  wx.onTouchMove(onTouchMove);
  wx.onTouchEnd(onTouchEnd);
  
  // 启动主循环
  lastTime = Date.now();
  requestAnimationFrame(loop);
}

module.exports = { start };
