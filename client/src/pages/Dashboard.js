import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaMusic, FaHeart, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Player from '../components/Player';
import YouTubePlayer from '../components/YouTubePlayer';
import WebcamModal from '../components/WebcamModal';
import styles from '../styles/Dashboard.module.css';
import { searchSongs, getTrendingByMood } from '../services/streamingService';

const Dashboard = ({ isNightMode, onNightModeToggle }) => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const moods = [
    { name: 'Happy', icon: '😊' },
    { name: 'Sad', icon: '😢' },
    { name: 'Angry', icon: '😠' },
    { name: 'Tired', icon: '😴' },
    { name: 'Natural', icon: '😐' },
    { name: 'Excited', icon: '🤩' },
    { name: 'Relaxed', icon: '😌' },
    { name: 'Romantic', icon: '🥰' },
    { name: 'Focused', icon: '🤓' },
    { name: 'Party', icon: '🎉' }
  ];


  const handleWebcamDetect = (mood) => {
    setSelectedMood(mood);
    handleMoodSelect(mood);
    setWebcamOpen(false);
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    try {
      // Use new streaming service
      const result = await searchSongs(mood, 10);
      if (result.success && result.data.length > 0) {
        setRecommendedSongs(result.data);
      } else {
        // Fallback to trending songs
        const trendingResult = await getTrendingByMood(mood, 10);
        if (trendingResult.success && trendingResult.data.length > 0) {
          setRecommendedSongs(trendingResult.data);
        } else {
          setRecommendedSongs([]);
        }
      }
      setCurrentSongIndex(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error fetching songs for mood:', error);
      setRecommendedSongs([]);
    }
  };

  const handleShowSongs = () => {
    navigate('/songs', { state: { mood: selectedMood } });
  };


  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlaying(false);
  };

  const handleNextSong = () => {
    if (recommendedSongs.length > 0) {
      setCurrentSongIndex((prev) => (prev + 1) % recommendedSongs.length);
    }
  };

  const handlePrevSong = () => {
    if (recommendedSongs.length > 0) {
      setCurrentSongIndex((prev) => (prev - 1 + recommendedSongs.length) % recommendedSongs.length);
    }
  };


  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    try {
      const result = await searchSongs(query, 20);
      if (result.success && result.data.length > 0) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      setSearchResults([]);
    }
  };

  const handleShowMore = () => {
    // Navigate to songs page with search results
    navigate('/songs', { 
      state: { 
        searchQuery: searchQuery,
        searchResults: searchResults,
        fromSearch: true
      } 
    });
  };


  return (
    <div className={`${styles.bgWrap} ${isNightMode ? styles.nightMode : ''}`}>
      <Header isNightMode={isNightMode} onNightModeToggle={onNightModeToggle} />
      <WebcamModal open={webcamOpen} onClose={() => setWebcamOpen(false)} onDetect={handleWebcamDetect} />
      
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <h1 className={styles.title}>Welcome to Moodify</h1>
        <p className={styles.subtitle}>How are you feeling today?</p>
        
        <div className={styles.optionsRow}>
          <motion.button
            className={styles.webcamBtn}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWebcamOpen(true)}
          >
            <FaCamera size={28} style={{ marginRight: 10 }} />
            Auto Mood Detection
          </motion.button>
          
          <div className={styles.manualMoodBox}>
            <span className={styles.manualLabel}>Or select your mood:</span>
            <div className={styles.moodIcons}>
              {moods.map((mood) => (
                <motion.button
                  key={mood.name}
                  className={styles.moodBtn}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood.name)}
                  style={selectedMood === mood.name ? { border: '2px solid #764ba2', background: '#f3e5f5' } : {}}
                >
                  {mood.icon}
                  <span className={styles.moodName}>{mood.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {selectedMood && (
          <motion.div
            className={styles.moodSelected}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
          >
            <button 
              className={styles.closeMoodBtn}
              onClick={() => setSelectedMood(null)}
              title="Close"
            >
              <FaTimes />
            </button>
            
            <div className={styles.moodInfo}>
              <h2>You selected: <span style={{ color: '#764ba2' }}>{selectedMood}</span></h2>
              <p>Discover songs that match your mood:</p>
            </div>

            <div className={styles.songsSection}>
              <button onClick={handleShowSongs} className={styles.viewSongsBtn}>
                <FaMusic style={{ marginRight: '8px' }} />
                View Songs
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          className={styles.searchSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
        >
          <h2 className={styles.searchTitle}>Search Songs</h2>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by song title or artist..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            {searchQuery && (
              <div className={styles.searchResults}>
                {searchResults.length > 0 ? (
                  <div className={styles.searchSummary}>
                    <h3>Search Results</h3>
                    <p className={styles.resultCount}>
                      {searchResults.length} song{searchResults.length !== 1 ? 's' : ''} found for "{searchQuery}"
                    </p>
                    <button
                      onClick={handleShowMore}
                      className={styles.viewSongsBtn}
                    >
                      <FaMusic style={{ marginRight: '8px' }} />
                      View Songs
                    </button>
                  </div>
                ) : (
                  <div className={styles.searchSummary}>
                    <h3>No Results Found</h3>
                    <p className={styles.resultCount}>
                      No songs found for "{searchQuery}"
                    </p>
                    <p className={styles.suggestionText}>
                      Try searching with different keywords or browse by mood
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className={styles.featuresSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
        >
          <h2 className={styles.featuresTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <motion.div
              className={styles.featureCard}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.featureIcon}>
                <FaCamera size={32} color="#43cea2" />
              </div>
              <h3>AI Mood Scanner</h3>
              <p>Use your webcam to automatically detect your mood and get instant song recommendations</p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.featureIcon}>
                <FaMusic size={32} color="#764ba2" />
              </div>
              <h3>Real Music Library</h3>
              <p>Access millions of real songs from independent artists, perfectly matched to your mood</p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.featureIcon}>
                <FaHeart size={32} color="#e91e63" />
              </div>
              <h3>Personal Library</h3>
              <p>Create your personal collection of favorite songs and access them anytime</p>
            </motion.div>
          </div>
        </motion.div>

        {recommendedSongs.length > 0 && showPlayer && (
          <div className={styles.playerContainer}>
            {recommendedSongs[currentSongIndex] && recommendedSongs[currentSongIndex].url && recommendedSongs[currentSongIndex].url.includes('youtube.com') ? (
              <YouTubePlayer
                songs={recommendedSongs}
                currentIndex={currentSongIndex}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onNext={handleNextSong}
                onPrev={handlePrevSong}
                onClose={handleClosePlayer}
              />
            ) : (
              <Player
                songs={recommendedSongs}
                currentIndex={currentSongIndex}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onNext={handleNextSong}
                onPrev={handlePrevSong}
                onClose={handleClosePlayer}
              />
            )}
          </div>
        )}
      </motion.div>
      
      <Footer isNightMode={isNightMode} />
    </div>
  );
};

export default Dashboard; 