import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Signup.module.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  // Check for extra path segments (e.g., /signup/anything)
  const isInvalidRoute = location.pathname !== '/signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      setShowDialog(true);
      setTimeout(() => {
        setShowDialog(false);
        navigate('/login');
      }, 1800);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.bgWrap}>
      <div className={styles.logoBox}>
        <FaMusic className={styles.icon} />
        <span className={styles.appName}>Moodify</span>
      </div>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.35 }}
      >
        <motion.form
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: 'spring', bounce: 0.3 }}
        >
          <h2 className={styles.title}>Join Moodify</h2>
          {isInvalidRoute && (
            <div className={styles.error} style={{ marginBottom: '1.2rem' }}>
              Invalid signup route. Please check the URL.
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={styles.input}
          />
          <motion.button
            type="submit"
            className={styles.button}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>
          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <AnimatePresence>
            {showDialog && (
              <div className={styles.dialog}>
                <span role="img" aria-label="music" style={{ fontSize: '2rem' }}>🎵</span>
                <div className={styles.dialogText}>Welcome to <b>Moodify</b>!</div>
              </div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Signup; 