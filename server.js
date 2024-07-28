const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRequestRoutes = require('./routes/friendRequests');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { auth, checkRole } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Update this according to your needs
    methods: ["GET", "POST"]
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection
const dbUri = process.env.MONGODB_URI;
if (!dbUri) {
  console.error('MongoDB URI not defined in environment variables');
  process.exit(1);
}

mongoose.connect(dbUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friendRequests', friendRequestRoutes);

// Define the Chat model
const Chat = mongoose.model("Chat", {
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// Socket.IO authentication middleware
const authenticateToken = (socket, next) => {
  const token = socket.handshake.query.token; // Adjusted to read from query
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
};

io.use(authenticateToken);

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email}`);
  
  // Join the user to a room identified by their user ID
  socket.join(socket.user.id);

  // Handle sending messages
  socket.on('sendMessage', async ({ recipientId, message }) => {
    console.log('Received sendMessage event:', { recipientId, message });

    const chatMessage = new Chat({
      sender: socket.user.id,
      recipient: recipientId,
      message,
    });

    try {
      await chatMessage.save();
      console.log('Message saved to database:', chatMessage);

      io.to(recipientId).emit('receiveMessage', {
        senderId: socket.user.id,
        message,
        time: new Date().toISOString(),
      });
      console.log('Message emitted to recipient:', recipientId);
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});

// Server listening
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
