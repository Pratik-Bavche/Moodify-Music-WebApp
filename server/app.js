const express = require('express');
const app = express();
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const streamingRoutes = require('./routes/streamingRoutes');

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/streaming', streamingRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: "Moodify API is running successfully 🚀" });
});

// Handle 404 for invalid API paths
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
