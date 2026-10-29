import { DUKA_COLLECTION, typesenseClient } from '../config/typesense.js';

const COLLECTION_NAME = DUKA_COLLECTION;

function parsePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePerPage(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function escapeFilterValue(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'All') return null;
  return trimmed.replace(/[`\\]/g, '');
}

/**
 * Search proxy for mobile clients. Keeps the Typesense admin key on the server
 * and exposes a stable JSON contract instead of the raw Typesense host.
 */
export async function searchItems(req, res) {
  const query = String(req.query.q ?? req.query.query ?? '').trim();
  const page = parsePage(req.query.page, 1);
  const perPage = parsePerPage(req.query.per_page, 20, 100);

  const filterConditions = [];
  const category = escapeFilterValue(req.query.category);
  const market = escapeFilterValue(req.query.market ?? req.query.market_location);

  if (category) filterConditions.push(`category:=\`${category}\``);
  if (market) filterConditions.push(`market_location:=\`${market}\``);

  const searchParameters = {
    q: query === '' ? '*' : query,
    query_by: 'name,category,vendor_name,market_location,description',
    query_by_weights: '5,2,3,3,1',
    num_typos: 2,
    typo_tokens_threshold: 1,
    drop_tokens_threshold: 1,
    facet_by: 'category,market_location',
    max_facet_values: 20,
    highlight_fields: 'name',
    per_page: perPage,
    page,
    sort_by: query === ''
      ? 'price_ugx:asc'
      : '_text_match:desc,price_ugx:asc',
  };

  if (filterConditions.length > 0) {
    searchParameters.filter_by = filterConditions.join(' && ');
  }

  try {
    const result = await typesenseClient
      .collections(COLLECTION_NAME)
      .documents()
      .search(searchParameters);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error searching items:', error);
    return res.status(503).json({
      success: false,
      error: 'Search index is unavailable. Please try again shortly.',
    });
  }
}
