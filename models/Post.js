const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  message: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs
  comments: [CommentSchema], // Embedded comments
  shares: { type: Number, default: 0 },
  picturePath: { type: String } // Storing image path
});

module.exports = mongoose.model('Post', PostSchema);
