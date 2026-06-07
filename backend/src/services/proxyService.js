import axios from 'axios';
import { SCRAPER_API_KEY } from '../config/env.js';

export function isProxyAvailable() {
  return Boolean(SCRAPER_API_KEY);
}

/**
 * Passes ScraperAPI account details through for the authenticated dashboard.
 */
export async function fetchScraperApiAccount() {
  const response = await axios.get(`https://api.scraperapi.com/account?api_key=${SCRAPER_API_KEY}`);
  return response.data;
}
