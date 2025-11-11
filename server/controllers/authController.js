// In: controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const connectDB = require('../config/db');

// Register a new user
exports.register = async (req, res) => {
  try {
    // await connectDB();
    const { username, email, password } = req.body;

    // 1. Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save new user
    user = new User({
      username,
      email,
      password: hashedPassword, // Store the HASHED password
    });

    await user.save();

    // 5. Create and return a JWT token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    // console.log("error")
    // await connectDB();
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Create and return JWT
    const payload = { userId: user.id };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};