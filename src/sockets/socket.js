// const Message = require('../models/Message');
// const User = require('../models/User');

// const setupSocket = (io) => {
//   io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     // Join a room
//     socket.on('join room', (room) => {
//       socket.join(room);
//       console.log(`User ${socket.id} joined room: ${room}`);
//     });

//     // Handle chat message
//     socket.on('chat message', async ({ content, room, userId }) => {
//       try {
//         const message = new Message({
//           sender: userId,
//           content,
//           room,
//         });
//         await message.save();
//         io.to(room).emit('chat message', {
//           sender: userId,
//           content,
//           timestamp: message.timestamp,
//         });
//       } catch (error) {
//         console.error('Error saving message:', error);
//       }
//     });

//     // Handle typing indicator
//     socket.on('typing', ({ room, username }) => {
//       socket.to(room).emit('typing', { username });
//     });

//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//     });
//   });
// };

// module.exports = setupSocket;

const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room
    socket.on('join room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle chat messages
    socket.on('chat message', async (data) => {
      try {
        const { content, room, userId } = data;
        
        // Save message to database
        const message = new Message({
          content,
          sender: userId,
          room: room || 'general'
        });
        
        await message.save();
        await message.populate('sender', 'username');
        
        // Emit to all users in the room
        io.to(room || 'general').emit('chat message', {
          id: message._id,
          content: message.content,
          sender: message.sender.username,
          timestamp: message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          reactions: Object.fromEntries(message.reactions)
        });
        
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { room, username } = data;
      socket.to(room).emit('typing', { username });
    });

    // Handle message reactions
    socket.on('message reaction', async (data) => {
      try {
        const { messageId, emoji, userId, room } = data;
        
        const message = await Message.findById(messageId);
        const user = await User.findById(userId);
        
        if (message && user) {
          const reactions = message.reactions || new Map();
          
          if (!reactions.has(emoji)) {
            reactions.set(emoji, []);
          }
          
          const userReactions = reactions.get(emoji);
          const userIndex = userReactions.indexOf(user.username);
          
          if (userIndex > -1) {
            // Remove reaction
            userReactions.splice(userIndex, 1);
            if (userReactions.length === 0) {
              reactions.delete(emoji);
            }
          } else {
            // Add reaction
            userReactions.push(user.username);
          }
          
          message.reactions = reactions;
          await message.save();
          
          // Emit updated reactions to room
          io.to(room).emit('reaction updated', {
            messageId,
            reactions: Object.fromEntries(reactions)
          });
        }
      } catch (error) {
        console.error('Error updating reaction:', error);
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};