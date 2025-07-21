import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config';
import { 
  isInAppBrowser, 
  shouldUseSystemBrowser, 
  openInSystemBrowser, 
  openInExternalBrowser,
  debugBrowserInfo 
} from '../utils/browserDetection';
import MagicLinkAuth from './MagicLinkAuth';

const OAuthButtons = ({ onGoogleClick, showEmailFallback = false }) => {
  const { t } = useTranslation();
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showAuth0Options, setShowAuth0Options] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    const info = debugBrowserInfo();
    setBrowserInfo(info);
  }, []);

  // Google's Official Solution: System Browser Approach
  const handleGoogleLoginSystemBrowser = () => {
    if (onGoogleClick) onGoogleClick();
    const googleAuthUrl = getApiUrl('auth/login/google');
    
    console.log('🌐 Using Google\'s Official System Browser Approach');
    
    if (shouldUseSystemBrowser()) {
      console.log('📱 Redirecting to system browser for OAuth');
      openInSystemBrowser(googleAuthUrl);
    } else {
      console.log('🖥️ Using normal OAuth flow for desktop');
      window.location.href = googleAuthUrl;
    }
  };

  // Auth0 Approach (if configured)
  const handleAuth0Login = () => {
    if (onGoogleClick) onGoogleClick();
    
    const getAuth0ClientId = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect problematic user agents
      const isProblematicUserAgent = 
        userAgent.includes('iphone') ||
        userAgent.includes('instagram') ||
        userAgent.includes('threads') ||
        userAgent.includes('facebook') ||
        userAgent.includes('wv') ||
        userAgent.includes('webview');
        
      if (isProblematicUserAgent) {
        return process.env.REACT_APP_AUTH0_MOBILE_CLIENT_ID; // Google SSO disabled
      } else {
        return process.env.REACT_APP_AUTH0_CLIENT_ID; // Google SSO enabled
      }
    };

    const clientId = getAuth0ClientId();
    const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
    
    if (auth0Domain && clientId) {
      const auth0Url = `https://${auth0Domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&scope=openid profile email`;
      window.location.href = auth0Url;
    } else {
      console.log('⚠️ Auth0 not configured, falling back to system browser approach');
      handleGoogleLoginSystemBrowser();
    }
  };

  // Backend OAuth Proxy Approach
  const handleBackendProxyLogin = async () => {
    if (onGoogleClick) onGoogleClick();
    
    try {
      console.log('🔄 Using Backend OAuth Proxy Approach');
      
      // Get OAuth URL from backend
      const response = await fetch(getApiUrl('auth/oauth/google/url'));
      const data = await response.json();
      
      if (data.auth_url) {
        // Open in popup for better UX
        const popup = window.open(data.auth_url, 'google_oauth', 'width=500,height=600');
        
        // Listen for the callback
        window.addEventListener('message', async (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_OAUTH_CALLBACK') {
            const { code } = event.data;
            
            // Exchange code for token via backend
            const tokenResponse = await fetch(getApiUrl('auth/oauth/google/proxy'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });
            
            const tokenData = await tokenResponse.json();
            
            if (tokenData.access_token) {
              // Store token and redirect
              localStorage.setItem('access_token', tokenData.access_token);
              window.location.href = '/dashboard';
            }
          }
        });
      }
    } catch (error) {
      console.error('Backend proxy failed:', error);
      // Fallback to system browser
      handleGoogleLoginSystemBrowser();
    }
  };

  // Legacy approach with warning modal
  const handleGoogleLoginLegacy = () => {
    if (onGoogleClick) onGoogleClick();
    const googleAuthUrl = getApiUrl('auth/login/google');
    const userAgent = navigator.userAgent.toLowerCase();
    const userAgentFull = navigator.userAgent;
    const isLikelyInApp = 
      browserInfo?.isInAppBrowser || 
      userAgent.includes('wv') || 
      userAgent.includes('webview') ||
      userAgent.includes('web_view') ||
      userAgent.includes('instagram') ||
      userAgent.includes('threads') ||
      userAgent.includes('facebook') ||
      userAgent.includes('fb') ||
      userAgent.includes('snapchat') ||
      userAgent.includes('tiktok') ||
      userAgent.includes('twitter') ||
      userAgent.includes('whatsapp') ||
      userAgent.includes('telegram') ||
      (userAgent.includes('mobile') && userAgent.includes('android')) ||
      userAgent.includes('mobile') ||
      userAgent.includes('inapp') ||
      userAgent.includes('in_app') ||
      userAgent.includes('embedded') ||
      userAgent.includes('meta') ||
      (userAgent.includes('android') && (userAgent.includes('mobile') || userAgent.includes('wv'))) ||
      (userAgent.includes('iphone') && (userAgent.includes('mobile') || userAgent.includes('wv'))) ||
      (userAgent.includes('ipad') && (userAgent.includes('mobile') || userAgent.includes('wv')));
    
    console.log('🚨 Legacy Detection:', {
      userAgent: userAgentFull, userAgentLower: userAgent, browserInfo, isLikelyInApp, googleAuthUrl
    });
    
    if (isLikelyInApp || userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      console.log('🚨 SHOWING MODAL - Mobile/In-App detected');
      setShowInAppWarning(true);
      return;
    }
    console.log('✅ Proceeding with normal OAuth flow - Desktop browser detected');
    window.location.href = googleAuthUrl;
  };

  // Main handler - tries all approaches in order
  const handleGoogleLogin = () => {
    console.log('🚀 Starting Google OAuth with all approaches available');
    
    // 1. Try Google's Official System Browser approach first
    if (shouldUseSystemBrowser()) {
      console.log('📱 Using Google\'s Official System Browser Approach');
      handleGoogleLoginSystemBrowser();
      return;
    }
    
    // 2. Try Auth0 if configured
    if (process.env.REACT_APP_AUTH0_DOMAIN) {
      console.log('🔐 Using Auth0 Approach');
      handleAuth0Login();
      return;
    }
    
    // 3. Fallback to legacy approach with warning modal
    console.log('⚠️ Using Legacy Approach with Warning Modal');
    handleGoogleLoginLegacy();
  };

  const handleOpenInBrowser = () => {
    const googleAuthUrl = getApiUrl('auth/login/google');
    openInExternalBrowser(googleAuthUrl);
    setShowInAppWarning(false);
  };

  const handleTryGoogleAnyway = () => {
    const googleAuthUrl = getApiUrl('auth/login/google');
    window.location.href = googleAuthUrl;
    setShowInAppWarning(false);
  };

  const handleUseEmailLink = () => {
    setShowMagicLink(true);
    setShowInAppWarning(false);
  };

  const handleTryBackendProxy = () => {
    handleBackendProxyLogin();
    setShowInAppWarning(false);
  };

  const handleTryAuth0 = () => {
    handleAuth0Login();
    setShowInAppWarning(false);
  };

  if (showMagicLink) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowMagicLink(false)}
          className="text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          ← {t('Back to other options')}
        </button>
        <MagicLinkAuth onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Google OAuth Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('Sign in with Google')}
      </button>

      {/* Alternative Options */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t('or')}</span>
        </div>
      </div>

      {/* Magic Link Option */}
      <button
        onClick={() => setShowMagicLink(true)}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        📧 {t('Sign in with Email Link')}
      </button>

      {/* Development Test Button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowInAppWarning(true)}
          className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          🧪 TEST: Force Show Modal
        </button>
      )}

      {/* In-App Browser Warning Modal */}
      {showInAppWarning && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                {t('In-App Browser Detected')}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {t('Google login may not work properly in this browser. We recommend opening this page in your default browser.')}
                </p>
              </div>
              <div className="items-center px-4 py-3 space-y-2">
                {/* Google's Official Solution */}
                <button
                  onClick={handleGoogleLoginSystemBrowser}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🌐 {t('Use System Browser')} (Google Official)
                </button>
                
                {/* Magic Link Option */}
                <button
                  onClick={handleUseEmailLink}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  📧 {t('Use Email Link (Recommended)')}
                </button>
                
                {/* Auth0 Option */}
                {process.env.REACT_APP_AUTH0_DOMAIN && (
                  <button
                    onClick={handleTryAuth0}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    🔐 {t('Try Auth0')}
                  </button>
                )}
                
                {/* Backend Proxy Option */}
                <button
                  onClick={handleTryBackendProxy}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  🔄 {t('Try Backend Proxy')}
                </button>
                
                {/* Open in External Browser */}
                <button
                  onClick={handleOpenInBrowser}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  🌍 {t('Open in Browser')}
                </button>
                
                {/* Try Google Anyway */}
                <button
                  onClick={handleTryGoogleAnyway}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  ⚠️ {t('Try Google Anyway')}
                </button>
                
                {/* Cancel */}
                <button
                  onClick={() => setShowInAppWarning(false)}
                  className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthButtons;
