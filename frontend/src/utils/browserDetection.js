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
    'naver',
    // Additional patterns for better detection
    'instagram.*wv', // Instagram WebView
    'threads.*wv', // Threads WebView
    'facebook.*wv', // Facebook WebView
    'fb.*wv', // Facebook WebView variants
    'instagram.*android', // Instagram Android
    'threads.*android', // Threads Android
    'facebook.*android', // Facebook Android
    'instagram.*ios', // Instagram iOS
    'threads.*ios', // Threads iOS
    'facebook.*ios', // Facebook iOS
    // Meta apps specific patterns
    'meta.*threads',
    'meta.*instagram',
    'meta.*facebook',
    // WebView indicators
    'webview',
    'web_view',
    'inapp',
    'in_app',
    'embedded',
    'browser.*app',
    'app.*browser'
  ];
  
  // Check for exact matches first
  const hasExactMatch = inAppPatterns.some(pattern => userAgent.includes(pattern));
  
  // Additional checks for mobile apps
  const isMobileApp = userAgent.includes('mobile') && (
    userAgent.includes('instagram') || 
    userAgent.includes('threads') || 
    userAgent.includes('facebook') ||
    userAgent.includes('fb')
  );
  
  // Check for WebView indicators
  const isWebView = userAgent.includes('wv') || userAgent.includes('webview');
  
  // Check for social media app indicators
  const isSocialApp = userAgent.includes('instagram') || 
                     userAgent.includes('threads') || 
                     userAgent.includes('facebook') ||
                     userAgent.includes('fb') ||
                     userAgent.includes('snapchat') ||
                     userAgent.includes('tiktok');
  
  return hasExactMatch || isMobileApp || (isWebView && isSocialApp);
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isInApp = isInAppBrowser();
  const isMobile = isMobileDevice();
  
  // Debug logging
  console.log('Browser Detection Debug:', {
    userAgent: userAgent,
    isInAppBrowser: isInApp,
    isMobile,
    canUseOAuth: !isInApp
  });
  
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

export const debugBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const userAgentLower = userAgent.toLowerCase();
  
  const debugInfo = {
    fullUserAgent: userAgent,
    userAgentLower: userAgentLower,
    isInAppBrowser: isInAppBrowser(),
    isMobileDevice: isMobileDevice(),
    browserInfo: getBrowserInfo(),
    // Specific checks
    hasWv: userAgentLower.includes('wv'),
    hasWebview: userAgentLower.includes('webview'),
    hasInstagram: userAgentLower.includes('instagram'),
    hasThreads: userAgentLower.includes('threads'),
    hasFacebook: userAgentLower.includes('facebook'),
    hasFb: userAgentLower.includes('fb'),
    hasMobile: userAgentLower.includes('mobile'),
    hasAndroid: userAgentLower.includes('android'),
    hasIos: userAgentLower.includes('ios'),
    // Additional checks
    hasMeta: userAgentLower.includes('meta'),
    hasInapp: userAgentLower.includes('inapp'),
    hasEmbedded: userAgentLower.includes('embedded')
  };
  
  console.log('🔍 Browser Detection Debug Info:', debugInfo);
  return debugInfo;
}; 