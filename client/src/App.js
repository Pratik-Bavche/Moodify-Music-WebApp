import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SongsPage from './pages/SongsPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    // Load night mode preference from localStorage
    const savedNightMode = localStorage.getItem('nightMode');
    if (savedNightMode) {
      setIsNightMode(JSON.parse(savedNightMode));
    }
  }, []);

  const toggleNightMode = () => {
    const newNightMode = !isNightMode;
    setIsNightMode(newNightMode);
    localStorage.setItem('nightMode', JSON.stringify(newNightMode));
  };

  return (
    <AuthProvider>
      <Router>
        <div className={isNightMode ? 'night-mode' : ''}>
          <Routes>
            <Route path="/login" element={<Login isNightMode={isNightMode} onNightModeToggle={toggleNightMode} />} />
            <Route path="/signup" element={<Signup isNightMode={isNightMode} onNightModeToggle={toggleNightMode} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard isNightMode={isNightMode} onNightModeToggle={toggleNightMode} />
              </ProtectedRoute>
            } />
            <Route path="/songs" element={
              <ProtectedRoute>
                <SongsPage isNightMode={isNightMode} onNightModeToggle={toggleNightMode} />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesPage isNightMode={isNightMode} onNightModeToggle={toggleNightMode} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
