import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Player.module.css';

const ScrollingText = ({ text, className }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [text]);

  if (!shouldScroll) {
    return (
      <div className={className} ref={containerRef}>
        <span ref={textRef}>{text}</span>
      </div>
    );
  }

  return (
    <div className={`${className} ${styles.scrollingContainer}`} ref={containerRef}>
      <span className={styles.scrollingText} ref={textRef} data-text={text}>
        {text}
      </span>
    </div>
  );
};

export default ScrollingText; 