const express = require('express');
const router = express.Router();
const streamingController = require('../controllers/streamingController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/search', streamingController.searchSongs);
router.get('/moods', streamingController.getAvailableMoods);
router.get('/trending', streamingController.getTrendingByMood);
router.get('/details/:videoId', streamingController.getVideoDetails);

// Protected routes (authentication required)
router.get('/stream/:videoId', authMiddleware, streamingController.getStreamUrl);

module.exports = router; 