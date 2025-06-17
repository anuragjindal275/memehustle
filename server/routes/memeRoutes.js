import express from 'express';
import { 
  getAllMemes, 
  getMemeById, 
  createMeme, 
  updateMeme, 
  deleteMeme,
  getTopMemes,
  getMemesByTag,
  searchMemes
} from '../database/dbUtils.js';
import { generateMemeCaption, generateVibeAnalysis } from '../utils/geminiAI.js';

const router = express.Router();

// Get all memes
router.get('/', async (req, res) => {
  try {
    const memes = await getAllMemes();
    res.json(memes);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// Get top memes (for leaderboard)
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topMemes = await getTopMemes(limit);
    res.json(topMemes);
  } catch (error) {
    console.error('Error fetching top memes:', error);
    res.status(500).json({ error: 'Failed to fetch top memes' });
  }
});

// Get memes by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const memes = await getMemesByTag(tag);
    res.json(memes);
  } catch (error) {
    console.error('Error fetching memes by tag:', error);
    res.status(500).json({ error: 'Failed to fetch memes by tag' });
  }
});

// Search memes
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const memes = await searchMemes(query);
    res.json(memes);
  } catch (error) {
    console.error('Error searching memes:', error);
    res.status(500).json({ error: 'Failed to search memes' });
  }
});

// Get a specific meme
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meme = await getMemeById(id);
    
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    
    res.json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ error: 'Failed to fetch meme' });
  }
});

// Create a new meme
router.post('/', async (req, res) => {
  try {
    const { title, image_url, tags, owner_id } = req.body;
    
    if (!title || !image_url || !Array.isArray(tags) || !owner_id) {
      return res.status(400).json({ error: 'Title, image URL, tags array, and owner ID are required' });
    }
    
    // Generate AI caption and vibe analysis
    const caption = await generateMemeCaption(title, tags);
    const vibe_analysis = await generateVibeAnalysis(title, tags);
    
    const memeData = {
      title,
      image_url,
      tags,
      owner_id,
      caption,
      vibe_analysis,
      upvotes: 0,
      downvotes: 0
    };
    
    const newMeme = await createMeme(memeData);
    res.status(201).json(newMeme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

// Update a meme
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, tags } = req.body;
    
    if (!title && !image_url && !tags) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    
    const memeData = {};
    if (title) memeData.title = title;
    if (image_url) memeData.image_url = image_url;
    if (tags) memeData.tags = tags;
    
    // Re-generate AI caption and vibe if the title or tags were updated
    if (title || tags) {
      const currentMeme = await getMemeById(id);
      const finalTitle = title || currentMeme.title;
      const finalTags = tags || currentMeme.tags;
      
      memeData.caption = await generateMemeCaption(finalTitle, finalTags);
      memeData.vibe_analysis = await generateVibeAnalysis(finalTitle, finalTags);
    }
    
    memeData.updated_at = new Date();
    
    const updatedMeme = await updateMeme(id, memeData);
    
    if (!updatedMeme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    
    res.json(updatedMeme);
  } catch (error) {
    console.error('Error updating meme:', error);
    res.status(500).json({ error: 'Failed to update meme' });
  }
});

// Delete a meme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await deleteMeme(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

export default router;
