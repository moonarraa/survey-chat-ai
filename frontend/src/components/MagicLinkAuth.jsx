import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function MagicLinkAuth({ onSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [magicLink, setMagicLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('auth/magic-link/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSent(true);
        setMagicLink(data.magic_link); // Remove this in production
      } else {
        setError(data.detail || t('Failed to send magic link'));
      }
    } catch (err) {
      setError(t('Network error. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkClick = async () => {
    // Extract token from magic link
    const url = new URL(magicLink);
    const token = url.searchParams.get('token');
    
    if (!token) {
      setError(t('Invalid magic link'));
      return;
    }

    try {
      const response = await fetch(getApiUrl('auth/magic-link/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (onSuccess) onSuccess();
      } else {
        setError(data.detail || t('Failed to verify magic link'));
      }
    } catch (err) {
      setError(t('Network error. Please try again later.'));
    }
  };

  if (isSent) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('Magic link sent!')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('Check your email and click the link to sign in.')}
          </p>
          
          {/* Development only - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Development Mode:</strong> Click the link below to sign in:
              </p>
              <button
                onClick={handleMagicLinkClick}
                className="text-blue-600 underline text-sm hover:text-blue-800"
              >
                {magicLink}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            setIsSent(false);
            setEmail('');
            setError('');
          }}
          className="w-full text-gray-500 py-2 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          {t('Try different email')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('Sign in with Magic Link')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('Enter your email and we\'ll send you a secure link to sign in. Works in any browser!')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('Email address')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder={t('example@company.com')}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('Sending...')}
            </>
          ) : (
            t('Send Magic Link')
          )}
        </button>
      </form>
    </div>
  );
} 