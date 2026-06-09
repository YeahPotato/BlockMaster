/**
 * 方块大师 - 动画管理
 */
class Animation {
  constructor(duration, onComplete = null) {
    this.duration = duration;
    this.elapsed = 0;
    this.running = false;
    this.onComplete = onComplete;
    this.easing = this.easeOutCubic;
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  start() {
    this.elapsed = 0;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  update(dt) {
    if (!this.running) return false;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.running = false;
      if (this.onComplete) this.onComplete();
    }
    return true;
  }

  progress() {
    return Math.min(1, this.elapsed / this.duration);
  }

  value(start, end) {
    const t = this.easing(this.progress());
    return start + (end - start) * t;
  }
}

class Tween {
  constructor(target, props, duration, easing = 'easeOutCubic', onComplete = null) {
    this.target = target;
    this.props = props;
    this.duration = duration;
    this.easing = this._easings[easing] || this._easings.easeOutCubic;
    this.onComplete = onComplete;
    this.startProps = {};
    this.elapsed = 0;
    this.running = false;
    this._initStartProps();
  }

  _easings = {
    linear: (t) => t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  };

  _initStartProps() {
    for (const key in this.props) {
      this.startProps[key] = this.target[key];
    }
  }

  start() {
    this._initStartProps();
    this.elapsed = 0;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  update(dt) {
    if (!this.running) return false;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.running = false;
      // 设置最终值
      for (const key in this.props) {
        this.target[key] = this.props[key];
      }
      if (this.onComplete) this.onComplete();
    } else {
      const t = this.easing(this.elapsed / this.duration);
      for (const key in this.props) {
        const start = this.startProps[key];
        const end = this.props[key];
        this.target[key] = start + (end - start) * t;
      }
    }
    return true;
  }
}

module.exports = { Animation, Tween };
