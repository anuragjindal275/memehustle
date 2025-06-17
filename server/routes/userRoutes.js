import express from 'express';
import { getUsers, getUserById, updateUserCredits } from '../database/dbUtils.js';

const router = express.Router();

// Get all users (for mock authentication)
router.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user credits
router.patch('/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;
    
    if (credits === undefined) {
      return res.status(400).json({ error: 'Credits amount is required' });
    }
    
    const updatedUser = await updateUserCredits(id, credits);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user credits:', error);
    res.status(500).json({ error: 'Failed to update user credits' });
  }
});

export default router;
