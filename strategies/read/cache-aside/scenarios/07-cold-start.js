import { getProduct, stats } from '../productService.js';
import { setup, teardown } from './helpers.js';

const BATCHES = 5;
const BATCH_SIZE = 100;

await setup('Cold start: empty cache after deploy / flush / Redis restart');

for (let batch = 1; batch <= BATCHES; batch++) {
  const ids = Array.from({ length: BATCH_SIZE }, () => 1 + Math.floor(Math.random() * 100));
  const before = stats.dbReads;
  const start = performance.now();
  await Promise.all(ids.map((id) => getProduct(id, { dbDelayMs: 20 })));
  const ms = (performance.now() - start).toFixed(0);
  console.log(`batch ${batch}: ${stats.dbReads - before} DB reads, ${ms}ms`);
}

await teardown();
