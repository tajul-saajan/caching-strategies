import { Product } from '../../../clients/db.js';
import { redis } from '../../../clients/redis.js';

// Naive cache-aside: no locking, no negative caching, no TTL jitter, no error handling.
// The scenarios use it as-is to reproduce each problem from the README.

const DEFAULT_TTL_SECONDS = 60;

export const productKey = (id) => `product:${id}`;

export const stats = { hits: 0, misses: 0, dbReads: 0, dbReadsById: {} };

export function resetStats() {
  Object.assign(stats, { hits: 0, misses: 0, dbReads: 0, dbReadsById: {} });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {number} id
 * @param {object} [options]
 * @param {number} [options.ttl]       seconds the value stays in Redis
 * @param {number} [options.dbDelayMs] simulated slow query, applied between DB read and cache write
 */
export async function getProduct(id, { ttl = DEFAULT_TTL_SECONDS, dbDelayMs = 0 } = {}) {
  const cached = await redis.get(productKey(id));
  if (cached !== null) {
    stats.hits++;
    return JSON.parse(cached);
  }

  stats.misses++;
  stats.dbReads++;
  stats.dbReadsById[id] = (stats.dbReadsById[id] ?? 0) + 1;

  const product = await Product.findByPk(id, { raw: true });
  if (dbDelayMs) await sleep(dbDelayMs);

  if (product) {
    await redis.set(productKey(id), JSON.stringify(product), { EX: ttl });
  }
  return product;
}

// Write to DB, then invalidate the cached copy.
export async function updateProduct(id, fields) {
  await Product.update(fields, { where: { id } });
  await redis.del(productKey(id));
}
