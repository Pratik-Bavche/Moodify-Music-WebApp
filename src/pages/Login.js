import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showUserNotFoundDialog, setShowUserNotFoundDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for extra path segments (e.g., /login/anything)
  const isInvalidRoute = location.pathname !== '/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      setShowDialog(true);
      setTimeout(() => {
        setShowDialog(false);
        navigate('/dashboard');
      }, 1800);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        setShowUserNotFoundDialog(true);
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setShowUserNotFoundDialog(false);
    navigate('/signup');
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
          <h2 className={styles.title}>Login to Moodify</h2>
          {isInvalidRoute && (
            <div className={styles.error} style={{ marginBottom: '1.2rem' }}>
              Invalid login route. Please check the URL.
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
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
          <motion.button
            type="submit"
            className={styles.button}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
          <p className={styles.switchText}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <AnimatePresence>
            {showDialog && (
              <div className={styles.dialog}>
                <span role="img" aria-label="music" style={{ fontSize: '2rem' }}>🎵</span>
                <div className={styles.dialogText}>Welcome to <b>Moodify</b>!</div>
              </div>
            )}
            {showUserNotFoundDialog && (
              <div className={styles.userNotFoundDialog}>
                <FaUserPlus style={{ fontSize: '2rem', color: '#764ba2', marginBottom: '1rem' }} />
                <div className={styles.dialogText}>Account not found!</div>
                <div className={styles.dialogSubtext}>Create an account first to continue</div>
                <button
                  onClick={handleCreateAccount}
                  className={styles.createAccountBtn}
                >
                  Create Account
                </button>
              </div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login; 