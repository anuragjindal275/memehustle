import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

// Import routes
import memeRoutes from './routes/memeRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify allowed origins
    methods: ['GET', 'POST']
  }
});

// Create in-memory cache for leaderboard
const leaderboardCache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Pass Socket.io instance to request object
app.use((req, res, next) => {
  req.io = io;
  req.leaderboardCache = leaderboardCache;
  next();
});

// Routes
app.use('/api/memes', memeRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is healthy', timestamp: new Date() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`👾 WebSocket connected: ${socket.id}`);
  
  // Join rooms based on meme IDs for real-time updates
  socket.on('join_meme_room', (memeId) => {
    socket.join(`meme_${memeId}`);
    console.log(`Socket ${socket.id} joined room for meme ${memeId}`);
  });
  
  // Join leaderboard room for real-time updates
  socket.on('join_leaderboard', () => {
    socket.join('leaderboard');
    console.log(`Socket ${socket.id} joined leaderboard room`);
  });
  
  // Handle new bids
  socket.on('place_bid', (bidData) => {
    // Broadcast to everyone in the meme's room
    io.to(`meme_${bidData.meme_id}`).emit('bid_placed', bidData);
    // Also notify leaderboard viewers if necessary
    io.to('leaderboard').emit('leaderboard_update');
  });
  
  // Handle votes
  socket.on('vote', (voteData) => {
    // Broadcast to everyone in the meme's room
    io.to(`meme_${voteData.meme_id}`).emit('vote_update', voteData);
    // Also notify leaderboard viewers
    io.to('leaderboard').emit('leaderboard_update');
  });
  
  socket.on('disconnect', () => {
    console.log(`WebSocket disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔥 Cyberpunk Meme Market is LIVE!`);
});
