import express from 'express';
import { voteOnMeme } from '../database/dbUtils.js';

const router = express.Router();

// Vote on a meme (upvote or downvote)
router.post('/:memeId', async (req, res) => {
  try {
    const { memeId } = req.params;
    const { userId, voteType } = req.body;
    
    if (!userId || voteType === undefined) {
      return res.status(400).json({ error: 'User ID and vote type are required' });
    }
    
    // voteType should be boolean: true for upvote, false for downvote
    const boolVoteType = Boolean(voteType);
    
    // Apply the vote and get updated meme
    const updatedMeme = await voteOnMeme(memeId, userId, boolVoteType);
    
    // Return the updated meme with WebSocket notification info
    res.json({
      ...updatedMeme,
      websocket_event: 'vote_update',
      vote_type: boolVoteType ? 'upvote' : 'downvote'
    });
  } catch (error) {
    console.error('Error voting on meme:', error);
    res.status(500).json({ error: 'Failed to vote on meme' });
  }
});

export default router;
