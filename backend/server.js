require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const policeAuthRoutes = require('./src/routes/policeAuthRoutes');
const adminAuthRoutes = require('./src/routes/adminAuthRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const policeProfileRoutes = require('./src/routes/policeProfileRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const reportToAdminRoutes = require('./src/routes/reportToAdminRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const socialShareRoutes = require('./src/routes/socialShareRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware - CORS must come before other middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session store configuration
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  touchAfter: 24 * 3600 // lazy session update (in seconds)
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/police', policeAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profile/police', policeProfileRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/report-to-admin', reportToAdminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/social-share', socialShareRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Socket.IO connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate and register user
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user-typing', { userId });
  });

  socket.on('stop-typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user-stop-typing', { userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make connectedUsers available globally for chat controller
global.connectedUsers = connectedUsers;
global.io = io;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown - Clear all sessions when server stops
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Clear all sessions from the database using direct MongoDB connection
    console.log('Clearing all sessions from database...');

    const db = mongoose.connection.db;
    if (db) {
      const sessionsCollection = db.collection('sessions');
      const result = await sessionsCollection.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} session(s) from database.`);
    } else {
      console.log('⚠ Database connection not available, skipping session cleanup.');
    }

    // Close server
    server.close(async () => {
      console.log('✓ Server closed.');

      // Close database connection (no callback in newer Mongoose)
      try {
        await mongoose.connection.close();
        console.log('✓ MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('✗ Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('⚠ Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('✗ Error during shutdown:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});