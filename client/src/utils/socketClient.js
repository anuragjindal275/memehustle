import { io } from 'socket.io-client';

// Create a Socket.io client with the server URL
// Use environment variable or fallback to localhost for development
const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually when needed
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Socket event listeners for debugging
socket.on('connect', () => {
  console.log('🔌 Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

// Helper function to join a meme room for real-time updates
const joinMemeRoom = (memeId) => {
  socket.emit('join_meme_room', memeId);
};

// Helper function to join leaderboard room
const joinLeaderboardRoom = () => {
  socket.emit('join_leaderboard');
};

// Helper function to handle new bids
const placeBid = (bidData) => {
  socket.emit('place_bid', bidData);
};

// Helper function to vote on a meme
const voteMeme = (voteData) => {
  socket.emit('vote', voteData);
};

export { socket, joinMemeRoom, joinLeaderboardRoom, placeBid, voteMeme };
