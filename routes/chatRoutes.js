const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Fetch chat history between two users
router.get('/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const chatHistory = await Chat.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    }).sort('timestamp');
    res.json(chatHistory);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

module.exports = router;
