/**
 * 场景管理器 - 单例
 */

class _SceneManager {
  constructor() {
    this.ctx = null;
    this.stack = [];
  }

  init(ctx) {
    this.ctx = ctx;
  }

  replace(scene) {
    while (this.stack.length > 0) {
      const old = this.stack.pop();
      if (old.onExit) old.onExit();
    }
    this.stack.push(scene);
    if (scene.onEnter) scene.onEnter();
  }

  push(scene) {
    const top = this.top();
    if (top && top.onPause) top.onPause();
    this.stack.push(scene);
    if (scene.onEnter) scene.onEnter();
  }

  pop() {
    if (this.stack.length <= 1) return;
    const old = this.stack.pop();
    if (old.onExit) old.onExit();
    const top = this.top();
    if (top && top.onResume) top.onResume();
  }

  top() {
    return this.stack[this.stack.length - 1] || null;
  }

  update(dt) {
    const top = this.top();
    if (top && top.update) top.update(dt);
  }

  render(ctx) {
    for (const scene of this.stack) {
      if (scene.render) scene.render(ctx);
    }
  }

  handleTouch(type, x, y) {
    const top = this.top();
    if (!top) return;
    if (type === 'start' && top.onTouchStart) top.onTouchStart(x, y);
    else if (type === 'move' && top.onTouchMove) top.onTouchMove(x, y);
    else if (type === 'end' && top.onTouchEnd) top.onTouchEnd(x, y);
  }
}

const SceneManager = new _SceneManager();
module.exports = { SceneManager };
