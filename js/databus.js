/**
 * 方块大师 - 数据管理
 * 负责存档、资源、皮肤、关卡进度等
 */
const STORAGE_KEY = 'bm_save_v1';

// 默认存档数据
const DEFAULT_SAVE = {
  version: 1,
  // 资源
  coins: 1000,
  diamonds: 10,
  hintTickets: 3,
  // 进度
  levelStars: {}, // { '1-1': 3, '1-2': 2, ... }
  currentLevel: '1-1',
  // 皮肤
  ownedSkins: ['classic'],
  currentSkin: 'classic',
  // 签到
  dailyCheckIn: {
    lastDate: '',
    streak: 0,
    total: 0,
  },
  // 设置
  settings: {
    bgm: true,
    sfx: true,
    vibration: false,
    language: 'zh_CN',
  },
};

class DataBus {
  constructor() {
    this.save = this.load();
    this.listeners = [];
    this.cloudInited = false;
    
    // 初始化云开发
    this._initCloud();
  }

  async _initCloud() {
    try {
      if (wx.cloud) {
        wx.cloud.init({
          env: 'your-env-id', // 替换为实际环境ID
          traceUser: true,
        });
        this.cloudInited = true;
        
        // 同步云端数据
        await this._syncFromCloud();
      }
    } catch (e) {
      console.error('Cloud init error:', e);
      this.cloudInited = false;
    }
  }

  async _syncFromCloud() {
    try {
      const db = wx.cloud.database();
      const openid = wx.getStorageSync('openid');
      
      if (openid) {
        const res = await db.collection('users').where({ openid }).get();
        if (res.data.length > 0) {
          const cloudData = res.data[0];
          // 同步资源（取最大值）
          if (cloudData.coins > this.save.coins) {
            this.save.coins = cloudData.coins;
          }
          if (cloudData.diamonds > this.save.diamonds) {
            this.save.diamonds = cloudData.diamonds;
          }
          this.saveData();
        }
      }
    } catch (e) {
      console.error('Sync from cloud error:', e);
    }
  }

  load() {
    try {
      const data = wx.getStorageSync(STORAGE_KEY);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
      return this.mergeDefaults(JSON.parse(data));
    } catch (e) {
      console.error('Load save failed:', e);
      return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    }
  }

  saveData() {
    try {
      wx.setStorageSync(STORAGE_KEY, JSON.stringify(this.save));
      this.notify();
    } catch (e) {
      console.error('Save failed:', e);
    }
  }

  mergeDefaults(data) {
    const result = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        result[key] = { ...result[key], ...data[key] };
      } else {
        result[key] = data[key];
      }
    }
    return result;
  }

  // 资源操作
  addCoins(amount) {
    this.save.coins = Math.max(0, this.save.coins + amount);
    this.saveData();
  }

  spendCoins(amount) {
    if (this.save.coins < amount) return false;
    this.save.coins -= amount;
    this.saveData();
    return true;
  }

  addDiamonds(amount) {
    this.save.diamonds = Math.max(0, this.save.diamonds + amount);
    this.saveData();
  }

  spendDiamonds(amount) {
    if (this.save.diamonds < amount) return false;
    this.save.diamonds -= amount;
    this.saveData();
    return true;
  }

  addHintTicket() {
    this.save.hintTickets += 1;
    this.saveData();
  }

  useHintTicket() {
    if (this.save.hintTickets <= 0) return false;
    this.save.hintTickets -= 1;
    this.saveData();
    return true;
  }

  // 关卡进度
  getLevelKey(chapter, level) {
    return `${chapter}-${level}`;
  }

  getStars(chapter, level) {
    return this.save.levelStars[this.getLevelKey(chapter, level)] || 0;
  }

  setStars(chapter, level, stars) {
    const key = this.getLevelKey(chapter, level);
    const current = this.save.levelStars[key] || 0;
    if (stars > current) {
      this.save.levelStars[key] = stars;
      this.save.currentLevel = this.getLevelKey(chapter, level);
      this.saveData();
    }
  }

  getNextLevel(chapter, level) {
    // 简单逻辑：当前关 +1，如果超过该章最大关则进入下一章
    const maxLevel = 20; // 每章最大关数
    if (level >= maxLevel) {
      return { chapter: chapter + 1, level: 1 };
    }
    return { chapter, level: level + 1 };
  }

  getTotalStars() {
    let total = 0;
    for (const key in this.save.levelStars) {
      total += this.save.levelStars[key];
    }
    return total;
  }

  // 皮肤
  isSkinOwned(id) {
    return this.save.ownedSkins.includes(id);
  }

  buySkin(id, cost) {
    if (cost.type === 'coins') {
      return this.spendCoins(cost.value) && this.ownSkin(id);
    } else if (cost.type === 'diamonds') {
      return this.spendDiamonds(cost.value) && this.ownSkin(id);
    } else if (cost.type === 'stars') {
      return this.getTotalStars() >= cost.value && this.ownSkin(id);
    }
    return false;
  }

  ownSkin(id) {
    if (!this.isSkinOwned(id)) {
      this.save.ownedSkins.push(id);
      this.saveData();
      return true;
    }
    return false;
  }

  setCurrentSkin(id) {
    if (this.isSkinOwned(id)) {
      this.save.currentSkin = id;
      this.saveData();
      return true;
    }
    return false;
  }

  // 签到
  checkIn() {
    const today = this.getTodayStr();
    if (this.save.dailyCheckIn.lastDate === today) {
      return false; // 今天已签到
    }
    // 计算连续天数
    const yesterday = this.getYesterdayStr();
    if (this.save.dailyCheckIn.lastDate === yesterday) {
      this.save.dailyCheckIn.streak += 1;
    } else if (this.save.dailyCheckIn.lastDate !== today) {
      this.save.dailyCheckIn.streak = 1;
    }
    this.save.dailyCheckIn.lastDate = today;
    this.save.dailyCheckIn.total += 1;
    this.saveData();
    return true;
  }

  getCheckInReward() {
    const day = this.save.dailyCheckIn.streak;
    const rewards = [
      { coins: 50 },
      { coins: 80 },
      { coins: 100 },
      { coins: 150 },
      { hintTicket: 1 },
      { coins: 200 },
      { diamonds: 10 },
    ];
    return rewards[(day - 1) % rewards.length];
  }

  getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // 设置
  getSettings() {
    return this.save.settings;
  }

  setSetting(key, value) {
    this.save.settings[key] = value;
    this.saveData();
  }

  // 监听器
  on(listener) {
    this.listeners.push(listener);
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this.save);
    }
  }
}

module.exports = DataBus;
