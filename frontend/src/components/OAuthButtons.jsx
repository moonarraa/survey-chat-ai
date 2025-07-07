import React from "react";
import { getApiUrl } from '../config';

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

export default function OAuthButtons({ onGoogleClick }) {
  const handleGoogleLogin = () => {
    if (onGoogleClick) onGoogleClick();
    window.location.href = getApiUrl('auth/login/google');
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-150 font-semibold text-gray-700 text-base"
      style={{ boxShadow: '0 1px 2px rgba(60,64,67,.08)' }}
    >
      <GoogleIcon />
      Войти через Google
    </button>
  );
}
