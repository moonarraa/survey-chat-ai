// Normalize the backend URL to ensure no double slashes
const normalizeUrl = (url) => {
  // Remove trailing slash if present
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return baseUrl;
};

const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
let finalUrl = normalizeUrl(rawUrl);

// Force HTTPS for production builds to prevent mixed content errors
if (import.meta.env.PROD && finalUrl.startsWith('http://')) {
  finalUrl = finalUrl.replace('http://', 'https://');
}

export const BACKEND_URL = finalUrl;

// Helper function to construct API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

// Other configuration variables can be added here
export const APP_VERSION = '1.0.0'; 