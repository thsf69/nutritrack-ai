import { useStore } from '../store/useStore';

// Test Ad Unit IDs provided by Google for development/testing
const TEST_AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  }
};

const getIsMobile = () => {
  return typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window as any).Capacitor);
};

export async function initializeAdMob() {
  if (!getIsMobile()) {
    console.log('AdMob: Initialized Mock Web Ad System.');
    return;
  }

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.initialize();
    console.log('AdMob: Native AdMob SDK Initialized.');
  } catch (err) {
    console.error('AdMob: Failed to initialize native SDK:', err);
  }
}

export async function showBannerAd() {
  if (!getIsMobile()) {
    console.log('AdMob: Showing Mock Web Banner Ad.');
    return;
  }

  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
    // Detect OS for correct test ID
    const isAndroid = /android/i.test(navigator.userAgent);
    const adId = isAndroid ? TEST_AD_UNITS.android.banner : TEST_AD_UNITS.ios.banner;

    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
    });
  } catch (err) {
    console.error('AdMob: Failed to show native banner:', err);
  }
}

export async function hideBannerAd() {
  if (!getIsMobile()) {
    console.log('AdMob: Hiding Mock Web Banner Ad.');
    return;
  }

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.removeBanner();
  } catch (err) {
    console.error('AdMob: Failed to remove native banner:', err);
  }
}

export async function showInterstitialAd(onDismiss: () => void) {
  if (!getIsMobile()) {
    console.log('AdMob: Triggering Mock Web Interstitial Ad.');
    useStore.getState().triggerAd('interstitial', onDismiss);
    return;
  }

  try {
    const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
    const isAndroid = /android/i.test(navigator.userAgent);
    const adId = isAndroid ? TEST_AD_UNITS.android.interstitial : TEST_AD_UNITS.ios.interstitial;

    await AdMob.prepareInterstitial({
      adId,
      isTesting: true
    });

    // Listen for ad dismiss
    const dismissListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('AdMob: Native Interstitial dismissed.');
      dismissListener.remove();
      onDismiss();
    });

    await AdMob.showInterstitial();
  } catch (err) {
    console.error('AdMob: Failed to show native interstitial. Proceeding with callback.', err);
    onDismiss();
  }
}

export async function showRewardedAd(onEarnReward: (amount: number) => void, onDismiss: () => void) {
  if (!getIsMobile()) {
    console.log('AdMob: Triggering Mock Web Rewarded Ad.');
    useStore.getState().triggerAd('rewarded', onDismiss, () => onEarnReward(3));
    return;
  }

  try {
    const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
    const isAndroid = /android/i.test(navigator.userAgent);
    const adId = isAndroid ? TEST_AD_UNITS.android.rewarded : TEST_AD_UNITS.ios.rewarded;

    await AdMob.prepareRewardVideoAd({
      adId,
      isTesting: true
    });

    let rewardEarned = false;

    // Listen for reward earned event
    const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (info) => {
      console.log('AdMob: Native Reward earned:', info);
      rewardEarned = true;
    });

    // Listen for ad dismiss
    const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      console.log('AdMob: Native Rewarded Ad dismissed.');
      rewardListener.remove();
      dismissListener.remove();
      
      if (rewardEarned) {
        onEarnReward(3);
      }
      onDismiss();
    });

    await AdMob.showRewardVideoAd();
  } catch (err) {
    console.error('AdMob: Failed to show native rewarded ad. Proceeding with mock reward.', err);
    // Fallback: grant reward and dismiss in case SDK fails
    onEarnReward(3);
    onDismiss();
  }
}
