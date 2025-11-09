// API Configuration
// In development, use proxy (empty string)
// In production, use full backend URL from environment variable

const getApiBaseUrl = () => {
  // If REACT_APP_API_URL is set, use it (required for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In development, use proxy (empty string)
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // In production without REACT_APP_API_URL set
  // Try to use same origin (if backend is on same domain)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.warn(
      '⚠️ REACT_APP_API_URL not set in production!\n' +
      'Please set REACT_APP_API_URL environment variable to your backend URL.\n' +
      'Example: REACT_APP_API_URL=https://your-backend.com\n' +
      'Using same origin as fallback: ' + origin
    );
    return origin;
  }
  
  // Fallback for SSR or build time
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

