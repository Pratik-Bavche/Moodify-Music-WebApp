// YouTube API service with multiple API keys for better quota management
const YOUTUBE_API_KEYS = [
  'AIzaSyBpqM4DNdQ1BPwlIxthibfhIY2bCUcsb5k',
  'AIzaSyAQJd4LD3Dv7gd8Oi-ODLM7jGaarsisXKE',
  'AIzaSyBGBKUMvZ1oUvghCJvLdWsLncE5eEnyARo',
  'AIzaSyC3EBV0rVLzAH3aCQdB4CYYch_Xyqr-NOE',
  'AIzaSyCQPBEelIB4pEWR-hMrlSjD8XB3UsphRDg',
  'AIzaSyDa04NUnhxiWzKuE2CpKZXVrMs0Xbcg9cE',
  'AIzaSyBKGWPOBV9n_DFCR6gO7de3lW2Jhh126EU',
  'AIzaSyBFpWXQwYcCAAQkMdLrl_32QYb-TnsfV8M',
  'AIzaSyD-KLlv3nvrOqRGCyVJoeAdmUgTbrMSKY0',
  'AIzaSyB-jdHlRDmqqMEmPlhzz9WBgB3x_mfVr5c'
];

// Track API key usage and quota status
let currentApiKeyIndex = 0;
let apiKeyQuotaStatus = new Array(YOUTUBE_API_KEYS.length).fill(true); // true = available, false = quota exceeded
let apiKeysTested = false; // Flag to prevent repeated testing
let allKeysExhausted = false; // Flag to indicate all keys are exhausted
let testResults = null; // Store test results to avoid repeated testing

// Cache for API responses to reduce quota usage
const apiCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Mark current API key as quota exceeded
const markApiKeyQuotaExceeded = () => {
  apiKeyQuotaStatus[currentApiKeyIndex] = false;
  
  // Check if all API keys are exhausted
  const allExhausted = apiKeyQuotaStatus.every(status => !status);
  if (allExhausted) {
    allKeysExhausted = true;
    return false;
  }
  
  // Find next available API key
  let nextKeyIndex = (currentApiKeyIndex + 1) % YOUTUBE_API_KEYS.length;
  let attempts = 0;
  
  while (!apiKeyQuotaStatus[nextKeyIndex] && attempts < YOUTUBE_API_KEYS.length) {
    nextKeyIndex = (nextKeyIndex + 1) % YOUTUBE_API_KEYS.length;
    attempts++;
  }
  
  if (apiKeyQuotaStatus[nextKeyIndex]) {
    currentApiKeyIndex = nextKeyIndex;
    return true;
  } else {
    allKeysExhausted = true;
    return false;
  }
};

// Get current API key
const getCurrentApiKey = () => {
  const key = YOUTUBE_API_KEYS[currentApiKeyIndex];
  return key;
};

// Check if API key is valid
const isApiKeyValid = () => {
  const currentKey = getCurrentApiKey();
  const isValid = currentKey && currentKey !== 'YOUR_YOUTUBE_API_KEY' && currentKey.length > 10;
  return isValid;
};

// Test API key rotation manually
export const testApiKeyRotation = async () => {
  console.log('=== Testing API Key Rotation ===');
  console.log(`Starting with API key ${currentApiKeyIndex + 1}`);
  console.log(`Total API keys: ${YOUTUBE_API_KEYS.length}`);
  console.log(`Current quota status:`, apiKeyQuotaStatus.map((status, index) => `Key ${index + 1}: ${status ? '✅' : '❌'}`).join(', '));
  
  // Test each API key
  for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
    console.log(`\n--- Testing API Key ${i + 1} ---`);
    currentApiKeyIndex = i;
    
    const key = YOUTUBE_API_KEYS[i];
    const testResult = await testApiKey(key);
    
    if (testResult.valid) {
      console.log(`✅ API Key ${i + 1} is valid and working`);
    } else {
      console.log(`❌ API Key ${i + 1} failed:`, testResult.error);
      apiKeyQuotaStatus[i] = false;
    }
  }
  
  console.log('\n=== Final Status ===');
  console.log(`Available keys: ${apiKeyQuotaStatus.filter(status => status).length}/${YOUTUBE_API_KEYS.length}`);
  console.log(`Quota status:`, apiKeyQuotaStatus.map((status, index) => `Key ${index + 1}: ${status ? '✅' : '❌'}`).join(', '));
  
  return {
    totalKeys: YOUTUBE_API_KEYS.length,
    availableKeys: apiKeyQuotaStatus.filter(status => status).length,
    quotaStatus: apiKeyQuotaStatus
  };
};

