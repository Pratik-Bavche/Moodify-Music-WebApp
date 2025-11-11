import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export const searchSongs = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/streaming/search`, {
      params: { query, maxResults },
    });

    // Backend response shape: { success: true, data: [...], ... }
    // Normalize so callers receive { success, data } where data is the songs array
    const backend = response.data || {};
    return {
      success: backend.success === undefined ? true : backend.success,
      data: Array.isArray(backend.data) ? backend.data : [],
      message: backend.message || null,
    };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return { success: false, message: 'Failed to search songs', data: [] };
  }
};

export const getTrendingByMood = async (mood, maxResults = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/streaming/trending`, {
      params: { mood, maxResults },
    });

    const backend = response.data || {};
    return {
      success: backend.success === undefined ? true : backend.success,
      data: Array.isArray(backend.data) ? backend.data : [],
      message: backend.message || null,
    };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return { success: false, message: 'Failed to get trending songs', data: [] };
  }
};
