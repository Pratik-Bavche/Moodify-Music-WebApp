const { google } = require('googleapis');
const ytdlp = require('yt-dlp-exec');
const axios = require('axios');
const config = require('../config/config');

// YouTube API configuration
const youtube = google.youtube({
  version: 'v3',
  auth: config.youtube.apiKey
});

// Mood-based search queries
const moodQueries = {
  happy: ['happy songs', 'upbeat music', 'feel good songs', 'positive vibes'],
  sad: ['sad songs', 'melancholic music', 'emotional songs', 'heartbreak songs'],
  energetic: ['energetic songs', 'workout music', 'high energy', 'pump up songs'],
  calm: ['calm songs', 'relaxing music', 'peaceful songs', 'ambient music'],
  romantic: ['romantic songs', 'love songs', 'romantic music', 'couple songs'],
  nostalgic: ['nostalgic songs', 'throwback music', 'classic songs', 'retro music'],
  focused: ['focus music', 'study songs', 'concentration music', 'instrumental'],
  party: ['party songs', 'dance music', 'club songs', 'celebration music']
};

class YouTubeService {
  // Search for songs by mood or keyword
  async searchSongs(query, maxResults = 10) {
    try {
      let searchQuery = query;
      
      // If it's a mood, expand it with related keywords
      if (moodQueries[query.toLowerCase()]) {
        const moodKeywords = moodQueries[query.toLowerCase()];
        searchQuery = moodKeywords[Math.floor(Math.random() * moodKeywords.length)];
      }

      // Check if YouTube API key is configured
      console.log('Current API Key:', config.youtube.apiKey);
      if (!config.youtube.apiKey || config.youtube.apiKey === 'your-youtube-api-key-here' || config.youtube.apiKey === 'AIzaSyBvOeTEsU-cXmHjvGprQ6B6H6k6J6k6J6k') {
        console.log('YouTube API key not configured, using fallback data');
        return this.getFallbackSongs(query, maxResults);
      }
      console.log('Using real YouTube API key for search');

      const response = await youtube.search.list({
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: maxResults * 3, // Fetch more to allow deduplication
        order: 'relevance'
      });
      // Deduplicate by title + artist + style (e.g., DJ, lofi, slowed)
      const seen = new Set();
      const styleKeywords = ['dj', 'remix', 'slowed', 'lofi', 'mix', 'version'];
      const deduped = [];
      for (const item of response.data.items) {
        let title = item.snippet.title.toLowerCase();
        let artist = item.snippet.channelTitle.toLowerCase();
        let style = styleKeywords.find(k => title.includes(k)) || 'original';
        let key = `${title}|${artist}|${style}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            duration: null,
            description: item.snippet.description
          });
        }
        if (deduped.length >= maxResults) break;
      }
      return deduped;
    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getFallbackSongs(query, maxResults);
    }
  }

  // Get fallback songs when YouTube API is not available
  getFallbackSongs(query, maxResults = 25) {
    const fallbackSongs = {
      'happy': [
        // English Happy Songs (5)
        { id: '9bZkp7q19f0', title: 'Happy - Pharrell Williams', artist: 'Pharrell Williams', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Can\'t Stop the Feeling! - Justin Timberlake', artist: 'Justin Timberlake', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Walking on Sunshine - Katrina & The Waves', artist: 'Katrina & The Waves', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        // Hindi Happy Songs (10)
        { id: 'hT_nvWreIhg', title: 'Uptown Funk - Mark Ronson ft. Bruno Mars', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: '5NV6Rdv1a3o', title: 'Get Lucky - Daft Punk', artist: 'Daft Punk', thumbnail: 'https://i.ytimg.com/vi/5NV6Rdv1a3o/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        // Marathi Happy Songs (10)
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' }
      ],
              'sad': [
          // English Sad Songs (5)
          { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
          { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
          { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
          { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
          { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
          // Hindi Sad Songs (10)
          { id: '0KSOMA3QBU0', title: 'Dark Horse - Katy Perry', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/0KSOMA3QBU0/mqdefault.jpg' },
          { id: 'kXYiU_JCYtU', title: 'Numb - Linkin Park', artist: 'Linkin Park', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
          { id: '1G4isv_Fylg', title: 'Creep - Radiohead', artist: 'Radiohead', thumbnail: 'https://i.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg' },
          { id: '3YxaaGgTQYM', title: 'Everybody Hurts - R.E.M.', artist: 'R.E.M.', thumbnail: 'https://i.ytimg.com/vi/3YxaaGgTQYM/mqdefault.jpg' },
          { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
          { id: '9bZkp7q19f0', title: 'GANGNAM STYLE - PSY', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
          { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
          { id: 'hT_nvWreIhg', title: 'Counting Stars - OneRepublic', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
          { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
          { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
          // Marathi Sad Songs (10)
          { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
          { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
          { id: 'hT_nvWreIhg', title: 'Counting Stars - OneRepublic', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
          { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
          { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
          { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
          { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
          { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
          { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
          { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' }
        ],
      'energetic': [
        // English Energetic Songs (5)
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Uptown Funk - Mark Ronson ft. Bruno Mars', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'Happy - Pharrell Williams', artist: 'Pharrell Williams', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Can\'t Stop the Feeling! - Justin Timberlake', artist: 'Justin Timberlake', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Walking on Sunshine - Katrina & The Waves', artist: 'Katrina & The Waves', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        // Hindi Energetic Songs (10)
        { id: '5NV6Rdv1a3o', title: 'Get Lucky - Daft Punk', artist: 'Daft Punk', thumbnail: 'https://i.ytimg.com/vi/5NV6Rdv1a3o/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        // Marathi Energetic Songs (10)
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' }
      ],
      'calm': [
        // English Calm Songs (5)
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        // Hindi Calm Songs (10)
        { id: '0KSOMA3QBU0', title: 'Dark Horse - Katy Perry', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/0KSOMA3QBU0/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Numb - Linkin Park', artist: 'Linkin Park', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        { id: '1G4isv_Fylg', title: 'Creep - Radiohead', artist: 'Radiohead', thumbnail: 'https://i.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg' },
        { id: '3YxaaGgTQYM', title: 'Everybody Hurts - R.E.M.', artist: 'R.E.M.', thumbnail: 'https://i.ytimg.com/vi/3YxaaGgTQYM/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'GANGNAM STYLE - PSY', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Counting Stars - OneRepublic', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        // Marathi Calm Songs (10)
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' },
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' }
      ],
      'romantic': [
        // English Romantic Songs (5)
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        // Hindi Romantic Songs (10)
        { id: '0KSOMA3QBU0', title: 'Dark Horse - Katy Perry', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/0KSOMA3QBU0/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Numb - Linkin Park', artist: 'Linkin Park', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        { id: '1G4isv_Fylg', title: 'Creep - Radiohead', artist: 'Radiohead', thumbnail: 'https://i.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg' },
        { id: '3YxaaGgTQYM', title: 'Everybody Hurts - R.E.M.', artist: 'R.E.M.', thumbnail: 'https://i.ytimg.com/vi/3YxaaGgTQYM/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'GANGNAM STYLE - PSY', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Counting Stars - OneRepublic', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        // Marathi Romantic Songs (10)
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' },
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' }
      ],
      'nostalgic': [
        // English Nostalgic Songs (5)
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Walking on Sunshine - Katrina & The Waves', artist: 'Katrina & The Waves', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'Happy - Pharrell Williams', artist: 'Pharrell Williams', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Can\'t Stop the Feeling! - Justin Timberlake', artist: 'Justin Timberlake', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        // Hindi Nostalgic Songs (10)
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Uptown Funk - Mark Ronson ft. Bruno Mars', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: '5NV6Rdv1a3o', title: 'Get Lucky - Daft Punk', artist: 'Daft Punk', thumbnail: 'https://i.ytimg.com/vi/5NV6Rdv1a3o/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        // Marathi Nostalgic Songs (10)
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' }
      ],
      'focused': [
        // English Focus Songs (5)
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        // Hindi Focus Songs (10)
        { id: '0KSOMA3QBU0', title: 'Dark Horse - Katy Perry', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/0KSOMA3QBU0/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Numb - Linkin Park', artist: 'Linkin Park', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        { id: '1G4isv_Fylg', title: 'Creep - Radiohead', artist: 'Radiohead', thumbnail: 'https://i.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg' },
        { id: '3YxaaGgTQYM', title: 'Everybody Hurts - R.E.M.', artist: 'R.E.M.', thumbnail: 'https://i.ytimg.com/vi/3YxaaGgTQYM/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'GANGNAM STYLE - PSY', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Counting Stars - OneRepublic', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        // Marathi Focus Songs (10)
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' },
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' }
      ],
      'party': [
        // English Party Songs (5)
        { id: 'OPf0YbXwDz0', title: 'I Gotta Feeling - The Black Eyed Peas', artist: 'The Black Eyed Peas', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXwDz0/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'Uptown Funk - Mark Ronson ft. Bruno Mars', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'Happy - Pharrell Williams', artist: 'Pharrell Williams', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Can\'t Stop the Feeling! - Justin Timberlake', artist: 'Justin Timberlake', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'kXYiU_JCYtU', title: 'Walking on Sunshine - Katrina & The Waves', artist: 'Katrina & The Waves', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
        // Hindi Party Songs (10)
        { id: '5NV6Rdv1a3o', title: 'Get Lucky - Daft Punk', artist: 'Daft Punk', thumbnail: 'https://i.ytimg.com/vi/5NV6Rdv1a3o/mqdefault.jpg' },
        { id: 'yyDUC1LUXSU', title: 'Blurred Lines - Robin Thicke', artist: 'Robin Thicke', thumbnail: 'https://i.ytimg.com/vi/yyDUC1LUXSU/mqdefault.jpg' },
        { id: 'n1a7o44WxNo', title: 'Shake It Off - Taylor Swift', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/n1a7o44WxNo/mqdefault.jpg' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'YVkUvmDQ3HY', title: 'Believer - Imagine Dragons', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/mqdefault.jpg' },
        { id: 'L_jWHffIx5E', title: 'All Star - Smash Mouth', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg' },
        { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend - Coldplay', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg' },
        { id: 'hLQl3WQQoQ0', title: 'Hallelujah - Jeff Buckley', artist: 'Jeff Buckley', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello - Adele', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        // Marathi Party Songs (10)
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        { id: 'y6120QOlsfU', title: 'Mad World - Gary Jules', artist: 'Gary Jules', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
        { id: 'LPn_OrX7P1k', title: 'Everybody Wants To Rule The World - Tears For Fears', artist: 'Tears For Fears', thumbnail: 'https://i.ytimg.com/vi/LPn_OrX7P1k/mqdefault.jpg' },
        { id: 'Qw1r1C2TnGo', title: 'Zingaat - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/Qw1r1C2TnGo/mqdefault.jpg' },
        { id: 'p7YXXieghtA', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/p7YXXieghtA/mqdefault.jpg' },
        { id: 'kqFzv1HnF1A', title: 'Sairat Zaala Ji - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/kqFzv1HnF1A/mqdefault.jpg' },
        { id: '6Q1F1b6Y2vA', title: 'Mala Ved Lagale - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/6Q1F1b6Y2vA/mqdefault.jpg' },
        { id: 'nQ1Qw6kQb1A', title: 'Wajle Ki Bara - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/nQ1Qw6kQb1A/mqdefault.jpg' },
        { id: 'QbNwGm2Yb6M', title: 'Apsara Aali - Ajay-Atul', artist: 'Ajay-Atul', thumbnail: 'https://i.ytimg.com/vi/QbNwGm2Yb6M/mqdefault.jpg' },
        { id: 'sK7riqg2mr4', title: 'Chaiyya Chaiyya - A.R. Rahman', artist: 'A.R. Rahman', thumbnail: 'https://i.ytimg.com/vi/sK7riqg2mr4/mqdefault.jpg' }
      ]
    };

    const mood = query.toLowerCase();
    const songs = fallbackSongs[mood] || fallbackSongs['happy'];
    // Language balance: 50% Hindi, 25% Marathi, 25% English
    const hindi = songs.filter(s => s.artist && (s.artist.toLowerCase().includes('ajay-atul') || s.artist.toLowerCase().includes('ar rahman') || s.artist.toLowerCase().includes('hindi')));
    const marathi = songs.filter(s => s.artist && s.artist.toLowerCase().includes('ajay-atul'));
    const english = songs.filter(s => s.artist && !s.artist.toLowerCase().includes('ajay-atul') && !s.artist.toLowerCase().includes('ar rahman') && !s.artist.toLowerCase().includes('hindi'));
    const total = Math.min(maxResults, hindi.length + marathi.length + english.length);
    const nHindi = Math.floor(total * 0.5);
    const nMarathi = Math.floor(total * 0.25);
    const nEnglish = total - nHindi - nMarathi;
    const result = [
      ...hindi.slice(0, nHindi),
      ...marathi.slice(0, nMarathi),
      ...english.slice(0, nEnglish)
    ];
    // Deduplicate by title + artist + style
    const seen = new Set();
    const styleKeywords = ['dj', 'remix', 'slowed', 'lofi', 'mix', 'version'];
    const deduped = [];
    for (const s of result) {
      let title = s.title.toLowerCase();
      let artist = s.artist.toLowerCase();
      let style = styleKeywords.find(k => title.includes(k)) || 'original';
      let key = `${title}|${artist}|${style}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(s);
      }
      if (deduped.length >= maxResults) break;
    }
    return deduped;
  }

