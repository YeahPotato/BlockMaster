/**
 * 方块大师 - 对象池
 */
class Pool {
  constructor(Constructor, init) {
    this._Constructor = Constructor;
    this._init = init;
    this._pool = [];
  }

  get() {
    return this._pool.pop() || new this._Constructor(this._init);
  }

  put(obj) {
    this._pool.push(obj);
  }

  clear() {
    this._pool.length = 0;
  }
}

module.exports = Pool;
