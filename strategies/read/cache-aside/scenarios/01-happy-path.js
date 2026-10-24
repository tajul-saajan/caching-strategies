import { getProduct, stats } from '../productService.js';
import { setup, teardown, printStats } from './helpers.js';

await setup('Happy path: first read misses, the rest hit');

for (let i = 1; i <= 5; i++) {
  const before = stats.dbReads;
  const start = performance.now();
  const product = await getProduct(1);
  const ms = (performance.now() - start).toFixed(2);
  console.log(`read ${i}: price=${product.price} (${stats.dbReads > before ? 'DB' : 'cache'}) ${ms}ms`);
}

printStats();
await teardown();
