const Message = require('../models/Message');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room
    socket.on('join room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle chat message
    socket.on('chat message', async ({ content, room, userId }) => {
      try {
        const message = new Message({
          sender: userId,
          content,
          room,
        });
        await message.save();
        io.to(room).emit('chat message', {
          sender: userId,
          content,
          timestamp: message.timestamp,
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ room, username }) => {
      socket.to(room).emit('typing', { username });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;