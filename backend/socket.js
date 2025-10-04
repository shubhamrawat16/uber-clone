// backend/socket.js
const socketIo = require('socket.io');
const User = require('./models/user.model');
const Captain = require('./models/captain.model');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Save socketId for user or captain
    socket.on('join', async ({ userId, userType }) => {
      console.log(`📌 JOIN event — userType: ${userType}, userId: ${userId}, socketId: ${socket.id}`);
      try {
        if (userType === 'user') {
          await User.findByIdAndUpdate(userId, { socketId: socket.id });
          console.log(`📌 User ${userId} joined with socket ${socket.id}`);
        } else if (userType === 'captain') {
          const updatedCaptain = await Captain.findByIdAndUpdate(
            userId,
            { socketId: socket.id, isActive: true, lastSeen: new Date() },
            { new: true }
          );
          console.log(`📌 Captain joined & updated in DB:`, updatedCaptain);
        }
      } catch (err) {
        console.error('❌ join error:', err);
      }
    });

    // Update captain location
    socket.on('update-location-captain', async ({ userId, location }) => {
      console.log("📍 update-location-captain received:", { userId, location });
      try {
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
          console.warn('⚠️ Bad location data:', location);
          return;
        }

        await Captain.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat]  // GeoJSON
          },
          isActive: true,
          lastSeen: new Date()
        });
      } catch (err) {
        console.error('❌ location update error:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      await Captain.findOneAndUpdate({ socketId: socket.id }, { isActive: false });
    });
  });
}

const sendMessageToSocketId = (socketId, payload) => {
  console.log(`📤 Sending ${payload.event} to socket ${socketId}`);
  if (io) io.to(socketId).emit(payload.event, payload.data);
};

module.exports = { initializeSocket, sendMessageToSocketId };
