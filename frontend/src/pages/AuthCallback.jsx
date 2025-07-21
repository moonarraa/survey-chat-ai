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
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          console.error('OAuth error:', error);
          setError(error);
          setStatus('error');
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Handle Auth0 callback
        if (window.location.pathname.includes('/auth/callback')) {
          await handleAuth0Callback(code);
          return;
        }

        // Handle Google OAuth callback
        if (window.location.pathname.includes('/auth/google/callback')) {
          await handleGoogleCallback(code);
          return;
        }

        // Handle magic link callback
        if (window.location.pathname.includes('/auth/magic-link')) {
          await handleMagicLinkCallback();
          return;
        }

        setError('Unknown callback type');
        setStatus('error');

      } catch (err) {
        console.error('Callback handling error:', err);
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
        localStorage.setItem('access_token', backendData.access_token);
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
        localStorage.setItem('access_token', data.access_token);
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
        localStorage.setItem('access_token', data.access_token);
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

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('Processing Authentication')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('Please wait while we complete your sign-in...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('Authentication Failed')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || t('An error occurred during authentication')}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('Back to Login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('Authentication Successful')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('Redirecting to dashboard...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
