/**
 * 全局配置
 */

const GameConfig = {
  // 游戏版本
  version: '1.0.0',

  // 画布信息（运行时填充）
  canvas: {
    width: 0,
    height: 0,
    dpr: 1,
  },

  // 设计分辨率（基准）
  designResolution: {
    width: 750,
    height: 1334,
  },

  // 默认积木块颜色（皮肤系统会覆盖）
  defaultColors: [
    '#FF6B6B', // 红
    '#FFA94D', // 橙
    '#FFD43B', // 黄
    '#51CF66', // 绿
    '#339AF0', // 蓝
    '#845EF7', // 紫
    '#F783AC', // 粉
  ],

  // 网格 UI 配置
  grid: {
    cellSize: 80, // 单格像素大小
    cellGap: 4, // 格子间距
    targetColor: '#FFE9A0', // 目标格子高亮色
    emptyColor: '#E9ECEF', // 空格颜色
    bgColor: '#F8F9FA',
    borderRadius: 8,
  },

  // 积木块 UI 配置
  block: {
    cellSize: 60, // 待选区中块的单格大小
    selectedScale: 1.2,
    placedAlpha: 0.95,
  },

  // 广告位 ID（上线时填入真实 ID）
  ad: {
    rewardVideo: {
      hint: '', // 提示
      revive: '', // 复活
      skip: '', // 跳过
      doubleReward: '', // 双倍奖励
      unlockSkin: '', // 解锁皮肤
    },
    banner: '',
    interstitial: '',
  },

  // 数据存储 key
  storage: {
    progress: 'bm_progress',
    settings: 'bm_settings',
    skins: 'bm_skins',
    rewards: 'bm_rewards',
  },

  // 调试模式
  debug: true,
};

module.exports = { GameConfig };
