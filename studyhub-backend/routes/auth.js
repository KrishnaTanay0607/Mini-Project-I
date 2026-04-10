const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function makeToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
}

function userObj(u) {
  return {
    _id:        u._id,
    name:       u.name,
    email:      u.email,
    avatar:     u.avatar,
    bio:        u.bio,
    friendCode: u.friendCode,
    createdAt:  u.createdAt
  };
}

// POST /api/auth/register
router.post('/register', async function (req, res) {
  try {
    var name     = req.body.name;
    var email    = req.body.email;
    var password = req.body.password;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    var existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    var user = await User.create({ name: name, email: email, password: password });
    res.status(201).json({ token: makeToken(user._id), user: userObj(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async function (req, res) {
  try {
    var email    = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    var user = await User.findOne({ email: email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: makeToken(user._id), user: userObj(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, function (req, res) {
  res.json({ user: userObj(req.user) });
});

// PUT /api/auth/profile
router.put('/profile', protect, async function (req, res) {
  try {
    var name = String(req.body.name || '').trim();
    var bio  = String(req.body.bio  || '').trim();
    if (!name) return res.status(400).json({ message: 'Name is required' });
    var user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name, bio: bio },
      { new: true }
    );
    res.json({ user: userObj(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async function (req, res) {
  try {
    var oldPw = req.body.oldPassword;
    var newPw = req.body.newPassword;
    if (!oldPw || !newPw) return res.status(400).json({ message: 'Both fields required' });
    if (newPw.length < 6)  return res.status(400).json({ message: 'New password min 6 chars' });
    var user = await User.findById(req.user._id);
    var ok   = await user.matchPassword(oldPw);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPw;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
