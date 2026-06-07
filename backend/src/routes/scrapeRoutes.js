import { Router } from 'express';
import { SCRAPER_API_KEY } from '../config/env.js';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { upsertUserProfile } from '../services/authService.js';
import { scrapeAmazonProducts } from '../services/amazonScraperService.js';
import {
  getProxyUsage,
  loadScrape,
  saveScrape,
} from '../services/scrapeRepository.js';

export const scrapeRoutes = Router();

scrapeRoutes.get('/scrapes/:id', authenticateUser, async (req, res) => {
  try {
    res.json(await loadScrape(req.user.uid, req.params.id));
  } catch (error) {
    console.error('Failed to load scrape:', error.message);
    res.status(404).json({ error: 'Scrape run not found' });
  }
});

scrapeRoutes.get('/scrape', authenticateUser, async (req, res) => {
  const { keyword, useProxy } = req.query;
  const shouldUseProxy = useProxy === 'true';

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  if (shouldUseProxy && !SCRAPER_API_KEY) {
    return res.status(400).json({ error: 'Proxy scraping is not available' });
  }

  const startedAt = Date.now();

  try {
    await upsertUserProfile(req.user);

    if (shouldUseProxy) {
      const proxyUsage = await getProxyUsage(req.user.uid);

      if (proxyUsage.remaining <= 0) {
        return res.status(403).json({
          error: 'You are out of proxy scrape credits',
          proxyQuota: proxyUsage,
        });
      }
    }

    const products = await scrapeAmazonProducts(keyword, shouldUseProxy);

    if (!products) {
      return res.status(404).json({ error: 'No results found' });
    }

    const scrape = await saveScrape(req.user.uid, {
      keyword,
      useProxy: shouldUseProxy,
      resultCount: products.length,
      durationMs: Date.now() - startedAt,
      products: products.slice(0, 50),
    });

    res.json({
      scrapeId: scrape.id,
      resultCount: products.length,
      proxyQuota: await getProxyUsage(req.user.uid),
      products,
    });
  } catch (error) {
    console.error('Scraping failed:', error.message);
    res.status(503).json({ error: 'Failed to scrape Amazon' });
  }
});
