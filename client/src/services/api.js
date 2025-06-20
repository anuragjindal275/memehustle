import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Meme APIs
export const getMemes = () => api.get('/memes');
export const getMemeById = (id) => api.get(`/memes/${id}`);
export const getTopMemes = (limit = 10) => api.get(`/memes/top?limit=${limit}`);
export const getMemesByTag = (tag) => api.get(`/memes/tag/${tag}`);
export const searchMemes = (query) => api.get(`/memes/search?query=${query}`);
export const createMeme = (memeData) => api.post('/memes', memeData);
export const updateMeme = (id, memeData) => api.put(`/memes/${id}`, memeData);
export const deleteMeme = (id) => api.delete(`/memes/${id}`);
export const regenerateCaption = (id) => api.post(`/memes/${id}/caption`);

// Bid APIs
export const getBidsByMemeId = (memeId) => api.get(`/bids/meme/${memeId}`);
export const createBid = (bidData) => api.post('/bids', bidData);

// Vote APIs
export const voteOnMeme = (memeId, userId, voteType) => 
  api.post(`/votes/${memeId}`, { userId, voteType });

// User APIs
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUserCredits = (id, credits) => 
  api.patch(`/users/${id}/credits`, { credits });


api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);
