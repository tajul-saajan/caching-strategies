import { redis } from '../../../../clients/redis.js';
import { getProduct } from '../productService.js';
import { setup, teardown } from './helpers.js';

const PAUSE_MS = 2000;

await setup('Cache unavailable / slow');

// Case A: Redis is slow. CLIENT PAUSE blocks all clients on this Redis for PAUSE_MS.
console.log('Case A: Redis slow');
const admin = redis.duplicate();
await admin.connect();
await admin.clientPause(PAUSE_MS);
let start = performance.now();
await getProduct(1);
console.log(`  request took ${(performance.now() - start).toFixed(0)}ms (DB was fine, waited on Redis)`);
await admin.quit();

// Case B: Redis is down. The naive implementation has no fallback, so the request fails.
console.log('\nCase B: Redis down');
await redis.quit();
start = performance.now();
try {
  await getProduct(1);
  console.log('  request succeeded');
} catch (err) {
  console.log(`  request FAILED: ${err.message} (DB was fine, cache outage became an app outage)`);
}

await teardown();
