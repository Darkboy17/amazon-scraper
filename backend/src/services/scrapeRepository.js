import { PROXY_SCRAPE_LIMIT } from '../config/env.js';
import { supabaseAdmin } from '../database/supabaseClient.js';

function mapProfileRow(row) {
  if (!row) {
    return null;
  }

  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    updatedAt: row.updated_at,
    lastSeenAt: row.last_seen_at,
  };
}

export function mapScrapeRow(row) {
  return {
    id: row.id,
    keyword: row.keyword,
    useProxy: row.use_proxy,
    resultCount: row.result_count,
    durationMs: row.duration_ms,
    products: row.products,
    createdAt: row.created_at,
  };
}

/**
 * Reads the authenticated dashboard snapshot in one place to keep route code thin.
 */
export async function loadUserWorkspace(user) {
  const [
    { data: profile, error: profileError },
    { data: scrapes, error: scrapesError, count },
    proxyUsage,
  ] = await Promise.all([
    supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.uid)
      .maybeSingle(),
    supabaseAdmin
      .from('scrapes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })
      .limit(6),
    getProxyUsage(user.uid),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (scrapesError) {
    throw scrapesError;
  }

  return {
    user: mapProfileRow(profile) || user,
    recentScrapes: (scrapes || []).map(mapScrapeRow),
    recentScrapeCount: count || 0,
    proxyQuota: proxyUsage,
  };
}

export async function getProxyUsage(userId) {
  const { count, error } = await supabaseAdmin
    .from('scrapes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('use_proxy', true);

  if (error) {
    throw error;
  }

  const used = count || 0;

  return {
    limit: PROXY_SCRAPE_LIMIT,
    used,
    remaining: Math.max(0, PROXY_SCRAPE_LIMIT - used),
  };
}

export async function loadScrape(userId, scrapeId) {
  const { data, error } = await supabaseAdmin
    .from('scrapes')
    .select('*')
    .eq('id', scrapeId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }

  return mapScrapeRow(data);
}

export async function saveScrape(userId, scrape) {
  const { data, error } = await supabaseAdmin
    .from('scrapes')
    .insert({
      user_id: userId,
      keyword: scrape.keyword,
      use_proxy: scrape.useProxy,
      result_count: scrape.resultCount,
      duration_ms: scrape.durationMs,
      products: scrape.products,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
