/**
 * RewardSystem - 奖励系统
 */

const { SaveSystem } = require('./SaveSystem.js');

class _RewardSystem {
  init() {
    this._refillEnergy();
  }

  getCoins() { return SaveSystem.rewards.coins; }
  addCoins(n) { SaveSystem.rewards.coins += n; SaveSystem.saveRewards(); }
  spendCoins(n) {
    if (SaveSystem.rewards.coins < n) return false;
    SaveSystem.rewards.coins -= n;
    SaveSystem.saveRewards();
    return true;
  }

  getDiamonds() { return SaveSystem.rewards.diamonds; }
  addDiamonds(n) { SaveSystem.rewards.diamonds += n; SaveSystem.saveRewards(); }
  spendDiamonds(n) {
    if (SaveSystem.rewards.diamonds < n) return false;
    SaveSystem.rewards.diamonds -= n;
    SaveSystem.saveRewards();
    return true;
  }

  getStickerPieces() { return SaveSystem.skinData.stickerPieces; }
  addStickerPieces(n) { SaveSystem.skinData.stickerPieces += n; SaveSystem.saveSkins(); }

  getEnergy() {
    this._refillEnergy();
    return SaveSystem.rewards.energy;
  }

  _refillEnergy() {
    const MAX = 5;
    const REFILL_MS = 15 * 60 * 1000;
    const now = Date.now();
    const last = SaveSystem.rewards.lastEnergyTime || now;
    const diff = now - last;
    if (SaveSystem.rewards.energy < MAX && diff > 0) {
      const add = Math.floor(diff / REFILL_MS);
      if (add > 0) {
        SaveSystem.rewards.energy = Math.min(MAX, SaveSystem.rewards.energy + add);
        SaveSystem.rewards.lastEnergyTime = last + add * REFILL_MS;
        SaveSystem.saveRewards();
      }
    }
  }

  consumeEnergy(n = 1) {
    this._refillEnergy();
    if (SaveSystem.rewards.energy < n) return false;
    if (SaveSystem.rewards.energy === 5) {
      SaveSystem.rewards.lastEnergyTime = Date.now();
    }
    SaveSystem.rewards.energy -= n;
    SaveSystem.saveRewards();
    return true;
  }

  applyLevelReward(levelData, stars, timeUsedSec) {
    const rewards = levelData.rewards || {};
    let cfg = null;
    if (stars >= 3) cfg = rewards.star3;
    else if (stars >= 2) cfg = rewards.star2;
    else cfg = rewards.star1;
    if (!cfg) cfg = { coins: 50 };

    if (cfg.coins) this.addCoins(cfg.coins);
    if (cfg.diamonds) this.addDiamonds(cfg.diamonds);
    if (cfg.stickerPiece) this.addStickerPieces(cfg.stickerPiece);

    const progress = SaveSystem.progress;
    const levelId = levelData.levelId;

    const oldStars = progress.stars[levelId] || 0;
    const newStars = Math.max(oldStars, stars);
    if (newStars !== oldStars) {
      progress.totalStars += newStars - oldStars;
      progress.stars[levelId] = newStars;
    }

    const oldBest = progress.bestTime[levelId] || Infinity;
    if (timeUsedSec < oldBest) progress.bestTime[levelId] = timeUsedSec;

    if (stars >= 3 && oldStars < 3) progress.perfectCount++;

    if (levelId >= progress.maxUnlockedLevel) {
      progress.maxUnlockedLevel = levelId + 1;
    }

    SaveSystem.saveProgress();

    return {
      coins: cfg.coins || 0,
      diamonds: cfg.diamonds || 0,
      stickerPiece: cfg.stickerPiece || 0,
      newStars,
      totalStars: progress.totalStars,
    };
  }

  checkDailySignin() {
    const today = new Date().toISOString().slice(0, 10);
    const last = SaveSystem.progress.lastPlayDate;
    if (last !== today) {
      const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
      if (last === yesterday) {
        SaveSystem.progress.streakDays++;
      } else {
        SaveSystem.progress.streakDays = 1;
      }
      SaveSystem.progress.lastPlayDate = today;
      SaveSystem.saveProgress();
      return { isNew: true, streak: SaveSystem.progress.streakDays };
    }
    return { isNew: false, streak: SaveSystem.progress.streakDays };
  }
}

const RewardSystem = new _RewardSystem();
module.exports = { RewardSystem };
