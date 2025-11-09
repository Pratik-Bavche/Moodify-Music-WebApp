import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaTimes, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa';
import styles from '../styles/Player.module.css';
import ScrollingText from './ScrollingText';

const YouTubePlayer = ({ songs, currentIndex, onPlay, onPause, isPlaying, onClose, onNext, onPrev }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const song = songs[currentIndex];
  const playerId = `youtube-player-${currentIndex}`;
  const [repeat, setRepeat] = useState(false);

  // Suppress YouTube postMessage errors
  useEffect(() => {
    const handleError = (event) => {
      if (event.message && event.message.includes('postMessage') && event.message.includes('target origin')) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Format time in mm:ss
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Load YouTube IFrame API once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Suppress postMessage errors from YouTube iframe
    const originalPostMessage = window.postMessage;
    window.postMessage = function(message, targetOrigin, transfer) {
      try {
        return originalPostMessage.call(this, message, targetOrigin, transfer);
      } catch (error) {
        // Suppress postMessage errors from YouTube iframe
        if (error.message && error.message.includes('postMessage')) {
          return;
        }
        throw error;
      }
    };

    return () => {
      // Restore original postMessage
      window.postMessage = originalPostMessage;
    };
  }, []);

  // Create/destroy player on song change
  useEffect(() => {
    let ytPlayer;
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    function createPlayer() {
      if (!song?.videoId && !song?.id) {
        console.warn('No video ID available for song:', song);
        return;
      }

      ytPlayer = new window.YT.Player(playerId, {
        height: '70',
        width: '200',
        videoId: song?.videoId || song?.id || '',
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: (e) => {
            console.log('YouTube player ready');
            setIsReady(true);
            setDuration(e.target.getDuration());
            try { 
              e.target.setPlaybackQuality('tiny'); 
            } catch (err) {
              console.warn('Could not set playback quality:', err);
            }
            if (isPlaying) {
              try {
                e.target.playVideo();
              } catch (err) {
                console.warn('Could not play video:', err);
              }
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlay();
              setDuration(ytPlayer.getDuration());
              if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                  try {
                    setCurrentTime(ytPlayer.getCurrentTime());
                  } catch (err) {
                    console.warn('Could not get current time:', err);
                  }
                }, 500);
              }
              try { 
                ytPlayer.setPlaybackQuality('tiny'); 
              } catch (err) {
                console.warn('Could not set playback quality:', err);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (repeat && playerRef.current) {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              } else {
                onPause();
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPause();
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event);
            onPause();
            // Automatically skip to next song on error
            if (typeof onNext === 'function') {
              onNext();
            }
          },
        },
      });
      playerRef.current = ytPlayer;
    }

    // Wait for YT API to be ready
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window[`onYouTubeIframeAPIReady_${playerId}`] = createPlayer;
      window.onYouTubeIframeAPIReady = () => {
        Object.keys(window)
          .filter((k) => k.startsWith('onYouTubeIframeAPIReady_'))
          .forEach((k) => window[k] && window[k]());
      };
    }

    return () => {
      if (ytPlayer && ytPlayer.destroy) {
        try {
          ytPlayer.destroy();
        } catch (err) {
          console.warn('Could not destroy player:', err);
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [song, currentIndex]);

  // Play/pause effect
  useEffect(() => {
    if (playerRef.current && isReady && typeof playerRef.current.playVideo === 'function') {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.warn('Could not control video playback:', err);
      }
    }
  }, [isPlaying, isReady]);

  const handlePlayPause = () => {
    if (playerRef.current && isReady && typeof playerRef.current.playVideo === 'function') {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (err) {
        console.warn('Could not control video playback:', err);
      }
    }
  };

  const handleNext = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch (err) {
        console.warn('Could not stop video:', err);
      }
    }
    onNext();
  };

  const handlePrev = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch (err) {
        console.warn('Could not stop video:', err);
      }
    }
    onPrev();
  };

  const handleClose = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch (err) {
        console.warn('Could not stop video:', err);
      }
    }
    onClose();
  };

  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (playerRef.current && isReady && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seekTo, true);
      } catch (err) {
        console.warn('Could not seek video:', err);
      }
    }
  };

  const handleProgressBarMouseDown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleProgressBarMouseUp = () => {
    if (!intervalRef.current && isPlaying && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      intervalRef.current = setInterval(() => {
        try {
          setCurrentTime(playerRef.current.getCurrentTime());
        } catch (err) {
          console.warn('Could not get current time:', err);
        }
      }, 500);
    }
  };

  const handleRepeatToggle = () => setRepeat(r => !r);

  if (!song) {
    return <div style={{textAlign: 'center', color: 'red', padding: '1rem'}}>No playable songs found. Please try a different mood or search.</div>;
  }

  return (
    <div className={styles.playerBox}>
      <div className={styles.playerHeaderRow}>
        <div className={styles.youtubePlayerContainer}>
          <div id={playerId} style={{ display: 'none' }}></div>
          <div className={styles.musicPlayerDisplay}>
            <div className={styles.musicIcon}>
              <FaPlay />
            </div>
            <div className={styles.playerVisualizer}>
              <div className={styles.visualizerBar}></div>
              <div className={styles.visualizerBar}></div>
              <div className={styles.visualizerBar}></div>
              <div className={styles.visualizerBar}></div>
              <div className={styles.visualizerBar}></div>
            </div>
          </div>
        </div>
        <div className={styles.songTitleBox}>
          <ScrollingText text={song.title} className={styles.songTitleBig} />
        </div>
      </div>
      <div className={styles.progressRow}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={handleProgressBarMouseDown}
          onMouseUp={handleProgressBarMouseUp}
          className={styles.progressBar}
        />
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>
      <div className={styles.controlsRow}>
        <button className={styles.ctrlBtn} onClick={handlePrev} disabled={!isReady}>
          <FaStepBackward />
        </button>
        <button className={styles.ctrlBtn} onClick={handlePlayPause} disabled={!isReady}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button className={styles.ctrlBtn} onClick={handleNext} disabled={!isReady}>
          <FaStepForward />
        </button>
        <button className={styles.ctrlBtn} onClick={handleRepeatToggle} title={repeat ? 'Repeat On' : 'Repeat Off'} style={{ color: repeat ? '#764ba2' : '#fff' }}>
          <FaRedo />
        </button>
      </div>
      <button className={styles.closeBtn} onClick={handleClose} title="Close Player">
        <FaTimes />
      </button>
    </div>
  );
};

export default YouTubePlayer; 