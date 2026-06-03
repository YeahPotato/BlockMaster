/**
 * SkinSystem - 皮肤系统
 */

const { SaveSystem } = require('./SaveSystem.js');

const SKINS_REGISTRY = {
  classic: {
    id: 'classic', name: '经典糖果', type: 'palette',
    colors: ['#FF6B6B', '#FFA94D', '#FFD43B', '#51CF66', '#339AF0', '#845EF7', '#F783AC'],
    unlockType: 'default',
  },
  morandi: {
    id: 'morandi', name: '莫兰迪色', type: 'palette',
    colors: ['#D4A5A5', '#C7B198', '#A8B5A0', '#9DB4C0', '#A29BBE', '#C8A2C8', '#E0BFB8'],
    unlockType: 'stars', unlockValue: 30,
  },
  pixel: {
    id: 'pixel', name: '像素复古', type: 'palette',
    colors: ['#E63946', '#F77F00', '#FCBF49', '#06A77D', '#1D7AB8', '#5E2BFF', '#EF476F'],
    unlockType: 'stars', unlockValue: 100,
  },
  neon: {
    id: 'neon', name: '霓虹光效', type: 'palette',
    colors: ['#FF006E', '#FB5607', '#FFBE0B', '#3A86FF', '#8338EC', '#06FFA5', '#FF4081'],
    unlockType: 'ad', unlockValue: 30,
  },
  watercolor: {
    id: 'watercolor', name: '水彩渐变', type: 'palette',
    colors: ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF'],
    unlockType: 'diamonds', unlockValue: 100,
  },
  chinese: {
    id: 'chinese', name: '中国风', type: 'palette',
    colors: ['#A8201A', '#EC9F05', '#143642', '#0F8B8D', '#9C2A24', '#E2B616', '#723D46'],
    unlockType: 'event', unlockValue: 'spring_festival_2026',
  },
  nordic: {
    id: 'nordic', name: '北欧极简', type: 'palette',
    colors: ['#D8E2DC', '#FFE5D9', '#FFCAD4', '#F4ACB7', '#9D8189', '#B5838D', '#6D6875'],
    unlockType: 'signin', unlockValue: 30,
  },
};

const STICKER_PACKS = {
  none: { id: 'none', name: '无贴纸', stickers: [] },
  fruits: {
    id: 'fruits', name: '水果家族',
    stickers: ['🍎', '🍊', '🍋', '🍉', '🍇', '🍑', '🍓'],
    unlockType: 'default',
  },
  pets: {
    id: 'pets', name: '萌宠贴纸',
    stickers: ['🐱', '🐶', '🐰', '🐼', '🐯', '🦊', '🐻'],
    unlockType: 'diamonds', unlockValue: 200,
  },
  pixelHero: {
    id: 'pixelHero', name: '像素勇者', stickers: [],
    unlockType: 'stars', unlockValue: 500,
  },
  anime: {
    id: 'anime', name: '二次元少女', stickers: [],
    unlockType: 'event', unlockValue: 'limited_2026_summer',
  },
};

class _SkinSystem {
  init() {
    if (!SaveSystem.skinData.ownedSkins.includes('classic')) {
      SaveSystem.skinData.ownedSkins.push('classic');
    }
    if (!SaveSystem.skinData.ownedStickers.includes('none')) {
      SaveSystem.skinData.ownedStickers.push('none');
    }
  }

  getCurrentColors() {
    const skinId = SaveSystem.skinData.currentSkin || 'classic';
    const skin = SKINS_REGISTRY[skinId] || SKINS_REGISTRY.classic;
    return skin.colors;
  }

  getCurrentStickers() {
    const id = SaveSystem.skinData.currentStickers || 'none';
    return STICKER_PACKS[id] || STICKER_PACKS.none;
  }

  setCurrentSkin(skinId) {
    if (!this.isOwned(skinId)) return false;
    SaveSystem.skinData.currentSkin = skinId;
    SaveSystem.saveSkins();
    return true;
  }

  setCurrentStickers(packId) {
    if (!SaveSystem.skinData.ownedStickers.includes(packId)) return false;
    SaveSystem.skinData.currentStickers = packId;
    SaveSystem.saveSkins();
    return true;
  }

  isOwned(skinId) {
    return SaveSystem.skinData.ownedSkins.includes(skinId);
  }

  unlock(skinId) {
    if (this.isOwned(skinId)) return;
    SaveSystem.skinData.ownedSkins.push(skinId);
    SaveSystem.saveSkins();
  }

  getAllSkins() {
    return Object.values(SKINS_REGISTRY);
  }

  getAllStickerPacks() {
    return Object.values(STICKER_PACKS);
  }

  canUnlock(skinId) {
    const skin = SKINS_REGISTRY[skinId];
    if (!skin) return false;
    if (this.isOwned(skinId)) return true;

    switch (skin.unlockType) {
      case 'default': return true;
      case 'stars': return SaveSystem.progress.totalStars >= skin.unlockValue;
      case 'diamonds': return SaveSystem.rewards.diamonds >= skin.unlockValue;
      case 'signin': return SaveSystem.progress.streakDays >= skin.unlockValue;
      case 'ad': return false;
      case 'event': return false;
      default: return false;
    }
  }
}

const SkinSystem = new _SkinSystem();
module.exports = { SkinSystem };
