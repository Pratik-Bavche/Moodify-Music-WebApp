import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for streaming operations
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class StreamingService {
  // Search songs by mood or keyword
  async searchSongs(query, maxResults = 10) {
    try {
      const response = await api.get('/streaming/search', {
        params: { query, maxResults }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search songs');
    }
  }

  // Get available moods
  async getAvailableMoods() {
    try {
      const response = await api.get('/streaming/moods');
      return response.data;
    } catch (error) {
      console.error('Moods error:', error);
      throw new Error('Failed to get moods');
    }
  }

  // Get trending songs by mood
  async getTrendingByMood(mood, maxResults = 10) {
    try {
      const response = await api.get('/streaming/trending', {
        params: { mood, maxResults }
      });
      return response.data;
    } catch (error) {
      console.error('Trending error:', error);
      throw new Error('Failed to get trending songs');
    }
  }

  // Get video details
  async getVideoDetails(videoId) {
    try {
      const response = await api.get(`/streaming/details/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Video details error:', error);
      throw new Error('Failed to get video details');
    }
  }

  // Get stream URL for playback (requires authentication)
  async getStreamUrl(videoId) {
    try {
      const response = await api.get(`/streaming/stream/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Stream URL error:', error);
      throw new Error('Failed to get stream URL');
    }
  }

  // Search with mood-based suggestions
  async searchWithMoodSuggestions(query) {
    try {
      // First try direct search
      const searchResults = await this.searchSongs(query);
      
      // If results are limited, try mood-based expansion
      if (searchResults.data.length < 5) {
        const moods = await this.getAvailableMoods();
        const moodKeywords = moods.data.map(mood => mood.id);
        
        // Try searching with mood keywords
        for (const mood of moodKeywords.slice(0, 3)) {
          try {
            const moodResults = await this.searchSongs(`${query} ${mood}`);
            if (moodResults.data.length > 0) {
              // Merge results, avoiding duplicates
              const existingIds = new Set(searchResults.data.map(song => song.id));
              const newSongs = moodResults.data.filter(song => !existingIds.has(song.id));
              searchResults.data.push(...newSongs.slice(0, 5));
              break;
            }
          } catch (error) {
            console.warn(`Mood search failed for ${mood}:`, error);
          }
        }
      }
      
      return searchResults;
    } catch (error) {
      console.error('Search with mood suggestions error:', error);
      throw new Error('Failed to search with mood suggestions');
    }
  }

  // Get random songs by mood
  async getRandomSongsByMood(mood, count = 10) {
    try {
      const response = await this.searchSongs(mood, count * 2); // Get more to randomize
      const songs = response.data;
      
      // Shuffle and return requested count
      const shuffled = this.shuffleArray(songs);
      return {
        ...response,
        data: shuffled.slice(0, count)
      };
    } catch (error) {
      console.error('Random songs error:', error);
      throw new Error('Failed to get random songs');
    }
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get song with stream URL for playback
  async getSongForPlayback(videoId) {
    try {
      // Get both details and stream URL
      const [detailsResponse, streamResponse] = await Promise.all([
        this.getVideoDetails(videoId),
        this.getStreamUrl(videoId)
      ]);

      return {
        ...detailsResponse.data,
        ...streamResponse.data
      };
    } catch (error) {
      console.error('Playback preparation error:', error);
      throw new Error('Failed to prepare song for playback');
    }
  }

  // Search with fallback to trending
  async searchWithFallback(query) {
    try {
      const searchResults = await this.searchSongs(query);
      
      // If no results, try trending songs
      if (searchResults.data.length === 0) {
        const moods = await this.getAvailableMoods();
        const randomMood = moods.data[Math.floor(Math.random() * moods.data.length)];
        const trendingResults = await this.getTrendingByMood(randomMood.id);
        
        return {
          ...trendingResults,
          fallback: true,
          originalQuery: query,
          fallbackMood: randomMood
        };
      }
      
      return searchResults;
    } catch (error) {
      console.error('Search with fallback error:', error);
      throw new Error('Failed to search with fallback');
    }
  }
}

// Create and export singleton instance
const streamingService = new StreamingService();
export default streamingService;

// Export individual functions for convenience
export const {
  searchSongs,
  getAvailableMoods,
  getTrendingByMood,
  getVideoDetails,
  getStreamUrl,
  searchWithMoodSuggestions,
  getRandomSongsByMood,
  getSongForPlayback,
  searchWithFallback
} = streamingService; 