import { sequelize, Product } from '../../../../clients/db.js';
import { redis } from '../../../../clients/redis.js';
import { stats, resetStats } from '../productService.js';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let startedAt;

// Clear product keys and counters, and restore seed prices so every run starts the same.
export async function setup(title) {
  console.log(`\n=== ${title} ===\n`);
  resetStats();
  for await (const keys of redis.scanIterator({ MATCH: 'product:*', COUNT: 100 })) {
    if (keys.length) await redis.del(keys);
  }
  await Product.update({ price: sequelize.literal('id * 10') }, { where: {} });
  startedAt = performance.now();
}

export function printStats() {
  const { hits, misses, dbReads } = stats;
  console.log(`cache hits: ${hits}, misses: ${misses}, DB reads: ${dbReads}`);
}

export async function teardown() {
  console.log(`\ntook ${(performance.now() - startedAt).toFixed(0)}ms`);
  if (redis.isOpen) await redis.quit();
  await sequelize.close();
}
