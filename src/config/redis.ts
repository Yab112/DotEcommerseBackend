import { Redis } from '@upstash/redis';
import { env } from './env';

export type RedisClient = Redis;

let client: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (!client) {
    client = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });
    console.log('Upstash Redis client initialized');
    // Test connection
    try {
      await client.set('test:key', 'testvalue', { ex: 10 });
      const value = await client.get('test:key');
      console.log(`Redis test: ${value}`);
    } catch (err) {
      console.error('Redis test failed:', err);
      throw err;
    }
  }
  return client;
};

// No explicit cleanup needed for @upstash/redis (HTTP-based)
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));