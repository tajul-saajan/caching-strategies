import { getProduct } from '../productService.js';
import { setup, teardown, printStats } from './helpers.js';

const CONCURRENCY = 100;

await setup(`Cache stampede: ${CONCURRENCY} concurrent requests on an expired hot key`);

// Key is not in the cache (just expired). Every request misses before the first one refills it.
await Promise.all(
  Array.from({ length: CONCURRENCY }, () => getProduct(1, { dbDelayMs: 50 })),
);

printStats();
console.log(`expected 1 DB read for one key, got ${CONCURRENCY}x the load`);
await teardown();
