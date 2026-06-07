import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { fetchScraperApiAccount, isProxyAvailable } from '../services/proxyService.js';

export const proxyRoutes = Router();

proxyRoutes.get('/scraperapi/account', authenticateUser, async (req, res) => {
  try {
    res.json(await fetchScraperApiAccount());
  } catch (error) {
    console.error('Failed to fetch ScraperAPI account details:', error.message);
    res.status(503).json({ error: 'Failed to fetch ScraperAPI account details' });
  }
});

proxyRoutes.get('/check-proxy', (req, res) => {
  res.json({ proxyAvailable: isProxyAvailable() });
});
