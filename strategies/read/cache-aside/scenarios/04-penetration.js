import { redis } from '../../../../clients/redis.js';
import { getProduct, productKey } from '../productService.js';
import { setup, teardown, printStats } from './helpers.js';

const REQUESTS = 100;
const MISSING_ID = 999999;

await setup(`Cache penetration: ${REQUESTS} requests for a product that does not exist`);

for (let i = 0; i < REQUESTS; i++) {
  await getProduct(MISSING_ID);
}

printStats();
console.log(`cached? ${(await redis.exists(productKey(MISSING_ID))) ? 'yes' : 'no'} -> every request hits the DB`);
await teardown();
