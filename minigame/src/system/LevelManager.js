/**
 * LevelManager - 关卡管理
 *
 * 关卡数据加载策略：
 * - 微信小游戏：data/levels/ 直接打包在小游戏包内，使用 require 同步加载
 *   （因为 require 在小游戏里支持读取项目内 JSON 文件）
 * - 浏览器调试：fetch 异步加载
 *
 * 注意：data/levels 已配置为分包（subpackage），但 require 默认能直接读到
 */

class _LevelManager {
  constructor() {
    this.index = null;
    this.chaptersCache = new Map();
    this._inited = false;
  }

  init() {
    this._loadIndex();
  }

  _loadIndex() {
    // 方式 1：直接 require（微信小游戏 + Node 都支持）
    try {
      this.index = require('../../data/levels/index.json');
      this._inited = true;
      return;
    } catch (e) {
      console.warn('require index.json failed, fallback to fetch:', e.message);
    }

    // 方式 2：浏览器 fetch
    if (typeof fetch !== 'undefined') {
      fetch('./data/levels/index.json')
        .then((r) => r.json())
        .then((data) => {
          this.index = data;
          this._inited = true;
        })
        .catch((e) => {
          console.error('Load index failed:', e);
          this.index = { totalLevels: 0, chapters: [] };
        });
    } else {
      this.index = { totalLevels: 0, chapters: [] };
    }
  }

  getChapters() {
    return (this.index && this.index.chapters) || [];
  }

  /** 加载某章节（异步，统一返回 Promise） */
  loadChapter(chapterId) {
    if (this.chaptersCache.has(chapterId)) {
      return Promise.resolve(this.chaptersCache.get(chapterId));
    }

    const meta = this.getChapters().find((c) => c.id === chapterId);
    if (!meta) return Promise.resolve(null);

    // 方式 1：require 同步加载
    try {
      const data = require(`../../data/levels/${meta.file}`);
      this.chaptersCache.set(chapterId, data);
      return Promise.resolve(data);
    } catch (e) {
      console.warn(`require ${meta.file} failed, fallback to fetch`);
    }

    // 方式 2：fetch
    return new Promise((resolve, reject) => {
      const path = `./data/levels/${meta.file}`;
      if (typeof fetch !== 'undefined') {
        fetch(path)
          .then((r) => r.json())
          .then((data) => {
            this.chaptersCache.set(chapterId, data);
            resolve(data);
          })
          .catch(reject);
      } else {
        reject(new Error('No way to load chapter'));
      }
    });
  }

  async getLevel(chapterId, levelInChapter) {
    const chapter = await this.loadChapter(chapterId);
    if (!chapter || !chapter.levels) return null;
    return chapter.levels.find((l) => l.levelInChapter === levelInChapter) || chapter.levels[0];
  }

  async getLevelById(levelId) {
    for (const ch of this.getChapters()) {
      if (levelId >= ch.levelStart && levelId <= ch.levelEnd) {
        const chapter = await this.loadChapter(ch.id);
        return chapter.levels.find((l) => l.levelId === levelId);
      }
    }
    return null;
  }
}

const LevelManager = new _LevelManager();
module.exports = { LevelManager };
