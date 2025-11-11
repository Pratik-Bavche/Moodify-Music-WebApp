// frontend/src/config/apiConfig.js
const getApiBaseUrl = () => {
  // if (process.env.REACT_APP_API_URL) {
  //   return process.env.REACT_APP_API_URL;
  // }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  // if (typeof window !== 'undefined') {
  //   return 'https://moodify-music-web-app-server.vercel.app/api';
  // }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
