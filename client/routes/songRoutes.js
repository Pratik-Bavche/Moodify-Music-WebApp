const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authMiddleware = require('../middleware/authMiddleware');

// Add a new song
router.post('/', authMiddleware, songController.addSong);

// Get all songs for the authenticated user
router.get('/', authMiddleware, songController.getSongs);

// Update a song
router.put('/:id', authMiddleware, songController.updateSong);

// Delete a song
router.delete('/:id', authMiddleware, songController.deleteSong);

module.exports = router; 