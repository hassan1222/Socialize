// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, min: 2, max: 50 },
  lastName: { type: String, required: true, min: 2, max: 50 },
  email: { type: String, required: true, unique: true, max: 50 },
  password: { type: String, required: true, min: 5 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  picturePath: { type: String, default: "" },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location: String,
  occupation: String,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
