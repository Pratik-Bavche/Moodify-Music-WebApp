import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/WebcamModal.module.css';
import * as faceapi from 'face-api.js';

const expressionToMood = {
  happy: 'Happy',
  neutral: 'Natural',
  sad: 'Sad',
  angry: 'Angry',
  surprised: 'Happy', // treat surprise as happy
  fearful: 'Tired',
  disgusted: 'Angry',
};

const WebcamModal = ({ open, onClose, onDetect }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;
    let interval;
    async function setup() {
      setLoading(true);
      setError('');
      setDetectedMood(null);
      
      try {
        // Try to load models from CDN if local models are not available
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
          await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        } catch (modelError) {
          console.log('Local models not found, trying CDN...');
          await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
          await faceapi.nets.faceExpressionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        }
        
        // Try to access webcam
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (webcamError) {
          throw new Error('Webcam access denied or not available');
        }
        
        setLoading(false);
        
        // Start detection loop
        interval = setInterval(async () => {
          if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2) {
            try {
              const result = await faceapi.detectSingleFace(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
              ).withFaceExpressions();
              
              if (result && result.expressions) {
                const sorted = Object.entries(result.expressions).sort((a, b) => b[1] - a[1]);
                const topExpression = sorted[0][0];
                const mood = expressionToMood[topExpression] || 'Neutral';
                setDetectedMood(mood);
                
                if (onDetect) {
                  setTimeout(() => {
                    onDetect(mood);
                    onClose();
                  }, 1200);
                }
              }
            } catch (detectionError) {
              console.log('Detection error:', detectionError);
              // Continue trying without showing error to user
            }
          }
        }, 700);
        
      } catch (err) {
        console.error('Setup error:', err);
        if (err.message.includes('Webcam')) {
          setError('Webcam access denied. Please allow camera permissions and try again.');
        } else if (err.message.includes('models') || err.message.includes('load')) {
          setError('AI models could not be loaded. Please check your internet connection and try again.');
        } else {
          setError('Could not access webcam or load models. Please try again later.');
        }
        setLoading(false);
      }
    }
    
    if (open) {
      setup();
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, onDetect, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>Webcam Mood Detection</h2>
        <video ref={videoRef} autoPlay playsInline className={styles.video} />
        {loading && <div className={styles.placeholder}>Loading models and webcam...</div>}
        {error && <div className={styles.placeholder} style={{ color: 'red' }}>{error}</div>}
        {detectedMood && !loading && !error && (
          <div className={styles.detectedMood}>Detected Mood: <b>{detectedMood}</b></div>
        )}
        {!detectedMood && !loading && !error && (
          <div className={styles.placeholder}>Look at the camera to detect your mood...</div>
        )}
      </div>
    </div>
  );
};

export default WebcamModal; 