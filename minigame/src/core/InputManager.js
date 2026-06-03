/**
 * 输入管理器
 */

const { GameConfig } = require('../GameConfig.js');
const { SceneManager } = require('./SceneManager.js');

class _InputManager {
  constructor() {
    this.canvas = null;
  }

  init(canvas) {
    this.canvas = canvas;

    if (typeof wx !== 'undefined') {
      wx.onTouchStart((e) => this._handle('start', e));
      wx.onTouchMove((e) => this._handle('move', e));
      wx.onTouchEnd((e) => this._handle('end', e));
      wx.onTouchCancel((e) => this._handle('end', e));
    } else {
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const cx = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const cy = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
        return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
      };

      canvas.addEventListener('mousedown', (e) => {
        const p = getPos(e);
        SceneManager.handleTouch('start', p.x, p.y);
        this._mouseDown = true;
      });
      canvas.addEventListener('mousemove', (e) => {
        if (!this._mouseDown) return;
        const p = getPos(e);
        SceneManager.handleTouch('move', p.x, p.y);
      });
      canvas.addEventListener('mouseup', (e) => {
        const p = getPos(e);
        SceneManager.handleTouch('end', p.x, p.y);
        this._mouseDown = false;
      });

      canvas.addEventListener('touchstart', (e) => {
        const p = getPos(e);
        SceneManager.handleTouch('start', p.x, p.y);
        e.preventDefault();
      });
      canvas.addEventListener('touchmove', (e) => {
        const p = getPos(e);
        SceneManager.handleTouch('move', p.x, p.y);
        e.preventDefault();
      });
      canvas.addEventListener('touchend', (e) => {
        const t = e.changedTouches && e.changedTouches[0];
        if (t) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          SceneManager.handleTouch(
            'end',
            (t.clientX - rect.left) * scaleX,
            (t.clientY - rect.top) * scaleY
          );
        }
      });
    }
  }

  _handle(type, e) {
    const t = e.touches && e.touches[0];
    const ct = e.changedTouches && e.changedTouches[0];
    const target = type === 'end' ? ct : t;
    if (!target) return;
    const dpr = GameConfig.canvas.dpr;
    SceneManager.handleTouch(type, target.clientX * dpr, target.clientY * dpr);
  }
}

const InputManager = new _InputManager();
module.exports = { InputManager };
