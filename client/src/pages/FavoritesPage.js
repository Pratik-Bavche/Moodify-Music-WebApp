import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaHeart, FaMusic, FaTrash } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import YouTubePlayer from '../components/YouTubePlayer';
import ScrollingText from '../components/ScrollingText';
import styles from '../styles/FavoritesPage.module.css';

const FavoritesPage = ({ isNightMode, onNightModeToggle }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    const savedSongs = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    
    if (savedFavorites) {
      const favoritesList = JSON.parse(savedFavorites);
      setFavorites(favoritesList);
      
      // Use complete song data if available, otherwise create basic objects
      if (savedSongs.length > 0) {
        setFavoriteSongs(savedSongs);
      } else {
        // Fallback: Convert favorite keys back to song objects (for backward compatibility)
        const songs = favoritesList.map(favKey => {
          const [title, artist] = favKey.split('-');
          return {
            title,
            artist,
            albumArt: 'https://i.imgur.com/1bX5QH6.png', // Default album art
            audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Default audio
            mood: 'Favorite'
          };
        });
        setFavoriteSongs(songs);
      }
    }
  }, []);


  const handleNext = () => {
    if (favoriteSongs.length > 0) {
      setCurrentSongIndex((prev) => (prev + 1) % favoriteSongs.length);
    }
  };

  const handlePrev = () => {
    if (favoriteSongs.length > 0) {
      setCurrentSongIndex((prev) => (prev - 1 + favoriteSongs.length) % favoriteSongs.length);
    }
  };

  const handleSongPlay = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlaying(false);
  };

  const removeFavorite = (songTitle, songArtist) => {
    const songKey = `${songTitle}-${songArtist}`;
    const newFavorites = favorites.filter(fav => fav !== songKey);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Update favorite songs list
    const updatedSongs = favoriteSongs.filter(song => 
      !(song.title === songTitle && song.artist === songArtist)
    );
    setFavoriteSongs(updatedSongs);
    
    // Also update the complete song data storage
    localStorage.setItem('favoriteSongs', JSON.stringify(updatedSongs));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    setFavoriteSongs([]);
    localStorage.removeItem('favorites');
    localStorage.removeItem('favoriteSongs');
    setIsPlaying(false);
  };

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
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              <FaHeart style={{ color: '#e91e63', marginRight: '10px' }} />
              My Favorites
            </h1>
            <p className={styles.subtitle}>
              {favoriteSongs.length} favorite song{favoriteSongs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {favoriteSongs.length > 0 && (
            <motion.button
              className={styles.clearButton}
              onClick={clearAllFavorites}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrash />
              Clear All
            </motion.button>
          )}
        </div>

        {favoriteSongs.length > 0 && showPlayer && (
          <div className={styles.playerContainer}>
            <YouTubePlayer
              songs={favoriteSongs}
              currentIndex={currentSongIndex}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onNext={handleNext}
              onPrev={handlePrev}
              onClose={handleClosePlayer}
            />
          </div>
        )}

        {favoriteSongs.length === 0 ? (
          <div className={styles.emptyState}>
            <FaMusic size={80} color="#90a4ae" />
            <h2>No favorites yet</h2>
            <p>Start adding songs to your favorites to see them here!</p>
            <motion.button
              className={styles.browseButton}
              onClick={() => window.location.href = '/dashboard'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Songs
            </motion.button>
          </div>
        ) : (
          <div className={styles.songsContainer}>
            <div className={styles.songsList}>
              {favoriteSongs.map((song, index) => (
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
                      onClick={() => handleSongPlay(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaPlay />
                    </motion.button>
                    
                    <motion.button
                      className={styles.removeButton}
                      onClick={() => removeFavorite(song.title, song.artist)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Remove from favorites"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      <Footer isNightMode={isNightMode} />
    </div>
  );
};

export default FavoritesPage; 