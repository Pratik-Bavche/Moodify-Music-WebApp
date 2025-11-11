require('dotenv').config();

module.exports = {
  mongodb: {
    // Support either MONGODB_URI or legacy MONGO_URI environment variable
    uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/moodify'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || 'your-youtube-api-key-here'
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  }
}; 