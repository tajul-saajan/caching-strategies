import { Product } from '../../../../clients/db.js';
import { getProduct, updateProduct } from '../productService.js';
import { setup, teardown, sleep } from './helpers.js';

await setup('Stale data');

async function compare(id) {
  const cached = await getProduct(id);
  const { price } = await Product.findByPk(id, { raw: true });
  console.log(`  cache price=${cached.price}, DB price=${price} -> ${cached.price === price ? 'consistent' : 'STALE'}`);
}

// Case A: a slow reader writes the old value into the cache after the writer invalidated it.
console.log('Case A: read/write race');
const reader = getProduct(1, { dbDelayMs: 200 }); // reads price=10, then stalls before SET
await sleep(50);
await updateProduct(1, { price: 999 }); // DB=999, DEL product:1
console.log('  writer: updated DB and deleted key');
await reader; // SETs the old price=10
console.log('  reader: wrote what it read before the update');
await compare(1);

// Case B: the DB write succeeds but the invalidation never happens (crash / Redis error).
console.log('\nCase B: invalidation lost after DB write');
await getProduct(2); // cache price=20
await Product.update({ price: 777 }, { where: { id: 2 } }); // process "crashes" before DEL
await compare(2);

await teardown();