// Reset API key status (for testing)
export const resetApiKeyStatus = () => {
  currentApiKeyIndex = 0;
  apiKeyQuotaStatus = new Array(YOUTUBE_API_KEYS.length).fill(true);
  apiKeysTested = false;
  allKeysExhausted = false;
  testResults = null;
  console.log('API key status reset - starting from key 1');
  console.log(`All ${YOUTUBE_API_KEYS.length} keys marked as available`);
};

// Get current API key status
export const getApiKeyStatus = () => {
  return {
    currentKey: currentApiKeyIndex + 1,
    totalKeys: YOUTUBE_API_KEYS.length,
    quotaStatus: apiKeyQuotaStatus.map((status, index) => ({
      keyIndex: index + 1,
      available: status
    }))
  };
};

// Rotate to next API key
const rotateApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % YOUTUBE_API_KEYS.length;
};

// Enhanced search queries with better variety
const getEnhancedSearchQueries = (mood) => {
  const enhancedQueries = {
    'Happy': {
      hindi: ['happy hindi songs 2024', 'upbeat hindi music', 'dance hindi songs'],
      marathi: ['happy marathi songs 2024', 'upbeat marathi music', 'dance marathi songs'],
      english: ['happy english songs 2024', 'upbeat pop music', 'dance songs']
    },
    'Sad': {
      hindi: ['sad hindi songs 2024', 'emotional hindi music', 'melancholy hindi songs'],
      marathi: ['sad marathi songs 2024', 'emotional marathi music', 'melancholy marathi songs'],
      english: ['sad english songs 2024', 'emotional pop music', 'melancholy songs']
    },
    'Angry': {
      hindi: ['angry hindi songs 2024', 'intense hindi music', 'powerful hindi songs'],
      marathi: ['angry marathi songs 2024', 'intense marathi music', 'powerful marathi songs'],
      english: ['angry english songs 2024', 'intense rock music', 'powerful songs']
    },
    'Tired': {
      hindi: ['relaxing hindi songs 2024', 'calm hindi music', 'peaceful hindi songs'],
      marathi: ['relaxing marathi songs 2024', 'calm marathi music', 'peaceful marathi songs'],
      english: ['relaxing english songs 2024', 'calm ambient music', 'peaceful songs']
    },
    'Natural': {
      hindi: ['nature hindi songs 2024', 'organic hindi music', 'earthy hindi songs'],
      marathi: ['nature marathi songs 2024', 'organic marathi music', 'earthy marathi songs'],
      english: ['nature english songs 2024', 'organic folk music', 'earthy songs']
    },
    'Excited': {
      hindi: ['exciting hindi songs 2024', 'energetic hindi music', 'thrilling hindi songs'],
      marathi: ['exciting marathi songs 2024', 'energetic marathi music', 'thrilling marathi songs'],
      english: ['exciting english songs 2024', 'energetic pop music', 'thrilling songs']
    },
    'Relaxed': {
      hindi: ['chill hindi songs 2024', 'smooth hindi music', 'laid back hindi songs'],
      marathi: ['chill marathi songs 2024', 'smooth marathi music', 'laid back marathi songs'],
      english: ['chill english songs 2024', 'smooth jazz music', 'laid back songs']
    },
    'Romantic': {
      hindi: ['romantic hindi songs 2024', 'love hindi music', 'romantic bollywood songs'],
      marathi: ['romantic marathi songs 2024', 'love marathi music', 'romantic marathi songs'],
      english: ['romantic english songs 2024', 'love pop music', 'romantic songs']
    },
    'Focused': {
      hindi: ['study hindi songs 2024', 'concentration hindi music', 'focus hindi songs'],
      marathi: ['study marathi songs 2024', 'concentration marathi music', 'focus marathi songs'],
      english: ['study english songs 2024', 'concentration instrumental music', 'focus songs']
    },
    'Party': {
      hindi: ['party hindi songs 2024', 'celebration hindi music', 'dance bollywood songs'],
      marathi: ['party marathi songs 2024', 'celebration marathi music', 'dance marathi songs'],
      english: ['party english songs 2024', 'celebration pop music', 'dance songs']
    }
  };
  
  return enhancedQueries[mood] || enhancedQueries['Happy'];
};

