import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        // Debug logging
        console.log('🔍 AuthCallback Debug Info:');
        console.log('URL:', window.location.href);
        console.log('Pathname:', window.location.pathname);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('Code:', code);
        console.log('Token:', token);
        console.log('Error:', error);
        console.log('State:', state);

        if (error) {
          console.error('OAuth error:', error);
          setError(error);
          setStatus('error');
          return;
        }

        // Handle Google OAuth callback with token (from our backend)
        if (token) {
          console.log('✅ Received token from Google OAuth callback');
          console.log('🔗 Token length:', token.length);
          localStorage.setItem('token', token); // Fixed: use 'token' instead of 'access_token'
          console.log('💾 Token stored in localStorage with key "token"');
          setStatus('success');
          console.log('🔄 Setting status to success, will redirect in 1 second...');
          
          // Immediate redirect as fallback
          setTimeout(() => {
            console.log('🚀 Attempting redirect to /dashboard...');
            navigate('/dashboard');
          }, 1000);
          
          // Additional fallback redirect after 3 seconds
          setTimeout(() => {
            console.log('🔄 Fallback redirect attempt...');
            window.location.href = '/dashboard';
          }, 3000);
          
          return;
        }

        // Handle Auth0 callback
        if (window.location.pathname.includes('/auth/callback') && code) {
          console.log('🔄 Handling Auth0 callback with code');
          await handleAuth0Callback(code);
          return;
        }

        // Handle Google OAuth callback with code (legacy flow)
        if (window.location.pathname.includes('/auth/google/callback') && code) {
          console.log('🔄 Handling Google callback with code');
          await handleGoogleCallback(code);
          return;
        }

        // Handle magic link callback
        if (window.location.pathname.includes('/auth/magic-link')) {
          console.log('🔄 Handling magic link callback');
          await handleMagicLinkCallback();
          return;
        }

        console.error('❌ No authorization code or token received');
        console.error('Available search params:', Object.fromEntries(searchParams.entries()));
        setError('No authorization code or token received');
        setStatus('error');

      } catch (err) {
        console.error('❌ Callback handling error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams]);

  const handleAuth0Callback = async (code) => {
    try {
      // Exchange code for token with Auth0
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
          code: code,
          redirect_uri: window.location.origin + '/auth/callback',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      // Get user info from Auth0
      const userResponse = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const userData = await userResponse.json();

      // Create or get user in our backend
      const backendResponse = await fetch(getApiUrl('auth/auth0/callback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0_user: userData,
          access_token: data.access_token,
        }),
      });

      const backendData = await backendResponse.json();

      if (backendData.access_token) {
        localStorage.setItem('token', backendData.access_token); // Fixed: use 'token' instead of 'access_token'
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        throw new Error('Failed to get access token from backend');
      }

    } catch (err) {
      console.error('Auth0 callback error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const handleGoogleCallback = async (code) => {
    try {
      // Exchange code for token via our backend proxy
      const response = await fetch(getApiUrl('auth/oauth/google/proxy'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('token', data.access_token); // Fixed: use 'token' instead of 'access_token'
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        throw new Error('Failed to get access token');
      }

    } catch (err) {
      console.error('Google callback error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const handleMagicLinkCallback = async () => {
    try {
      const token = searchParams.get('token');

      if (!token) {
        throw new Error('No magic link token provided');
      }

      // Verify magic link token
      const response = await fetch(getApiUrl('auth/magic-link/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('token', data.access_token); // Fixed: use 'token' instead of 'access_token'
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        throw new Error('Failed to verify magic link');
      }

    } catch (err) {
      console.error('Magic link callback error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  // Render loading state
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing authentication...</h2>
          <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Render success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
