import { db } from './db.js';
import { redis } from './cache.js';

console.log('DB products:', db.prepare('SELECT COUNT(*) AS count FROM products').get().count);
console.log('Redis:', await redis.ping());

await redis.quit();
