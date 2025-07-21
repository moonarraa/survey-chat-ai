// Enhanced browser detection with system browser support
export const isInAppBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // SUPER AGGRESSIVE detection patterns
  const inAppPatterns = [
    'instagram', 'threads', 'facebook', 'fb', 'snapchat', 'tiktok', 'twitter', 'whatsapp', 'telegram',
    'wv', 'webview', 'web_view', 'inapp', 'in_app', 'embedded', 'meta', 'line', 'kakao', 'wechat',
    'linkedin', 'pinterest', 'reddit', 'discord', 'slack', 'zoom', 'teams', 'skype', 'viber',
    'ucbrowser', 'opera mini', 'samsung internet', 'miui browser', 'huawei browser'
  ];
  
  const hasExactMatch = inAppPatterns.some(pattern => userAgent.includes(pattern));
  const isMobileApp = userAgent.includes('mobile') && (
    userAgent.includes('instagram') || 
    userAgent.includes('threads') || 
    userAgent.includes('facebook') ||
    userAgent.includes('fb')
  );
  const isWebView = userAgent.includes('wv') || userAgent.includes('webview');
  const isSocialApp = userAgent.includes('instagram') || 
                     userAgent.includes('threads') || 
                     userAgent.includes('facebook') ||
                     userAgent.includes('fb') ||
                     userAgent.includes('snapchat') ||
                     userAgent.includes('tiktok');
  
  return hasExactMatch || isMobileApp || (isWebView && isSocialApp);
};

export const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const userAgentLower = userAgent.toLowerCase();
  
  return {
    isInAppBrowser: isInAppBrowser(),
    isMobileDevice: isMobileDevice(),
    userAgent: userAgent,
    userAgentLower: userAgentLower,
    // Specific platform detection
    isAndroid: userAgentLower.includes('android'),
    isIOS: userAgentLower.includes('iphone') || userAgentLower.includes('ipad'),
    isInstagram: userAgentLower.includes('instagram'),
    isThreads: userAgentLower.includes('threads'),
    isFacebook: userAgentLower.includes('facebook') || userAgentLower.includes('fb'),
    isWebView: userAgentLower.includes('wv') || userAgentLower.includes('webview'),
  };
};

// System browser detection and redirection (Google's official approach)
export const shouldUseSystemBrowser = () => {
  const browserInfo = getBrowserInfo();
  
  // Use system browser for mobile apps and WebViews
  return browserInfo.isInAppBrowser || 
         browserInfo.isWebView || 
         (browserInfo.isMobileDevice && (
           browserInfo.isInstagram || 
           browserInfo.isThreads || 
           browserInfo.isFacebook
         ));
};

export const openInSystemBrowser = (url) => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Android: Use Chrome Custom Tabs or Intent
  if (userAgent.includes('android')) {
    // Try to open in Chrome Custom Tabs first
    if (window.open) {
      const newWindow = window.open(url, '_system');
      if (newWindow) {
        return true;
      }
    }
    
    // Fallback: Use intent URL
    const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
    return true;
  }
  
  // iOS: Use SFSafariViewController or Universal Links
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    // Try to open in Safari
    if (window.open) {
      const newWindow = window.open(url, '_system');
      if (newWindow) {
        return true;
      }
    }
    
    // Fallback: Direct navigation
    window.location.href = url;
    return true;
  }
  
  // Desktop: Normal navigation
  window.location.href = url;
  return true;
};

export const openInExternalBrowser = (url) => {
  // Show instructions to user
  const message = `Please open this link in your default browser:\n\n${url}`;
  alert(message);
  
  // Also try to open it
  if (window.open) {
    window.open(url, '_blank');
  }
};

export const debugBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const userAgentLower = userAgent.toLowerCase();
  const browserInfo = getBrowserInfo();
  
  const debugInfo = {
    fullUserAgent: userAgent,
    userAgentLower: userAgentLower,
    browserInfo: browserInfo,
    shouldUseSystemBrowser: shouldUseSystemBrowser(),
    // Specific checks
    hasWv: userAgentLower.includes('wv'),
    hasWebview: userAgentLower.includes('webview'),
    hasInstagram: userAgentLower.includes('instagram'),
    hasThreads: userAgentLower.includes('threads'),
    hasFacebook: userAgentLower.includes('facebook'),
    hasMobile: userAgentLower.includes('mobile'),
    hasAndroid: userAgentLower.includes('android'),
    hasIphone: userAgentLower.includes('iphone'),
    hasIpad: userAgentLower.includes('ipad'),
  };
  
  console.log('🔍 Enhanced Browser Detection Debug Info:', debugInfo);
  return debugInfo;
}; 