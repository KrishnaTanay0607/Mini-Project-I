const express  = require('express');
const Message  = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/:groupId - last 50 messages
router.get('/:groupId', protect, async function (req, res) {
  try {
    var messages = await Message
      .find({ groupId: req.params.groupId })
      .populate('sender', 'name friendCode')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json({ messages: messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
