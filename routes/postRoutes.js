const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');  // Import auth middleware

// Create a new post
router.post('/create', auth, async (req, res) => {
  try {
    const { message, firstName, lastName, email, picturePath } = req.body;

    if (!message || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newPost = new Post({ message, firstName, lastName, email, picturePath });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/all', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }).populate('comments.userId', 'firstName lastName picturePath');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like a post
router.patch('/like/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have already liked this post' });
    }

    post.likes.push(userId);
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Comment on a post
// Comment on a post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({ userId, text });
    await post.save();

    // Populate the user data in comments
    const updatedPost = await Post.findById(id).populate('comments.userId', 'firstName lastName picturePath');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share a post
router.patch('/share/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
