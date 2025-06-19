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
    console.log('📝 Received meme creation request');
    const { title, image, image_url, tags, owner_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!image_url && !image) {
      return res.status(400).json({ error: 'Image or image URL is required' });
    }
    
    // Prepare basic meme data
    // Make sure tags is an array
    const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
    
    // Normalize image URL
    const finalImageUrl = image_url || image;
    
    // Generate AI caption and vibe analysis
    console.log('Generating AI caption and vibe analysis...');
    let caption, vibe_analysis;
    try {
      caption = await generateMemeCaption(title, normalizedTags);
      console.log('Caption generated:', caption);
      
      vibe_analysis = await generateVibeAnalysis(title, normalizedTags);
      console.log('Vibe analysis generated:', vibe_analysis);
    } catch (aiError) {
      console.error('Error generating AI content:', aiError);
      // Continue with fallback values if AI fails
      caption = caption || "Cyberpunk vibes activated!";
      vibe_analysis = vibe_analysis || "Digital Dystopia";
    }
    
    // Create a meme object with fields that exist in the DB
    const memeData = {
      title,
      image_url: finalImageUrl,
      tags: normalizedTags,
      owner_id,
      upvotes: 0,
      downvotes: 0,
      caption, // Include caption
      vibe_analysis // Include vibe analysis
    };
    
    console.log('Creating meme with data:', JSON.stringify(memeData, null, 2));
    const newMeme = await createMeme(memeData);
    console.log('Meme created successfully:', JSON.stringify(newMeme, null, 2));
    res.status(201).json(newMeme);
  } catch (error) {
    console.error('Error creating meme - DETAILED ERROR:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
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

// Generate or regenerate caption and vibe for a meme
router.post('/:id/caption', async (req, res) => {
  try {
    const { id } = req.params;
    const meme = await getMemeById(id);
    
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    
    // Generate caption and vibe using Gemini API
    console.log('Regenerating AI caption and vibe for meme:', id);
    const tags = Array.isArray(meme.tags) ? meme.tags : meme.tags ? [meme.tags] : [];
    
    // Force new generation bypassing cache (by adding timestamp to make cache key unique)
    const uniqueTitle = meme.title + '-' + Date.now();
    
    // Generate new caption and vibe
    const caption = await generateMemeCaption(uniqueTitle, tags);
    const vibe_analysis = await generateVibeAnalysis(uniqueTitle, tags);
    
    console.log('New caption generated:', caption);
    console.log('New vibe generated:', vibe_analysis);
    
    // Update the meme with new caption and vibe
    const updatedMeme = await updateMeme(id, { caption, vibe_analysis });
    
    if (!updatedMeme) {
      return res.status(500).json({ error: 'Failed to update meme with new caption' });
    }
    
    res.json({ 
      meme: updatedMeme,
      caption,
      vibe_analysis,
      message: 'Caption and vibe updated successfully' 
    });
  } catch (error) {
    console.error('Error generating caption/vibe:', error);
    res.status(500).json({ error: 'Failed to generate caption/vibe' });
  }
});

export default router;
