const express = require('express');
const router = express.Router();
const streamingController = require('../controllers/streamingController');

router.get('/search', streamingController.searchSongs);
router.get('/trending', streamingController.getTrendingByMood);
router.get('/stream/:videoId', streamingController.getStreamUrl);
router.get('/details/:videoId', streamingController.getVideoDetails);
router.get('/moods', streamingController.getAvailableMoods);
router.get('/debug/apikey', streamingController.getApiKeyStatus);

module.exports = router;
