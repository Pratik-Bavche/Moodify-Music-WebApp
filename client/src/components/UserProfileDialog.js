import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaCamera, FaSignOutAlt, FaTimes, FaHeart, FaEnvelope, FaUserCircle, FaTrash } from 'react-icons/fa';
import { compressImage, validateImageFile, safeLocalStorageSet } from '../utils/imageCompression';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/UserProfileDialog.module.css';

const UserProfileDialog = ({ isOpen, onClose, isNightMode, onProfileUpdate }) => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState({
    username: currentUser?.username || localStorage.getItem('userName') || 'Music Lover',
    email: currentUser?.email || 'user@moodify.com',
    profilePicture: null,
    favorites: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '' });

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, currentUser]); // Refresh when user changes

  const loadUserData = () => {
    const username = currentUser?.username || localStorage.getItem('userName') || 'Music Lover';
    const email = currentUser?.email || localStorage.getItem('userEmail') || 'user@moodify.com';
    const profilePic = localStorage.getItem('userProfilePicture');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    setUserData({ username, email, profilePicture: profilePic, favorites });
    setEditData({ username, email });
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validate file size
        if (!validateImageFile(file)) {
          alert('Image size should be less than 5MB. Please choose a smaller image.');
          return;
        }
        
        const compressedImage = await compressImage(file);
        
        // Try to save to localStorage
        if (safeLocalStorageSet('userProfilePicture', compressedImage)) {
          setUserData(prev => ({ ...prev, profilePicture: compressedImage }));
          // Notify parent component about profile update
          if (onProfileUpdate) {
            onProfileUpdate(compressedImage);
          }
        } else {
          alert('Storage limit exceeded. Please remove some data or choose a smaller image.');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again.');
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    try {
      localStorage.removeItem('userProfilePicture');
      setUserData(prev => ({ ...prev, profilePicture: null }));
      // Notify parent component about profile update
      if (onProfileUpdate) {
        onProfileUpdate(null);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleSaveEdit = () => {
    localStorage.setItem('userName', editData.username);
    localStorage.setItem('userEmail', editData.email);
    setUserData(prev => ({ ...prev, username: editData.username, email: editData.email }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({ username: userData.username, email: userData.email });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
    // Navigate to login page
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.dialog} ${isNightMode ? styles.nightMode : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>User Profile</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.profilePictureContainer}>
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  className={styles.profilePicture}
                />
              ) : (
                <div className={styles.defaultProfilePicture}>
                  <FaUserCircle size={80} />
                </div>
              )}
              <label className={styles.cameraButton}>
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </label>
              {userData.profilePicture && (
                <button 
                  className={styles.removeButton}
                  onClick={handleRemoveProfilePicture}
                  title="Remove profile picture"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <div className={styles.userInfo}>
              {isEditing ? (
                <div className={styles.editForm}>
                  <div className={styles.inputGroup}>
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.editButtons}>
                    <button onClick={handleSaveEdit} className={styles.saveBtn}>
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.infoDisplay}>
                  <div className={styles.infoRow}>
                    <FaUser className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Name:</span>
                    <span className={styles.infoValue}>{userData.username}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <FaEnvelope className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{userData.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <FaHeart className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Favorite Songs:</span>
                    <span className={styles.infoValue}>{userData.favorites.length}</span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className={styles.editBtn}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDialog; 