const Song = require('../models/Song');

// Add a new song
exports.addSong = async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    const song = new Song({
      title,
      artist,
      url,
      user: req.userId,
    });
    await song.save();
    res.status(201).json({ message: 'Song added successfully', song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all songs for the authenticated user
exports.getSongs = async (req, res) => {
  try {
    const songs = await Song.find({ user: req.userId });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a song
exports.updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, url } = req.body;
    const song = await Song.findOne({ _id: id, user: req.userId });
    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }
    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (url) song.url = url;
    await song.save();
    res.json({ message: 'Song updated successfully', song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a song
exports.deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findOneAndDelete({ _id: id, user: req.userId });
    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 