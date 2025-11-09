import React, { useState, useEffect } from 'react';
import { FaUser, FaGithub, FaLinkedin, FaTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa';
import UserProfileDialog from './UserProfileDialog';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Footer.module.css';

const Footer = ({ isNightMode }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const currentYear = new Date().getFullYear();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load user profile picture from localStorage
    const profilePic = localStorage.getItem('userProfilePicture');
    setUserProfilePicture(profilePic);
  }, [currentUser]); // Refresh when user changes

  const handleProfileClick = (e) => {
    e.preventDefault();
    setIsProfileOpen(true);
  };

  const handleProfileUpdate = (newProfilePicture) => {
    setUserProfilePicture(newProfilePicture);
  };

  return (
    <>
      <footer className={`${styles.footer} ${isNightMode ? styles.nightMode : ''}`}>
        <div className={styles.footerRow}>
          <div className={styles.links}>
            <a href="#" title="Profile" onClick={handleProfileClick}>
              {userProfilePicture ? (
                <img 
                  src={userProfilePicture} 
                  alt="Profile" 
                  className={styles.profilePicture}
                />
              ) : (
                <FaUser />
              )}
            </a>
            <a href="https://www.linkedin.com/in/pratik-bavche-b6b696325/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
            <a href="https://facebook.com/pratik_bavche_patil" target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebookF /></a>
            <a href="https://x.com/Pratik_Bavche" target="_blank" rel="noopener noreferrer" title="Twitter"><FaTwitter /></a>
            <a href="https://github.com/Pratik-Bavche" target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub /></a>
            <a href="https://instagram.com/pratik_bavche_patil" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
          </div>
          <div className={styles.copyright}>
            © {currentYear} Moodify. All rights reserved.
          </div>
        </div>
      </footer>

      <UserProfileDialog 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isNightMode={isNightMode}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default Footer; 