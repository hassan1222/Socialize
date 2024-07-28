const express = require('express');
const router = express.Router();
const upload = require('../upload'); // Ensure this is correctly configured
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Signup route
router.post('/signup', upload.single('picture'), async (req, res) => {
  const { firstName, lastName, email, password, role, location, occupation } = req.body;

  console.log('Request Body:', req.body);  // Debugging line
  console.log('File Info:', req.file);      // Debugging line

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const picturePath = req.file ? req.file.path : '';

    user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      picturePath,
      location,
      occupation,
    });

    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
