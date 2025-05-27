const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const setupSocket = require('./sockets/socket');
require('./config/passport');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);

// Get messages (protected route)
app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ room: 'general' })
      .populate('sender', 'username')
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});