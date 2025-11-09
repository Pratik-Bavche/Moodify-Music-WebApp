import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaHeart, FaSpinner, FaMusic } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import YouTubePlayer from '../components/YouTubePlayer';
import ScrollingText from '../components/ScrollingText';
import styles from '../styles/SongsPage.module.css';
import { searchSongs, getTrendingByMood } from '../services/streamingService';

function deduplicateSongs(songs) {
  const seen = new Set();
  const styleKeywords = ['dj', 'remix', 'slowed', 'lofi', 'mix', 'version'];
  const deduped = [];
  for (const s of songs) {
    let title = (s.title || '').toLowerCase();
    let artist = (s.artist || '').toLowerCase();
    let style = styleKeywords.find(k => title.includes(k)) || 'original';
    let key = `${title}|${artist}|${style}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(s);
    }
  }
  return deduped;
}

function balanceLanguages(songs, minResults = 50, maxResults = 100) {
  // Pick a random number between minResults and maxResults
  const randomCount = Math.floor(Math.random() * (maxResults - minResults + 1)) + minResults;
  const hindi = songs.filter(s => s.artist && (s.artist.toLowerCase().includes('ajay-atul') || s.artist.toLowerCase().includes('ar rahman') || s.artist.toLowerCase().includes('hindi')));
  const marathi = songs.filter(s => s.artist && s.artist.toLowerCase().includes('ajay-atul'));
  const english = songs.filter(s => s.artist && !s.artist.toLowerCase().includes('ajay-atul') && !s.artist.toLowerCase().includes('ar rahman') && !s.artist.toLowerCase().includes('hindi'));
  const total = Math.min(randomCount, hindi.length + marathi.length + english.length);
  const nHindi = Math.floor(total * 0.5);
  const nMarathi = Math.floor(total * 0.25);
  const nEnglish = total - nHindi - nMarathi;
  return [
    ...hindi.slice(0, nHindi),
    ...marathi.slice(0, nMarathi),
    ...english.slice(0, nEnglish)
  ];
}

const SongsPage = ({ isNightMode, onNightModeToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mood = location.state?.mood || 'Happy';
  const searchQuery = location.state?.searchQuery;
  const searchResults = location.state?.searchResults;
  const fromSearch = location.state?.fromSearch;
  const [songsList, setSongsList] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 50;

  const loadFavorites = useCallback(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    
    try {
      if (fromSearch && searchResults) {
        // Display search results
        let deduped = deduplicateSongs(searchResults);
        setSongsList(deduped);
        setLoading(false);
      } else {
        // Use new streaming service with YouTube API + yt-dlp
        console.log(`🎵 Loading songs for mood: ${mood}`);
        
        // Try mood-based search first
        const searchResult = await searchSongs(mood, 100);
        let songs = searchResult.success && searchResult.data.length > 0 ? searchResult.data : [];
        // Deduplicate and balance languages for mood-based results
        let deduped = deduplicateSongs(songs);
        let balanced = balanceLanguages(deduped, 50, 100);
        if (balanced.length > 0) {
          setSongsList(balanced);
        } else {
          // Fallback to trending songs by mood
          console.log(`🔄 No search results, trying trending songs for mood: ${mood}`);
          const trendingResult = await getTrendingByMood(mood, 100);
          let trendingSongs = trendingResult.success && trendingResult.data.length > 0 ? trendingResult.data : [];
          let dedupedTrending = deduplicateSongs(trendingSongs);
          let balancedTrending = balanceLanguages(dedupedTrending, 50, 100);
          setSongsList(balancedTrending);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
      setSongsList([]);
      setLoading(false);
    }
  }, [mood, fromSearch, searchResults]);

  useEffect(() => {
    loadFavorites();
    loadSongs();
  }, [loadFavorites, loadSongs]);

  useEffect(() => {
    // Update displayed songs when songsList changes
    const startIndex = 0;
    const endIndex = currentPage * songsPerPage;
    setDisplayedSongs(songsList.slice(startIndex, endIndex));
  }, [songsList, currentPage]);

  const loadMoreSongs = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMoreSongs = displayedSongs.length < songsList.length;


  const handlePlaySong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlaying(false);
  };

  const handleNextSong = () => {
    if (songsList.length > 0) {
      // Remove current song if it failed to play (unplayable)
      const newSongsList = [...songsList];
      newSongsList.splice(currentSongIndex, 1);
      if (newSongsList.length === 0) {
        setSongsList([]);
        setShowPlayer(false);
        setIsPlaying(false);
        return;
      }
      setSongsList(newSongsList);
      setCurrentSongIndex((prev) => prev % newSongsList.length);
    }
  };

  const handlePrevSong = () => {
    if (songsList.length > 0) {
      // Remove current song if it failed to play (unplayable)
      const newSongsList = [...songsList];
      newSongsList.splice(currentSongIndex, 1);
      if (newSongsList.length === 0) {
        setSongsList([]);
        setShowPlayer(false);
        setIsPlaying(false);
        return;
      }
      setSongsList(newSongsList);
      setCurrentSongIndex((prev) => (prev - 1 + newSongsList.length) % newSongsList.length);
    }
  };

  const toggleFavorite = (song) => {
    const songKey = `${song.title}-${song.artist}`;
    let newFavorites;
    
    if (favorites.includes(songKey)) {
      newFavorites = favorites.filter(fav => fav !== songKey);
    } else {
      newFavorites = [...favorites, songKey];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Also store complete song data for playback
    const savedSongs = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    if (favorites.includes(songKey)) {
      // Remove from favorites
      const updatedSongs = savedSongs.filter(s => !(s.title === song.title && s.artist === song.artist));
      localStorage.setItem('favoriteSongs', JSON.stringify(updatedSongs));
    } else {
      // Add to favorites
      const updatedSongs = [...savedSongs, song];
      localStorage.setItem('favoriteSongs', JSON.stringify(updatedSongs));
    }
  };

  const isFavorite = (song) => {
    const songKey = `${song.title}-${song.artist}`;
    return favorites.includes(songKey);
  };


  if (loading) {
    return (
      <div className={`${styles.container} ${isNightMode ? styles.nightMode : ''}`}>
        <Header isNightMode={isNightMode} onNightModeToggle={onNightModeToggle} />
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading songs...</p>
        </div>
        <Footer />
      </div>
    );
  }



  if (songsList.length === 0) {
    return (
      <div className={`${styles.container} ${isNightMode ? styles.nightMode : ''}`}>
        <Header isNightMode={isNightMode} onNightModeToggle={onNightModeToggle} />
        <div className={styles.emptyState}>
          <FaMusic size={80} color="#90a4ae" />
          <h2>No songs found</h2>
          <p>{fromSearch ? `No songs found for "${searchQuery}"` : `No songs available for ${mood} mood.`}</p>
          <motion.button
            className={styles.browseButton}
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isNightMode ? styles.nightMode : ''}`}>
      <Header isNightMode={isNightMode} onNightModeToggle={onNightModeToggle} />
      
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaMusic style={{ color: '#764ba2', marginRight: '10px' }} />
            {fromSearch ? `Search Results for "${searchQuery}"` : `${mood} Songs`}
          </h1>
        </div>

        {songsList.length > 0 && showPlayer && (
          <div className={styles.playerContainer}>
            <YouTubePlayer
              songs={songsList}
              currentIndex={currentSongIndex}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onNext={handleNextSong}
              onPrev={handlePrevSong}
              onClose={handleClosePlayer}
            />
          </div>
        )}

        {displayedSongs.length === 0 ? (
          <div className={styles.emptyState}>
            <FaMusic size={80} color="#90a4ae" />
            <h2>No songs found</h2>
            <p>{fromSearch ? `No songs found for "${searchQuery}"` : `No songs available for ${mood} mood.`}</p>
            <motion.button
              className={styles.browseButton}
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        ) : (
          <div className={styles.songsContainer}>
            <div className={styles.songsList}>
              {displayedSongs.map((song, index) => (
                <motion.div
                  key={`${song.title}-${song.artist}`}
                  className={`${styles.songItem} ${currentSongIndex === index && isPlaying ? styles.playing : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={styles.songInfo}>
                    <ScrollingText text={song.title} className={styles.songTitle} />
                    <div className={styles.songArtist}>{song.artist}</div>
                    <div className={styles.songMood}>{song.mood}</div>
                  </div>
                  
                  <div className={styles.songActions}>
                    <motion.button
                      className={styles.playButton}
                      onClick={() => handlePlaySong(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentSongIndex === index && isPlaying ? <FaPause /> : <FaPlay />}
                    </motion.button>
                    
                    <motion.button
                      className={`${styles.favoriteButton} ${isFavorite(song) ? styles.favorited : ''}`}
                      onClick={() => toggleFavorite(song)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={isFavorite(song) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <FaHeart />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            {hasMoreSongs && (
              <motion.button
                className={styles.loadMoreButton}
                onClick={loadMoreSongs}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load More
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
      
      <Footer isNightMode={isNightMode} />
    </div>
  );
};

export default SongsPage; 