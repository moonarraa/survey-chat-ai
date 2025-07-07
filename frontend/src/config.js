// Forcing a clean rebuild on Railway by adding a comment
// Normalize the backend URL to ensure no double slashes
const normalizeUrl = (url) => {
  // Remove trailing slash if present
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return baseUrl;
};

const isProduction = process.env.NODE_ENV === 'production';
export const BACKEND_URL = isProduction 
  ? 'https://survey-ai.live' // Ваш продакшен URL бэкенда
  : 'http://localhost:8000'; // Ваш локальный URL бэкенда

// 2. OPTIONAL: auto-upgrade if someone still passes http:// in prod
const safeUrl =
  window.location.protocol === 'https:' && BACKEND_URL.startsWith('http://')
    ? BACKEND_URL.replace('http://', 'https://')
    : BACKEND_URL;

export const BACKEND_URL_NORMALIZED = normalizeUrl(safeUrl);

// Helper function to construct API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL_NORMALIZED}/${cleanPath}`;
};

// Other configuration variables can be added here
export const APP_VERSION = '1.0.0';