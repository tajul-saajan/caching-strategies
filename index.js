import { sequelize, Product } from './clients/db.js';
import { redis } from './clients/redis.js';

console.log('DB product 1:', (await Product.findByPk(1)).toJSON());
console.log('Redis:', await redis.ping());

await redis.quit();
await sequelize.close();
