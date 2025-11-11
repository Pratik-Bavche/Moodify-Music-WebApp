// In: server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const streamingRoutes = require('./routes/streamingRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// --- API Routes ---
// Use the routes you've created, prefixed with /api
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/streaming', streamingRoutes);

// --- Database Connection ---
mongoose.connect(config.mongodb.uri)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start the server only after the DB connection is successful
    const PORT = config.server.port || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Moodify API is running...');
});

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});