const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth'); // Ensure correct import

// Send a friend request
router.post('/send', auth, async (req, res) => {
  const { receiverId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const friendRequest = new FriendRequest({
      sender: req.user.id, // Use req.user.id
      receiver: receiverId
    });

    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const sentRequests = await FriendRequest.find({ sender: req.user.id });
    const receivedRequests = await FriendRequest.find({ receiver: req.user.id });

    res.status(200).json({
      sentRequests,
      receivedRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept a friend request
router.patch('/accept/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const friendRequest = await FriendRequest.findById(id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.status(200).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject a friend request
router.patch('/reject/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const friendRequest = await FriendRequest.findById(id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();
    
    res.status(200).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
