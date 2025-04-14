import { Redis } from '@upstash/redis';
import logger from '@/services/logger.service';
import { env } from './env';

export type RedisClient = Redis;

let client: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (!client) {
    client = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });
    logger.info('Upstash Redis client initialized');
    // Test connection
    try {
      await client.ping();
      logger.info('Upstash Redis connection successful');
    } catch (error) {
      logger.error('Error connecting to Upstash Redis:', error);
      throw new Error('Failed to connect to Upstash Redis');
    }
  }
  return client;
};

// No explicit cleanup needed for @upstash/redis (HTTP-based)
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
