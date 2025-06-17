import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;
let genAI;

// Initialize NodeCache with TTL of 1 hour
const aiCache = new NodeCache({ stdTTL: 3600 });

// Fallback responses in case API fails
const FALLBACK_CAPTIONS = [
  "YOLO to the moon!",
  "When the matrix glitches just right",
  "HODL the vibes!",
  "The cyberpunk we deserve",
  "Error 404: Reality not found",
  "Hack the planet, one meme at a time",
  "Neural network overload",
  "Glitching through the metaverse"
];

const FALLBACK_VIBES = [
  "Neon Crypto Chaos",
  "Digital Wasteland Energy",
  "Terminal Hacker Aesthetic",
  "Glitch Matrix Syndrome",
  "Cyberpunk Nostalgia",
  "Night City Dreams",
  "Virtual Reality Meltdown",
  "Blockchain Fever Dream"
];

// Initialize Gemini client if API key exists
const initGemini = () => {
  if (!API_KEY) {
    console.warn('No Gemini API key found. Using fallback responses.');
    return null;
  }

  try {
    return new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
    return null;
  }
};

// Get a Gemini model
const getGeminiModel = () => {
  if (!genAI) {
    genAI = initGemini();
  }

  if (!genAI) return null;

  try {
    // Get a generative model
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error('Failed to get Gemini model:', error);
    return null;
  }
};

// Generate a caption for a meme
export const generateMemeCaption = async (title, tags) => {
  // Create a cache key from the title and tags
  const cacheKey = `caption_${title}_${tags.join('_')}`;

  // Check if we have a cached response
  const cachedCaption = aiCache.get(cacheKey);
  if (cachedCaption) {
    return cachedCaption;
  }

  const model = getGeminiModel();
  if (!model) {
    // Return a random fallback caption if the API is not available
    const randomCaption = FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
    return randomCaption;
  }

  try {
    const prompt = `Generate a funny, short (max 10 words) cyberpunk-themed caption for a meme with the title "${title}" and tags: ${tags.join(', ')}. Make it witty and internet culture relevant.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const caption = response.text().trim();
    
    // Cache the result
    aiCache.set(cacheKey, caption);
    
    return caption;
  } catch (error) {
    console.error('Error generating caption with Gemini:', error);
    // Return a random fallback caption if the API call fails
    const randomCaption = FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
    return randomCaption;
  }
};

// Generate a vibe analysis for a meme
export const generateVibeAnalysis = async (title, tags) => {
  // Create a cache key from the title and tags
  const cacheKey = `vibe_${title}_${tags.join('_')}`;

  // Check if we have a cached response
  const cachedVibe = aiCache.get(cacheKey);
  if (cachedVibe) {
    return cachedVibe;
  }

  const model = getGeminiModel();
  if (!model) {
    // Return a random fallback vibe if the API is not available
    const randomVibe = FALLBACK_VIBES[Math.floor(Math.random() * FALLBACK_VIBES.length)];
    return randomVibe;
  }

  try {
    const prompt = `Based on a meme with title "${title}" and tags: ${tags.join(', ')}, generate a short 2-3 word cyberpunk-themed vibe description (like "Neon Crypto Chaos" or "Digital Wasteland Energy"). Be creative and capture the essence of internet meme culture with a cyberpunk twist.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const vibe = response.text().trim();
    
    // Cache the result
    aiCache.set(cacheKey, vibe);
    
    return vibe;
  } catch (error) {
    console.error('Error generating vibe analysis with Gemini:', error);
    // Return a random fallback vibe if the API call fails
    const randomVibe = FALLBACK_VIBES[Math.floor(Math.random() * FALLBACK_VIBES.length)];
    return randomVibe;
  }
};
