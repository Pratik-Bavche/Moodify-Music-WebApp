const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const streamingRoutes = require('./routes/streamingRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/streaming', streamingRoutes);

module.exports = app;
