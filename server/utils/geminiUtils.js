const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();


const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;


const captionCache = new Map();
const vibeCache = new Map();


const FALLBACK_CAPTIONS = [
  "To the MOON!",
  "Brrr goes stonks",
  "Diamond hands activate",
  "When you buy the dip but it keeps dipping",
  "HODL. This is the way.",
  "Crypto never sleeps, neither do meme creators",
  "When your NFT finally sells",
  "POV: You just discovered meme coins",
  "Lambo soon™",
  "This meme is worth more than my portfolio"
];

const FALLBACK_VIBES = [
  "Neon Crypto Chaos",
  "Retro Stonks Vibes",
  "Cyber Meme Energy",
  "Digital Asset Punk",
  "Web3 Wavelength",
  "Metaverse Madness",
  "DeFi Dreams",
  "Blockchain Brilliance",
  "NFT Nostalgia",
  "Crypto Core"
];

/**
 * Generate a caption for a meme using Gemini API
 * @param {Object} meme - The meme object with title, tags, etc.
 * @returns {Promise<string>} The generated caption
 */
async function generateCaption(meme) {
  try {
    // Check cache first
    const cacheKey = `caption-${meme.id || JSON.stringify(meme)}`;
    if (captionCache.has(cacheKey)) {
      console.log('Using cached caption');
      return captionCache.get(cacheKey);
    }

    // If no API key or genAI not initialized, use fallback
    if (!genAI) {
      console.warn('Gemini API not initialized - using fallback caption');
      const fallback = getRandomFallback(FALLBACK_CAPTIONS);
      captionCache.set(cacheKey, fallback);
      return fallback;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro-latest' });
    
    
    const tags = meme.tags && Array.isArray(meme.tags) ? meme.tags.join(', ') : 'funny';
    const prompt = `Generate a witty, short caption for a meme with title "${meme.title || 'Untitled'}" and tags: ${tags}.
    Make it funny, internet culture-savvy, and no more than 10 words. Don't include quotes or hashtags.`;
    
   
    console.log('Calling Gemini API for caption generation');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const caption = response.text().trim();
    
    
    captionCache.set(cacheKey, caption);
    console.log('Generated caption:', caption);
    
    return caption;
  } catch (error) {
    console.error('Error generating caption with Gemini:', error);
    
    const fallback = getRandomFallback(FALLBACK_CAPTIONS);
    return fallback;
  }
}

/**
 * Generate a vibe analysis for a meme using Gemini API
 * @param {Object} meme - The meme object with title, tags, etc.
 * @returns {Promise<string>} The generated vibe
 */
async function generateVibeAnalysis(meme) {
  try {
    // Check cache first
    const cacheKey = `vibe-${meme.id || JSON.stringify(meme)}`;
    if (vibeCache.has(cacheKey)) {
      console.log('Using cached vibe analysis');
      return vibeCache.get(cacheKey);
    }

   
    if (!genAI) {
      console.warn('Gemini API not initialized - using fallback vibe');
      const fallback = getRandomFallback(FALLBACK_VIBES);
      vibeCache.set(cacheKey, fallback);
      return fallback;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro-latest' });
    
    // Build the prompt
    const tags = meme.tags && Array.isArray(meme.tags) ? meme.tags.join(', ') : 'funny';
    const prompt = `Describe the vibe of a meme with title "${meme.title || 'Untitled'}" and tags: ${tags}.
    Make it 2-3 words only, trendy and cool. Examples: "Neon Crypto Chaos", "Retro Stonks Vibes"`;
    
    // Call the API
    console.log('Calling Gemini API for vibe analysis');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const vibe = response.text().trim();
    
    // Cache the result
    vibeCache.set(cacheKey, vibe);
    console.log('Generated vibe:', vibe);
    
    return vibe;
  } catch (error) {
    console.error('Error generating vibe with Gemini:', error);
    // Use fallback on error
    const fallback = getRandomFallback(FALLBACK_VIBES);
    return fallback;
  }
}


function getRandomFallback(array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
  generateCaption,
  generateVibeAnalysis,
  FALLBACK_CAPTIONS,
  FALLBACK_VIBES
};
