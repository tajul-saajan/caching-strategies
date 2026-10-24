import { createClient } from 'redis';

export const redis = createClient(); // defaults to redis://localhost:6379
redis.on('error', (err) => console.error('Redis error:', err));
await redis.connect();
