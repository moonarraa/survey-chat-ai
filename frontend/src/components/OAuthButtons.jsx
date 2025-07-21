import React, { useState } from "react";
import { getApiUrl } from '../config';
import { isInAppBrowser, openInExternalBrowser, getBrowserInfo } from '../utils/browserDetection';
import { useTranslation } from 'react-i18next';

console.log('OAuthButtons component loaded - deployment check');

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48">
    <g>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.7 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.36 13.13 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.01h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.5z"/>
      <path fill="#FBBC05" d="M10.67 28.64A14.5 14.5 0 0 1 9.5 24c0-1.62.28-3.19.77-4.64l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.49 10.5l8.18-5.86z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.6c-2.01 1.35-4.59 2.15-8.7 2.15-6.26 0-11.64-3.63-13.33-8.64l-8.18 5.86C6.73 42.52 14.82 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </g>
  </svg>
);

export default function OAuthButtons({ onGoogleClick, showEmailFallback = false }) {
  const { t } = useTranslation();
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const browserInfo = getBrowserInfo();

  const handleGoogleLogin = () => {
    if (onGoogleClick) onGoogleClick();
    
    const googleAuthUrl = getApiUrl('auth/login/google');
    
    if (browserInfo.isInAppBrowser) {
      // Show warning for in-app browsers
      setShowInAppWarning(true);
      return;
    }
    
    // Normal flow for regular browsers
    window.location.href = googleAuthUrl;
  };

  const handleOpenInExternalBrowser = () => {
    const googleAuthUrl = getApiUrl('auth/login/google');
    openInExternalBrowser(googleAuthUrl);
    setShowInAppWarning(false);
  };

  const handleContinueAnyway = () => {
    const googleAuthUrl = getApiUrl('auth/login/google');
    window.location.href = googleAuthUrl;
    setShowInAppWarning(false);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-150 font-semibold text-gray-700 text-base"
        style={{ boxShadow: '0 1px 2px rgba(60,64,67,.08)' }}
      >
        <GoogleIcon />
        {t('Sign in with Google')}
      </button>

      {/* Show email fallback option for in-app browsers */}
      {browserInfo.isInAppBrowser && showEmailFallback && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">
            {t('Having trouble with Google login?')}
          </p>
          <p className="text-xs text-gray-400">
            {t('Try using email and password instead')}
          </p>
        </div>
      )}

      {/* In-App Browser Warning Modal */}
      {showInAppWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('In-App Browser Detected')}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('Google login may not work properly in this browser. We recommend opening this page in your default browser.')}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleOpenInExternalBrowser}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('Open in Browser')}
                </button>
                
                <button
                  onClick={handleContinueAnyway}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  {t('Continue Anyway')}
                </button>
                
                <button
                  onClick={() => setShowInAppWarning(false)}
                  className="w-full text-gray-500 py-2 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
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
}
