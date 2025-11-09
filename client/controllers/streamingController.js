const youtubeService = require('../services/youtubeService');

// Search for songs by mood or keyword
exports.searchSongs = async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const songs = await youtubeService.searchSongs(query, parseInt(maxResults));
    if (Array.isArray(songs) && songs.length > 0) {
      return res.json({
        success: true,
        data: songs,
        query: query,
        count: songs.length
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No songs found',
        data: []
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to search songs',
      error: error.message 
    });
  }
};

// Get stream URL for a specific video
exports.getStreamUrl = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    const streamData = await youtubeService.getStreamUrl(videoId);
    res.json({
      success: true,
      data: streamData
    });
  } catch (error) {
    console.error('Stream URL error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get stream URL',
      error: error.message 
    });
  }
};

// Get video details
exports.getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    const details = await youtubeService.getVideoDetails(videoId);
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Video details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get video details',
      error: error.message 
    });
  }
};

// Get trending songs by mood
exports.getTrendingByMood = async (req, res) => {
  try {
    const { mood, maxResults = 10 } = req.query;
    
    if (!mood) {
      return res.status(400).json({ message: 'Mood parameter is required' });
    }

    const songs = await youtubeService.getTrendingByMood(mood, parseInt(maxResults));
    res.json({
      success: true,
      data: songs,
      mood: mood,
      count: songs.length
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get trending songs',
      error: error.message 
    });
  }
};

// Get available moods
exports.getAvailableMoods = async (req, res) => {
  try {
    const moods = [
      { id: 'happy', name: 'Happy', emoji: '😊', description: 'Upbeat and positive vibes' },
      { id: 'sad', name: 'Sad', emoji: '😢', description: 'Melancholic and emotional' },
      { id: 'energetic', name: 'Energetic', emoji: '⚡', description: 'High energy and pump up' },
      { id: 'calm', name: 'Calm', emoji: '😌', description: 'Relaxing and peaceful' },
      { id: 'romantic', name: 'Romantic', emoji: '💕', description: 'Love and romance' },
      { id: 'nostalgic', name: 'Nostalgic', emoji: '🕰️', description: 'Throwback and classic' },
      { id: 'focused', name: 'Focused', emoji: '🎯', description: 'Study and concentration' },
      { id: 'party', name: 'Party', emoji: '🎉', description: 'Dance and celebration' }
    ];

    res.json({
      success: true,
      data: moods
    });
  } catch (error) {
    console.error('Moods error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get moods',
      error: error.message 
    });
  }
}; 