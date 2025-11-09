import React from 'react';
import styles from '../styles/SongSourceBadge.module.css';

const SongSourceBadge = ({ source }) => {
  const getSourceColor = (source) => {
    const colors = {
      'Deezer': '#00C7F2',
      'Jamendo': '#FF6B35',
      'Last.fm': '#D51007',
      'Spotify': '#1DB954',
      'Demo': '#6C757D'
    };
    return colors[source] || '#6C757D';
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Deezer':
        return '🎵';
      case 'Jamendo':
        return '🎼';
      case 'Last.fm':
        return '📻';
      case 'Spotify':
        return '🎧';
      case 'Demo':
        return '🎤';
      default:
        return '🎵';
    }
  };

  return (
    <div 
      className={styles.badge}
      style={{ backgroundColor: getSourceColor(source) }}
    >
      <span className={styles.icon}>{getSourceIcon(source)}</span>
      <span className={styles.text}>{source}</span>
    </div>
  );
};

export default SongSourceBadge; 