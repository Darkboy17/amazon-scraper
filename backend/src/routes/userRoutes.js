import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { upsertUserProfile } from '../services/authService.js';
import { loadUserWorkspace } from '../services/scrapeRepository.js';

export const userRoutes = Router();

userRoutes.get('/me', authenticateUser, async (req, res) => {
  try {
    await upsertUserProfile(req.user);
    res.json(await loadUserWorkspace(req.user));
  } catch (error) {
    console.error('Failed to load user profile:', error.message);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});
