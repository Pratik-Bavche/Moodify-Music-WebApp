const mongoose = require('mongoose');
const config = require('./config');

// Use the unified config value so env var naming is consistent across the app
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      // mongoose >=6 no longer needs useNewUrlParser/useUnifiedTopology but leaving options
      // here is harmless for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
