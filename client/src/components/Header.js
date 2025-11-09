import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMusic, FaHeart, FaSignOutAlt, FaMoon, FaSun, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from '../styles/Header.module.css';

const Header = ({ onNightModeToggle, isNightMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFavorites = () => {
    navigate('/favorites');
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`${styles.header} ${isNightMode ? styles.nightMode : ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.logoBox} onClick={handleHome} style={{ cursor: 'pointer' }}>
          <FaMusic className={styles.icon} />
          <span className={styles.appName}>Moodify</span>
        </div>
        
        <nav className={styles.nav}>
          <motion.button
            className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}
            onClick={handleHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome />
            <span>Home</span>
          </motion.button>
          
          <motion.button
            className={`${styles.navItem} ${isActive('/favorites') ? styles.active : ''}`}
            onClick={handleFavorites}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeart />
            <span>Favorites</span>
          </motion.button>
          
          <motion.button
            className={styles.navItem}
            onClick={onNightModeToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isNightMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
          >
            {isNightMode ? <FaSun /> : <FaMoon />}
            <span>{isNightMode ? 'Light' : 'Night'}</span>
          </motion.button>
          
          <motion.button
            className={styles.navItem}
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </motion.button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 