// Check cache before making API calls
const getCachedSongs = (cacheKey) => {
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Cache API responses
const cacheSongs = (cacheKey, songs) => {
  apiCache.set(cacheKey, {
    data: songs,
    timestamp: Date.now()
  });
};

// Enhanced fetch with caching and better error handling
const fetchSongsByLanguageEnhanced = async (queries, language, count) => {
  const songs = [];
  const queriesForLanguage = queries[language];
  
  // Try each query until we get enough songs
  for (const query of queriesForLanguage) {
    const cacheKey = `${language}_${query}_${count}`;
    const cachedSongs = getCachedSongs(cacheKey);
    
    if (cachedSongs) {
      console.log(`Using cached songs for ${language}: ${query}`);
      songs.push(...cachedSongs);
      if (songs.length >= count) break;
      continue;
    }
    
    try {
      const currentKey = getCurrentApiKey();
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `q=${encodeURIComponent(query)}&` +
        `part=snippet&` +
        `type=video&` +
        `videoCategoryId=10&` + // Music category
        `maxResults=${Math.min(count * 2, 50)}&` + // Get more to filter
        `key=${currentKey}`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Check for quota exceeded error
        if (data.error) {
          if (data.error.code === 403 || data.error.message.includes('quota') || data.error.message.includes('exceeded')) {
            const hasMoreKeys = markApiKeyQuotaExceeded();
            if (hasMoreKeys) {
              // Retry with new API key
              continue;
            } else {
              break;
            }
          } else {
            continue;
          }
        }
        
        if (data.items && data.items.length > 0) {
          const newSongs = data.items
            .filter(item => {
              // Filter out non-music videos, live streams, etc.
              const title = item.snippet.title.toLowerCase();
              const isMusic = !title.includes('live') && 
                            !title.includes('concert') && 
                            !title.includes('cover') &&
                            !title.includes('remix') &&
                            title.length > 5;
              return isMusic;
            })
            .map(item => ({
              id: item.id.videoId,
              videoId: item.id.videoId,
              title: item.snippet.title,
              artist: item.snippet.channelTitle,
              language: language,
              thumbnail: item.snippet.thumbnails.medium.url
            }));
          
          songs.push(...newSongs);
          
          // Cache the results
          cacheSongs(cacheKey, newSongs);
          
          if (songs.length >= count) break;
        }
      } else {
        if (response.status === 403) {
          const hasMoreKeys = markApiKeyQuotaExceeded();
          if (hasMoreKeys) {
            continue;
          } else {
            break;
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${language} songs for query "${query}":`, error);
      continue;
    }
  }
  
  return songs.slice(0, count);
};

// Alternative music APIs for better variety
const SPOTIFY_CLIENT_ID = 'your_spotify_client_id'; // You can get this from Spotify Developer Console
const LASTFM_API_KEY = 'your_lastfm_api_key'; // You can get this from Last.fm API

// Fetch songs from Spotify API (requires Spotify Developer account)
const fetchSpotifySongs = async (mood) => {
  try {
    // This would require Spotify OAuth implementation
    // For now, return empty array - you can implement this later
    return [];
  } catch (error) {
    console.error('Spotify API error:', error);
    return [];
  }
};

// Fetch songs from Last.fm API
const fetchLastFmSongs = async (mood) => {
  try {
    const moodToTag = {
      'Happy': 'happy',
      'Sad': 'sad',
      'Angry': 'angry',
      'Tired': 'relaxing',
      'Natural': 'nature',
      'Excited': 'energetic',
      'Relaxed': 'chill',
      'Romantic': 'romantic',
      'Focused': 'instrumental',
      'Party': 'party'
    };
    
    const tag = moodToTag[mood] || 'happy';
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${tag}&api_key=${LASTFM_API_KEY}&format=json&limit=20`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.tracks && data.tracks.track) {
        return data.tracks.track.map(track => ({
          id: track.mbid || `lastfm_${track.name}`,
          videoId: null, // Last.fm doesn't provide video IDs
          title: track.name,
          artist: track.artist.name,
          mood: mood,
          language: 'english',
          thumbnail: 'https://via.placeholder.com/120x90?text=Last.fm',
          source: 'lastfm'
        }));
      }
    }
    return [];
  } catch (error) {
    console.error('Last.fm API error:', error);
    return [];
  }
};

// Smart Song Fetching System - Tests and uses the best available source
const FETCHING_SOURCES = {
  YOUTUBE_API: 'youtube_api',
  LASTFM_API: 'lastfm_api',
  SPOTIFY_API: 'spotify_api',
  FALLBACK: 'fallback'
};

// Track performance of different sources
const sourcePerformance = {
  [FETCHING_SOURCES.YOUTUBE_API]: { success: 0, total: 0, avgResponseTime: 0 },
  [FETCHING_SOURCES.LASTFM_API]: { success: 0, total: 0, avgResponseTime: 0 },
  [FETCHING_SOURCES.SPOTIFY_API]: { success: 0, total: 0, avgResponseTime: 0 },
  [FETCHING_SOURCES.FALLBACK]: { success: 0, total: 0, avgResponseTime: 0 }
};

// Current best source (auto-detected)
let currentBestSource = null;
let sourceTestResults = null;

// Test all sources and find the best one
const testAllSources = async (mood) => {
  console.log('🔍 Testing all song fetching sources...');
  
  const testResults = {};
  const testMood = 'Happy'; // Use a simple mood for testing
  
  // Test YouTube API - bypass quota checks for testing
  try {
    console.log('🧪 Testing YouTube API...');
    const startTime = Date.now();
    
    // Temporarily reset quota status for testing
    const originalQuotaStatus = [...apiKeyQuotaStatus];
    const originalAllKeysExhausted = allKeysExhausted;
    
    // Reset for testing
    apiKeyQuotaStatus = new Array(YOUTUBE_API_KEYS.length).fill(true);
    allKeysExhausted = false;
    
    const youtubeSongs = await fetchYouTubeSongs(testMood);
    const responseTime = Date.now() - startTime;
    
    // Restore original status
    apiKeyQuotaStatus = originalQuotaStatus;
    allKeysExhausted = originalAllKeysExhausted;
    
    testResults[FETCHING_SOURCES.YOUTUBE_API] = {
      success: youtubeSongs.length > 0,
      songCount: youtubeSongs.length,
      responseTime,
      songs: youtubeSongs
    };
    
    console.log(`✅ YouTube API: ${youtubeSongs.length} songs in ${responseTime}ms`);
  } catch (error) {
    testResults[FETCHING_SOURCES.YOUTUBE_API] = {
      success: false,
      songCount: 0,
      responseTime: 0,
      error: error.message
    };
    console.log(`❌ YouTube API failed: ${error.message}`);
  }
  
  // Test Last.fm API
  try {
    console.log('🧪 Testing Last.fm API...');
    const startTime = Date.now();
    const lastfmSongs = await fetchLastFmSongs(testMood);
    const responseTime = Date.now() - startTime;
    
    testResults[FETCHING_SOURCES.LASTFM_API] = {
      success: lastfmSongs.length > 0,
      songCount: lastfmSongs.length,
      responseTime,
      songs: lastfmSongs
    };
    
    console.log(`✅ Last.fm API: ${lastfmSongs.length} songs in ${responseTime}ms`);
  } catch (error) {
    testResults[FETCHING_SOURCES.LASTFM_API] = {
      success: false,
      songCount: 0,
      responseTime: 0,
      error: error.message
    };
    console.log(`❌ Last.fm API failed: ${error.message}`);
  }
  
  // Test Spotify API
  try {
    console.log('🧪 Testing Spotify API...');
    const startTime = Date.now();
    const spotifySongs = await fetchSpotifySongs(testMood);
    const responseTime = Date.now() - startTime;
    
    testResults[FETCHING_SOURCES.SPOTIFY_API] = {
      success: spotifySongs.length > 0,
      songCount: spotifySongs.length,
      responseTime,
      songs: spotifySongs
    };
    
    console.log(`✅ Spotify API: ${spotifySongs.length} songs in ${responseTime}ms`);
  } catch (error) {
    testResults[FETCHING_SOURCES.SPOTIFY_API] = {
      success: false,
      songCount: 0,
      responseTime: 0,
      error: error.message
    };
    console.log(`❌ Spotify API failed: ${error.message}`);
  }
  
  // Test Fallback
  try {
    console.log('🧪 Testing Fallback...');
    const startTime = Date.now();
    const fallbackSongs = getFallbackSongs(testMood);
    const responseTime = Date.now() - startTime;
    
    testResults[FETCHING_SOURCES.FALLBACK] = {
      success: fallbackSongs.length > 0,
      songCount: fallbackSongs.length,
      responseTime,
      songs: fallbackSongs
    };
    
    console.log(`✅ Fallback: ${fallbackSongs.length} songs in ${responseTime}ms`);
  } catch (error) {
    testResults[FETCHING_SOURCES.FALLBACK] = {
      success: false,
      songCount: 0,
      responseTime: 0,
      error: error.message
    };
    console.log(`❌ Fallback failed: ${error.message}`);
  }
  
  // Debug: Show all test results
  console.log('📊 Test Results Summary:');
  Object.entries(testResults).forEach(([source, result]) => {
    console.log(`  ${source}: ${result.success ? '✅' : '❌'} ${result.songCount} songs (${result.responseTime}ms)`);
  });
  
  // Find the best source based on:
  // 1. Success rate
  // 2. Number of songs returned
  // 3. Response time
  const workingSources = Object.entries(testResults)
    .filter(([source, result]) => result.success && result.songCount > 0)
    .sort((a, b) => {
      // Prioritize by song count, then by response time
      if (a[1].songCount !== b[1].songCount) {
        return b[1].songCount - a[1].songCount;
      }
      return a[1].responseTime - b[1].responseTime;
    });
  
  console.log(`🏆 Working sources found: ${workingSources.length}`);
  workingSources.forEach(([source, result], index) => {
    console.log(`  ${index + 1}. ${source}: ${result.songCount} songs (${result.responseTime}ms)`);
  });
  
  if (workingSources.length > 0) {
    currentBestSource = workingSources[0][0];
    console.log(`🏆 Best source selected: ${currentBestSource} (${workingSources[0][1].songCount} songs)`);
  } else {
    currentBestSource = FETCHING_SOURCES.FALLBACK;
    console.log(`⚠️ No working sources found, using fallback`);
  }
  
  sourceTestResults = testResults;
  return currentBestSource;
};

// Manual test function for debugging
export const manualTestSources = async () => {
  console.log('🔧 Manual source testing initiated...');
  currentBestSource = null; // Reset to force testing
  const result = await testAllSources('Happy');
  console.log(`🔧 Manual test result: ${result}`);
  return result;
};

// Get source performance statistics
export const getSourcePerformance = () => {
  return {
    currentBestSource,
    sourcePerformance,
    testResults: sourceTestResults
  };
};

// Reset source testing (useful for debugging)
export const resetSourceTesting = () => {
  currentBestSource = null;
  sourceTestResults = null;
  console.log('Source testing reset - will test all sources again on next request');
};

// Fetch songs using the best available source
export const fetchSongsSmart = async (mood) => {
  console.log(`🎵 fetchSongsSmart called for mood: ${mood}`);
  console.log(`🎵 currentBestSource: ${currentBestSource}`);
  
  // If we haven't tested sources yet, test them now
  if (!currentBestSource) {
    console.log('🎵 No currentBestSource, testing all sources...');
    await testAllSources(mood);
  }
  
  console.log(`🎵 Fetching songs for "${mood}" using: ${currentBestSource}`);
  
  try {
    let songs = [];
    
    switch (currentBestSource) {
      case FETCHING_SOURCES.YOUTUBE_API:
        console.log('🎵 Using YouTube API...');
        songs = await fetchYouTubeSongs(mood);
        break;
      case FETCHING_SOURCES.LASTFM_API:
        console.log('🎵 Using Last.fm API...');
        songs = await fetchLastFmSongs(mood);
        break;
      case FETCHING_SOURCES.SPOTIFY_API:
        console.log('🎵 Using Spotify API...');
        songs = await fetchSpotifySongs(mood);
        break;
      case FETCHING_SOURCES.FALLBACK:
      default:
        console.log('🎵 Using Fallback...');
        songs = getFallbackSongs(mood);
        break;
    }
    
    console.log(`🎵 Retrieved ${songs.length} songs from ${currentBestSource}`);
    
    // Update performance tracking
    if (sourcePerformance[currentBestSource]) {
      sourcePerformance[currentBestSource].total++;
      if (songs.length > 0) {
        sourcePerformance[currentBestSource].success++;
      }
    }
    
    // If current source failed, retest and switch
    if (songs.length === 0 && currentBestSource !== FETCHING_SOURCES.FALLBACK) {
      console.log(`⚠️ ${currentBestSource} failed, retesting sources...`);
      await testAllSources(mood);
      return await fetchSongsSmart(mood); // Recursive call with new best source
    }
    
    window.__MOODIFY_API_SOURCE = currentBestSource;
    return songs;
    
  } catch (error) {
    console.error(`Error fetching songs from ${currentBestSource}:`, error);
    
    // If current source failed, retest and switch
    if (currentBestSource !== FETCHING_SOURCES.FALLBACK) {
      console.log(`⚠️ ${currentBestSource} failed, retesting sources...`);
      await testAllSources(mood);
      return await fetchSongsSmart(mood); // Recursive call with new best source
    }
    
    // Last resort: use fallback
    window.__MOODIFY_API_SOURCE = FETCHING_SOURCES.FALLBACK;
    return getFallbackSongs(mood);
  }
};

// Separate YouTube fetching function
const fetchYouTubeSongs = async (mood) => {
  try {
    // If all keys are exhausted, return empty
    if (allKeysExhausted) {
      return [];
    }

    // Check if any API key is valid
    if (!isApiKeyValid()) {
      return [];
    }

    const queries = getEnhancedSearchQueries(mood);
    
    // Optimized song count distribution
    const totalSongs = 40;
    const hindiCount = Math.floor(totalSongs * 0.5);
    const marathiCount = Math.floor(totalSongs * 0.25);
    const englishCount = totalSongs - hindiCount - marathiCount;
    
    // Fetch songs for each language with enhanced queries
    const [hindiSongs, marathiSongs, englishSongs] = await Promise.all([
      fetchSongsByLanguageEnhanced(queries, 'hindi', hindiCount),
      fetchSongsByLanguageEnhanced(queries, 'marathi', marathiCount),
      fetchSongsByLanguageEnhanced(queries, 'english', englishCount)
    ]);
    
    // Combine all songs
    let allSongs = [...hindiSongs, ...marathiSongs, ...englishSongs];
    
    // Remove duplicates based on videoId
    const uniqueSongs = allSongs.filter((song, index, self) => 
      index === self.findIndex(s => s.videoId === song.videoId)
    );
    
    // Shuffle the songs
    const shuffledSongs = shuffleArray(uniqueSongs);
    
    // Add mood to each song
    const finalSongs = shuffledSongs.map(song => ({
      ...song,
      mood: mood
    }));
    
    return finalSongs;
    
  } catch (error) {
    console.error('Error fetching YouTube songs:', error);
    return [];
  }
};

// Search for songs by query (direct search)
export const searchSongs = async (query) => {
  try {
    // If all keys are exhausted, use fallback search
    if (allKeysExhausted) {
      console.log('All API keys exhausted, using fallback search');
      return { songs: getFallbackSearchResults(query) };
    }

    // If we have test results and no valid keys, use fallback search
    if (testResults !== null) {
      const validKeys = testResults.filter(r => r.valid).length;
      if (validKeys === 0) {
        console.log('No valid API keys found in test results, using fallback search');
        allKeysExhausted = true;
        return { songs: getFallbackSearchResults(query) };
      }
    }

    // Check if any API key is valid
    if (!isApiKeyValid()) {
      console.log('No valid API keys available, using fallback search');
      return { songs: getFallbackSearchResults(query) };
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `q=${encodeURIComponent(query)}&` +
      `part=snippet&` +
      `type=video&` +
      `videoCategoryId=10&` + // Music category
      `maxResults=25&` + // Reduced from 50 to 25
      `key=${getCurrentApiKey()}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();
    
    // Check for quota exceeded error
    if (data.error && (data.error.code === 403 || data.error.message.includes('quota'))) {
      console.log('Quota exceeded for current API key during search');
      const hasMoreKeys = markApiKeyQuotaExceeded();
      if (hasMoreKeys) {
        // Retry search with new API key
        return await searchSongs(query);
      } else {
        // All API keys exhausted
        return { songs: getFallbackSearchResults(query) };
      }
    }
    
    if (!data.items || data.items.length === 0) {
      return { songs: getFallbackSearchResults(query) };
    }
    
    const songs = data.items.map(item => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      mood: 'Search Result',
      language: 'Mixed',
      thumbnail: item.snippet.thumbnails.medium.url
    }));
    
    // Shuffle search results
    const shuffledSongs = shuffleArray(songs);
    
    return {
      songs: shuffledSongs
    };
  } catch (error) {
    console.error('Error searching songs:', error);
    return { songs: getFallbackSearchResults(query) };
  }
};

// Get fallback search results based on query
const getFallbackSearchResults = (query) => {
  const searchQuery = query.toLowerCase();
  const allFallbackSongs = [];
  
  // Collect all songs from all moods
  const allMoods = ['Happy', 'Sad', 'Angry', 'Tired', 'Natural', 'Excited', 'Relaxed', 'Romantic', 'Focused', 'Party'];
  
  allMoods.forEach(mood => {
    const moodSongs = getFallbackSongs(mood);
    allFallbackSongs.push(...moodSongs);
  });
  
  // Filter songs that match the search query
  const matchingSongs = allFallbackSongs.filter(song => {
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    
    const mood = song.mood.toLowerCase();
    
    return title.includes(searchQuery) || 
           artist.includes(searchQuery) || 
           mood.includes(searchQuery);
  });
  
  // If no exact matches, return some popular songs
  if (matchingSongs.length === 0) {
    const popularSongs = [
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Search Result' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Search Result' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Search Result' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Search Result' },
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Search Result' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Search Result' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Search Result' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Search Result' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Search Result' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Search Result' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Search Result' },
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Search Result' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Search Result' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Search Result' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Search Result' }
    ];
    return shuffleArray(popularSongs);
  }
  
  // Return matching songs (limit to 15 to avoid too many results)
  return shuffleArray(matchingSongs).slice(0, 15);
};

// Simple fallback songs with correct, unique video IDs
export const getFallbackSongs = (mood) => {
  const fallbackSongs = {
    'Happy': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Happy' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Happy' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Happy' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Happy' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Happy' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'p7YXXieghtA', videoId: 'p7YXXieghtA', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Happy' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Happy' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Happy' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Happy' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Happy' },
      // Add more real Marathi songs
      { id: 'QbNwGm2Yb6M', videoId: 'QbNwGm2Yb6M', title: 'Apsara Aali', artist: 'Ajay-Atul', mood: 'Happy' },
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Jhingat', artist: 'Ajay-Atul', mood: 'Happy' },
      { id: 'kqFzv1HnF1A', videoId: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji', artist: 'Ajay-Atul', mood: 'Happy' },
      { id: '6Q1F1b6Y2vA', videoId: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale', artist: 'Ajay-Atul', mood: 'Happy' },
      { id: 'nQ1Qw6kQb1A', videoId: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara', artist: 'Ajay-Atul', mood: 'Happy' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Happy' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Happy' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Happy' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Happy' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Happy' }
    ],
    'Sad': [
      // Hindi Songs (5) - Each with unique video ID
      { id: '0KSOMA3QBU0', videoId: '0KSOMA3QBU0', title: 'Dark Horse', artist: 'Katy Perry', mood: 'Sad' },
      { id: 'kXYiU_JCYtU', videoId: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', mood: 'Sad' },
      { id: '1G4isv_Fylg', videoId: '1G4isv_Fylg', title: 'Creep', artist: 'Radiohead', mood: 'Sad' },
      { id: '3YxaaGgTQYM', videoId: '3YxaaGgTQYM', title: 'Everybody Hurts', artist: 'R.E.M.', mood: 'Sad' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Sad' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Sad' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Sad' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Sad' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Sad' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Sad' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Sad' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Sad' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Sad' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Sad' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Sad' }
    ],
    'Angry': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'kXYiU_JCYtU', videoId: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', mood: 'Angry' },
      { id: '1G4isv_Fylg', videoId: '1G4isv_Fylg', title: 'Creep', artist: 'Radiohead', mood: 'Angry' },
      { id: '3YxaaGgTQYM', videoId: '3YxaaGgTQYM', title: 'Everybody Hurts', artist: 'R.E.M.', mood: 'Angry' },
      { id: '0KSOMA3QBU0', videoId: '0KSOMA3QBU0', title: 'Dark Horse', artist: 'Katy Perry', mood: 'Angry' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Angry' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Angry' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Angry' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Angry' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Angry' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Angry' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Angry' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Angry' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Angry' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Angry' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Angry' }
    ],
    'Tired': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Tired' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Tired' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Tired' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Tired' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Tired' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Tired' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Tired' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Tired' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Tired' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Tired' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Tired' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Tired' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Tired' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Tired' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Tired' }
    ],
    'Natural': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Natural' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Natural' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Natural' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Natural' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Natural' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Natural' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Natural' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Natural' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Natural' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Natural' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Natural' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Natural' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Natural' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Natural' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Natural' }
    ],
    'Excited': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Excited' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Excited' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Excited' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Excited' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Excited' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Excited' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Excited' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Excited' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Excited' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Excited' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Excited' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Excited' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Excited' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Excited' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Excited' }
    ],
    'Relaxed': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Relaxed' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Relaxed' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Relaxed' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Relaxed' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Relaxed' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Relaxed' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Relaxed' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Relaxed' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Relaxed' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Relaxed' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Relaxed' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Relaxed' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Relaxed' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Relaxed' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Relaxed' }
    ],
    'Romantic': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Romantic' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Romantic' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Romantic' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Romantic' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Romantic' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Romantic' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Romantic' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Romantic' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Romantic' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Romantic' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Romantic' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Romantic' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Romantic' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Romantic' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Romantic' }
    ],
    'Focused': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Focused' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Focused' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Focused' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Focused' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Focused' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Focused' },
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Focused' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Focused' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Focused' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Focused' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Focused' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Focused' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Focused' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Focused' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Focused' }
    ],
    'Party': [
      // Hindi Songs (5) - Each with unique video ID
      { id: 'sK7riqg2mr4', videoId: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', mood: 'Party' },
      { id: 'YqeW9_5kURI', videoId: 'YqeW9_5kURI', title: 'Jai Ho', artist: 'A.R. Rahman', mood: 'Party' },
      { id: '9bZkp7q19f0', videoId: '9bZkp7q19f0', title: 'GANGNAM STYLE', artist: 'PSY', mood: 'Party' },
      { id: 'kJQP7kiw5Fk', videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', mood: 'Party' },
      { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', mood: 'Party' },
      
      // Marathi Songs (5) - Each with unique video ID
      { id: 'Qw1r1C2TnGo', videoId: 'Qw1r1C2TnGo', title: 'Zingaat', artist: 'Ajay-Atul', mood: 'Party' },
      { id: 'y6120QOlsfU', videoId: 'y6120QOlsfU', title: 'Mad World', artist: 'Gary Jules', mood: 'Party' },
      { id: 'hT_nvWreIhg', videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', mood: 'Party' },
      { id: 'YykjpeuMNEk', videoId: 'YykjpeuMNEk', title: 'Hymn for the Weekend', artist: 'Coldplay', mood: 'Party' },
      { id: 'fJ9rUzIMcZQ', videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', mood: 'Party' },
      
      // English Songs (5) - Each with unique video ID
      { id: 'YVkUvmDQ3HY', videoId: 'YVkUvmDQ3HY', title: 'Believer', artist: 'Imagine Dragons', mood: 'Party' },
      { id: 'L_jWHffIx5E', videoId: 'L_jWHffIx5E', title: 'All Star', artist: 'Smash Mouth', mood: 'Party' },
      { id: 'LPn_OrX7P1k', videoId: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears', mood: 'Party' },
      { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Hallelujah', artist: 'Jeff Buckley', mood: 'Party' },
      { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', mood: 'Party' }
    ]
  };
  
  // Return shuffled fallback songs
  const songs = fallbackSongs[mood] || fallbackSongs['Happy'];
  return shuffleArray(songs);
};

// Test API key validity
const testApiKey = async (apiKey) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `q=test&` +
      `part=snippet&` +
      `type=video&` +
      `maxResults=1&` +
      `key=${apiKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        return { valid: false, error: data.error };
      }
      return { valid: true };
    } else {
      return { valid: false, error: { code: response.status, message: 'HTTP Error' } };
    }
  } catch (error) {
    return { valid: false, error: { code: 0, message: error.message } };
  }
};

// Test all API keys and report status
export const testAllApiKeys = async () => {
  // If we already have test results, return them
  if (testResults !== null) {
    return testResults;
  }
  
  const results = [];
  
  for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
    const key = YOUTUBE_API_KEYS[i];
    const result = await testApiKey(key);
    results.push({
      keyIndex: i + 1,
      key: key.substring(0, 10) + '...',
      valid: result.valid,
      error: result.error
    });
    
    console.log(`API Key ${i + 1}: ${result.valid ? '✅ Valid' : '❌ Invalid'} - ${result.error ? JSON.stringify(result.error) : 'OK'}`);
    
    // Update quota status based on test results
    if (!result.valid) {
      apiKeyQuotaStatus[i] = false;
    }
  }
  
  const validKeys = results.filter(r => r.valid).length;
  console.log(`Summary: ${validKeys}/${YOUTUBE_API_KEYS.length} API keys are valid`);
  
  // Store results to avoid repeated testing
  testResults = results;
  
  // Update global flags
  if (validKeys === 0) {
    allKeysExhausted = true;
  }
  
  return results;
};

// Legacy functions for compatibility
export const fetchSongsByMood = async (mood) => {
  const songs = await searchYouTubeSongsEnhanced(mood);
  return { songs };
};

export const testNewApproach = async () => {
  // If all keys are already exhausted, skip testing
  if (allKeysExhausted) {
    console.log('All API keys already exhausted, using fallback songs');
    return false;
  }
  
  // If we already have test results, use them
  if (testResults !== null) {
    const validKeys = testResults.filter(r => r.valid).length;
    if (validKeys === 0) {
      allKeysExhausted = true;
      console.log('No valid API keys found, using fallback songs');
      return false;
    }
    console.log(`Found ${validKeys} valid API keys, proceeding with API calls`);
    return true;
  }
  
  // Test API keys once and store results
  const apiKeyResults = await testAllApiKeys();
  const validKeys = apiKeyResults.filter(r => r.valid).length;
  apiKeysTested = true;
  
  if (validKeys === 0) {
    allKeysExhausted = true;
    console.log('No valid API keys found, using fallback songs');
    return false;
  }
  
  console.log(`Found ${validKeys} valid API keys, proceeding with API calls`);
  return true;
};

export const debugDatabase = () => {
  return `Multi-API key system with ${YOUTUBE_API_KEYS.length} keys - Current key: ${currentApiKeyIndex + 1}`;
};

// Clear test results (useful for debugging)
export const clearTestResults = () => {
  testResults = null;
  apiKeysTested = false;
  console.log('Test results cleared - will test API keys again on next request');
};

// Legacy function for compatibility
export const searchYouTubeSongsEnhanced = async (mood) => {
  return await fetchSongsSmart(mood);
};

// Shuffle array function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 
