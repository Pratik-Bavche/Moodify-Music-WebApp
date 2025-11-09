import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaTimes, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa';
import styles from '../styles/Player.module.css';

const formatTime = (sec) => {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const Player = ({ songs, currentIndex, onPlay, onPause, isPlaying, onSeek, showQueue, onClose, onNext, onPrev }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repeat, setRepeat] = useState(false);
  const song = songs[currentIndex];

  // Detect if the song is a YouTube video
  const isYouTube = song && song.url && song.url.includes('youtube.com');
  const getYouTubeId = (url) => {
    const match = url.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : null;
  };

  // Audio logic for direct audio URLs
  useEffect(() => {
    if (!isYouTube && audioRef.current) {
      if (isPlaying) {
        setIsLoading(true);
        setError(null);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
            })
            .catch((error) => {
              console.error('Audio playback error:', error);
              setError('Failed to play audio. Please try again.');
              setIsLoading(false);
              onPause();
            });
        }
      } else {
        audioRef.current.pause();
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line
  }, [isPlaying, song, onPause]);

  useEffect(() => {
    if (!isYouTube && audioRef.current) {
      setCurrentTime(0);
      setDuration(audioRef.current.duration || 0);
      setError(null);
    }
  }, [song, isYouTube]);

  const handlePlayPause = () => {
    if (isYouTube) {
      // For YouTube, let the iframe controls handle play/pause
      return;
    }
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
    if (onSeek) {
      onSeek(audioRef.current.currentTime, audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleAudioLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleAudioCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleAudioError = (e) => {
    console.error('Audio error:', e);
    setError('Failed to load audio. Please try another song.');
    setIsLoading(false);
    onPause();
  };

  const handleRepeatToggle = () => setRepeat(r => !r);

  const handleAudioEnded = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onPause();
    }
  };

  return (
    <div className={styles.playerWrap}>
      <button className={styles.closeBtn} onClick={onClose} title="Close Player">
        <FaTimes />
      </button>
      <img src={song.albumArt || song.thumbnail || 'https://i.imgur.com/1bX5QH6.png'} alt={song.title} className={styles.albumArtSmall} />
      <div className={styles.songInfo}>
        <div className={styles.songTitle}>{song.title}</div>
        <div className={styles.songArtist}>{song.artist}</div>
        {error && (
          <div className={styles.errorMessage} style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </div>
        )}
        <div className={styles.progressRow}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className={styles.progressBar}
            disabled={isLoading || isYouTube}
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
        {showQueue && (
          <div className={styles.queueIndicator}>
            {currentIndex + 1} / {songs.length}
          </div>
        )}
      </div>
      {/* YouTube iframe for YouTube songs */}
      {isYouTube ? (
        <div style={{ width: '100%', margin: '10px 0' }}>
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${getYouTubeId(song.url)}?autoplay=${isPlaying ? 1 : 0}&controls=1`}
            title={song.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <audio
          ref={audioRef}
          src={song.audioUrl || song.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          preload="auto"
        />
      )}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={onPrev} disabled={isLoading}>
          <FaStepBackward />
        </button>
        <button className={styles.ctrlBtn} onClick={handlePlayPause} disabled={isLoading}>
          {isLoading ? (
            <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </button>
        <button className={styles.ctrlBtn} onClick={onNext} disabled={isLoading}>
          <FaStepForward />
        </button>
        <button className={styles.ctrlBtn} onClick={handleRepeatToggle} title={repeat ? 'Repeat On' : 'Repeat Off'} style={{ color: repeat ? '#764ba2' : '#fff' }}>
          <FaRedo />
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Player; 