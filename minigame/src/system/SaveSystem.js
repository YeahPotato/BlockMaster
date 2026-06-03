/**
 * SaveSystem - 存档系统
 */

const { GameConfig } = require('../GameConfig.js');

class _SaveSystem {
  constructor() {
    this.progress = null;
    this.skinData = null;
    this.rewards = null;
  }

  init() {
    this.progress = this._load(GameConfig.storage.progress, {
      currentChapter: 1,
      currentLevel: 1,
      maxUnlockedLevel: 1,
      stars: {},
      bestTime: {},
      totalStars: 0,
      perfectCount: 0,
      lastPlayDate: '',
      streakDays: 0,
    });

    this.skinData = this._load(GameConfig.storage.skins, {
      currentSkin: 'classic',
      ownedSkins: ['classic'],
      currentStickers: 'none',
      ownedStickers: ['none'],
      stickerPieces: 0,
    });

    this.rewards = this._load(GameConfig.storage.rewards, {
      coins: 100,
      diamonds: 0,
      energy: 5,
      lastEnergyTime: Date.now(),
    });
  }

  _load(key, defaultValue) {
    try {
      let raw = null;
      if (typeof wx !== 'undefined') {
        raw = wx.getStorageSync(key);
      } else if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(key);
      }
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Object.assign({}, defaultValue, parsed);
      }
    } catch (e) {
      console.error('SaveSystem load error:', e);
    }
    return Object.assign({}, defaultValue);
  }

  _save(key, data) {
    try {
      if (typeof wx !== 'undefined') {
        wx.setStorageSync(key, JSON.stringify(data));
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error('SaveSystem save error:', e);
    }
  }

  saveAll() {
    this._save(GameConfig.storage.progress, this.progress);
    this._save(GameConfig.storage.skins, this.skinData);
    this._save(GameConfig.storage.rewards, this.rewards);
  }

  saveProgress() {
    this._save(GameConfig.storage.progress, this.progress);
  }

  saveSkins() {
    this._save(GameConfig.storage.skins, this.skinData);
  }

  saveRewards() {
    this._save(GameConfig.storage.rewards, this.rewards);
  }
}

const SaveSystem = new _SaveSystem();
module.exports = { SaveSystem };
