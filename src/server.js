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
const Message = require('./models/Message'); 
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

// // Get messages (protected route)
// app.get('/api/messages', authMiddleware, async (req, res) => {
//   try {
//     const messages = await Message.find({ room: 'general' })
//       .populate('sender', 'username')
//       .sort({ timestamp: 1 });
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// Get messages (protected route)
app.get('/api/messages', authMiddleware, async (req, res) => {
    try {
      const room = req.query.room || 'general';
      const messages = await Message.find({ room })
        .populate('sender', 'username')
        .sort({ timestamp: 1 })
        .limit(50); // Limit to last 50 messages
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get user's chats
  app.get('/api/chats', authMiddleware, async (req, res) => {
    try {
      // This would typically come from a Chat model
      // For now, return mock data that matches your frontend
      const chats = [
        {
          id: '1',
          name: 'Team Standup',
          type: 'group',
          lastMessage: 'Great work everyone!',
          timestamp: '2 min ago',
          unread: 3,
          avatar: '👥',
          participants: ['John', 'Jane', 'Mike', 'Sarah']
        },
        {
          id: '2',
          name: 'Design Team',
          type: 'group',
          lastMessage: 'New mockups are ready',
          timestamp: '5 min ago',
          unread: 1,
          avatar: '🎨',
          participants: ['Alice', 'Bob', 'Carol']
        },
        {
          id: '3',
          name: 'John Doe',
          type: 'direct',
          lastMessage: 'See you tomorrow!',
          timestamp: '1 hour ago',
          unread: 0,
          avatar: '👤'
        }
      ];
      res.json(chats);
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