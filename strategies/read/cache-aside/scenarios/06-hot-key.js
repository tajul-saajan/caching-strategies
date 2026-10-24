import { getProduct, stats } from '../productService.js';
import { setup, teardown, sleep } from './helpers.js';

const WAVES = 10;
const REQUESTS_PER_WAVE = 100;
const HOT_ID = 1;
const HOT_SHARE = 0.9;
const TTL = 1;

await setup(`Hot key: ${HOT_SHARE * 100}% of traffic on product ${HOT_ID}, TTL ${TTL}s`);

const requestsById = {};

for (let wave = 1; wave <= WAVES; wave++) {
  const ids = Array.from({ length: REQUESTS_PER_WAVE }, () =>
    Math.random() < HOT_SHARE ? HOT_ID : 2 + Math.floor(Math.random() * 99),
  );
  for (const id of ids) requestsById[id] = (requestsById[id] ?? 0) + 1;

  const before = stats.dbReadsById[HOT_ID] ?? 0;
  await Promise.all(ids.map((id) => getProduct(id, { ttl: TTL, dbDelayMs: 20 })));
  const hotDbReads = (stats.dbReadsById[HOT_ID] ?? 0) - before;
  if (hotDbReads) console.log(`wave ${wave}: hot key missed -> ${hotDbReads} DB reads for product ${HOT_ID}`);

  await sleep(300);
}

const total = WAVES * REQUESTS_PER_WAVE;
console.log(`\nproduct ${HOT_ID} received ${requestsById[HOT_ID]}/${total} requests -> all on one Redis key`);
console.log(`DB reads for product ${HOT_ID}: ${stats.dbReadsById[HOT_ID]} (each expiry under load is a stampede)`);
await teardown();