  // Get stream URL using yt-dlp
  async getStreamUrl(videoId) {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const result = await ytdlp(videoUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      });

      // Find the best audio format
      const audioFormats = result.formats.filter(format => 
        format.acodec !== 'none' && format.vcodec === 'none'
      );

      if (audioFormats.length === 0) {
        throw new Error('No audio formats available');
      }

      // Sort by quality and get the best audio format
      const bestAudio = audioFormats.sort((a, b) => 
        (b.abr || 0) - (a.abr || 0)
      )[0];

      return {
        streamUrl: bestAudio.url,
        title: result.title,
        artist: result.uploader,
        duration: result.duration,
        thumbnail: result.thumbnail,
        format: bestAudio.format_note || 'Unknown'
      };
    } catch (error) {
      console.error('yt-dlp error:', error);
      throw new Error('Failed to get stream URL');
    }
  }

  // Get video details without streaming
  async getVideoDetails(videoId) {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const result = await ytdlp(videoUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true
      });

      return {
        id: videoId,
        title: result.title,
        artist: result.uploader,
        duration: result.duration,
        thumbnail: result.thumbnail,
        description: result.description,
        viewCount: result.view_count,
        likeCount: result.like_count
      };
    } catch (error) {
      console.error('yt-dlp details error:', error);
      throw new Error('Failed to get video details');
    }
  }

  // Get trending songs by mood
  async getTrendingByMood(mood, maxResults = 10) {
    try {
      // Check if YouTube API key is configured
      if (!config.youtube.apiKey || config.youtube.apiKey === 'your-youtube-api-key-here' || config.youtube.apiKey === 'AIzaSyBvOeTEsU-cXmHjvGprQ6B6H6k6J6k6J6k') {
        console.log('YouTube API key not configured, using fallback trending data');
        return this.getFallbackSongs(mood, maxResults);
      }

      const moodKeywords = moodQueries[mood.toLowerCase()] || [mood];
      const searchQuery = moodKeywords[Math.floor(Math.random() * moodKeywords.length)];
      
      const response = await youtube.search.list({
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: maxResults,
        order: 'viewCount', // Trending by view count
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error) {
      console.error('YouTube trending search error:', error);
      // Return fallback data instead of throwing error
      return this.getFallbackSongs(mood, maxResults);
    }
  }
}

module.exports = new YouTubeService(); 
