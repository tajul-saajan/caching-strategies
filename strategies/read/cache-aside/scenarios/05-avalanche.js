import { getProduct, stats } from '../productService.js';
import { setup, teardown, sleep } from './helpers.js';

const KEYS = 100;
const TTL = 2;
const ids = Array.from({ length: KEYS }, (_, i) => i + 1);

await setup(`Cache avalanche: ${KEYS} keys warmed together with the same TTL (${TTL}s)`);

await Promise.all(ids.map((id) => getProduct(id, { ttl: TTL })));
console.log(`warm-up: ${stats.dbReads} DB reads`);

let before = stats.dbReads;
await Promise.all(ids.map((id) => getProduct(id, { ttl: TTL })));
console.log(`traffic before expiry: ${stats.dbReads - before} DB reads`);

await sleep(TTL * 1000 + 100);

before = stats.dbReads;
await Promise.all(ids.map((id) => getProduct(id, { ttl: TTL })));
console.log(`traffic right after expiry: ${stats.dbReads - before} DB reads (all keys expired at once)`);

await teardown();
