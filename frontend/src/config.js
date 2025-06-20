// Forcing a clean rebuild on Railway by adding a comment
// Normalize the backend URL to ensure no double slashes
const normalizeUrl = (url) => {
  // Remove trailing slash if present
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return baseUrl;
};

const rawUrl = import.meta.env.VITE_BACKEND_URL || '//localhost:8000'; // ← protocol-relative fallback

// 2. OPTIONAL: auto-upgrade if someone still passes http:// in prod
const safeUrl =
  window.location.protocol === 'https:' && rawUrl.startsWith('http://')
    ? rawUrl.replace('http://', 'https://')
    : rawUrl;

export const BACKEND_URL = normalizeUrl(safeUrl);

// Helper function to construct API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

// Other configuration variables can be added here
export const APP_VERSION = '1.0.0';