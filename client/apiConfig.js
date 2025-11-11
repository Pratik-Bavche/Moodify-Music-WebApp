// frontend/src/config/apiConfig.js
const getApiBaseUrl = () => {
  // Priority order:
  // 1. REACT_APP_API_BASE_URL (explicit)
  // 2. REACT_APP_API_URL (legacy env var if present)
  // 3. development -> localhost
  // 4. production -> deployed Vercel URL
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }

  return 'https://moodify-music-web-app-server.vercel.app/api';
};

export const API_BASE_URL = getApiBaseUrl();
