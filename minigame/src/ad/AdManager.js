/**
 * AdManager - 广告管理
 */

const { GameConfig } = require('../GameConfig.js');

class _AdManager {
  constructor() {
    this.rewardVideoMap = new Map();
    this.bannerAd = null;
    this.interstitialAd = null;
  }

  init() {
    if (typeof wx === 'undefined') return;

    if (GameConfig.ad.banner) {
      try {
        this.bannerAd = wx.createBannerAd({
          adUnitId: GameConfig.ad.banner,
          style: { left: 0, top: 0, width: 300 },
        });
      } catch (e) {
        console.warn('Banner init failed:', e);
      }
    }

    if (GameConfig.ad.interstitial) {
      try {
        this.interstitialAd = wx.createInterstitialAd({
          adUnitId: GameConfig.ad.interstitial,
        });
      } catch (e) {
        console.warn('Interstitial init failed:', e);
      }
    }
  }

  async showRewardVideo(sceneKey) {
    const adId = GameConfig.ad.rewardVideo[sceneKey];

    if (typeof wx === 'undefined' || !adId) {
      console.log(`[AdManager mock] showRewardVideo: ${sceneKey}`);
      return new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }

    return new Promise((resolve) => {
      let videoAd = this.rewardVideoMap.get(sceneKey);
      if (!videoAd) {
        videoAd = wx.createRewardedVideoAd({ adUnitId: adId });
        this.rewardVideoMap.set(sceneKey, videoAd);
      }

      const onClose = (res) => {
        videoAd.offClose(onClose);
        videoAd.offError(onError);
        resolve(res && res.isEnded);
      };
      const onError = (err) => {
        console.error('RewardVideo error:', err);
        videoAd.offClose(onClose);
        videoAd.offError(onError);
        resolve(false);
      };

      videoAd.onClose(onClose);
      videoAd.onError(onError);

      videoAd.show().catch(() => {
        videoAd.load().then(() => videoAd.show()).catch((e) => {
          console.error('Show video failed:', e);
          resolve(false);
        });
      });
    });
  }

  showBanner() {
    if (this.bannerAd) this.bannerAd.show().catch(() => {});
  }

  hideBanner() {
    if (this.bannerAd) this.bannerAd.hide();
  }

  showInterstitial() {
    if (this.interstitialAd) {
      this.interstitialAd.show().catch((err) => {
        console.warn('Interstitial show failed:', err);
      });
    } else if (typeof wx === 'undefined') {
      console.log('[AdManager mock] showInterstitial');
    }
  }
}

const AdManager = new _AdManager();
module.exports = { AdManager };
