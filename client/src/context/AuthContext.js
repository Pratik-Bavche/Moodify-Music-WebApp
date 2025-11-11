import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage when app starts
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');

    if (data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ✅ expose the missing fields
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
