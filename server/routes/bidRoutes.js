import express from 'express';
import { 
  getBidsByMemeId, 
  createBid,
  getUserById,
  updateUserCredits,
  getMemeById
} from '../database/dbUtils.js';

const router = express.Router();

// Get all bids for a specific meme
router.get('/meme/:memeId', async (req, res) => {
  try {
    const { memeId } = req.params;
    const bids = await getBidsByMemeId(memeId);
    res.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

// Create a new bid
router.post('/', async (req, res) => {
  try {
    const { meme_id, user_id, credits } = req.body;
    
    if (!meme_id || !user_id || !credits) {
      return res.status(400).json({ error: 'Meme ID, user ID, and credits are required' });
    }
    
    if (credits <= 0) {
      return res.status(400).json({ error: 'Credits must be greater than 0' });
    }
    
    // Get the user's current credits
    const user = await getUserById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has enough credits
    if (user.credits < credits) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    
    // Get the current meme and check if the bid is higher than current bid
    const meme = await getMemeById(meme_id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    
    if (meme.current_bid >= credits) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    // Create the bid
    const bidData = { meme_id, user_id, credits };
    const newBid = await createBid(bidData);
    
    // Deduct credits from user
    await updateUserCredits(user_id, user.credits - credits);
    
    // Return the new bid with WebSocket notification info
    res.status(201).json({
      ...newBid,
      websocket_event: 'new_bid',
      meme_title: meme.title
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Failed to create bid' });
  }
});

export default router;
