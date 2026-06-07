import { Router } from 'express';
import {
  refreshAuthSession,
  requireSupabase,
  signInWithPassword,
  signUpWithPassword,
} from '../services/authService.js';

export const authRoutes = Router();

authRoutes.post('/sign-in', async (req, res) => {
  if (!requireSupabase(res)) {
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    res.json(await signInWithPassword(email, password));
  } catch (error) {
    res.status(error.statusCode || 401).json({ error: error.message });
  }
});

authRoutes.post('/sign-up', async (req, res) => {
  if (!requireSupabase(res)) {
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    res.status(201).json(await signUpWithPassword(email, password));
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

authRoutes.post('/refresh', async (req, res) => {
  if (!requireSupabase(res)) {
    return;
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    res.json(await refreshAuthSession(refreshToken));
  } catch (error) {
    res.status(error.statusCode || 401).json({ error: error.message });
  }
});
