// Utility to detect in-app browsers and provide alternative login methods

export const isInAppBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Common in-app browser patterns
  const inAppPatterns = [
    'instagram',
    'threads',
    'facebook',
    'fbav', // Facebook in-app browser
    'fban', // Facebook in-app browser
    'fbios', // Facebook in-app browser
    'line', // LINE app
    'wv', // WebView
    'snapchat',
    'tiktok',
    'twitter',
    'whatsapp',
    'telegram',
    'linkedin',
    'pinterest',
    'reddit',
    'discord',
    'slack',
    'wechat',
    'qq',
    'kakao',
    'naver'
  ];
  
  return inAppPatterns.some(pattern => userAgent.includes(pattern));
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isInApp = isInAppBrowser();
  const isMobile = isMobileDevice();
  
  return {
    isInAppBrowser: isInApp,
    isMobile,
    userAgent,
    canUseOAuth: !isInApp
  };
};

export const openInExternalBrowser = (url) => {
  // Try to open in external browser
  if (isInAppBrowser()) {
    // For in-app browsers, try to open in external browser
    window.open(url, '_system');
    return true;
  }
  return false;
}; 