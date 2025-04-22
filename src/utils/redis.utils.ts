// utils/redis.utils.ts
import { getRedisClient } from '@/config/redis';
import logger from '@/services/logger.service';

export const setRedisValue = async (
  key: string,
  value: string | object,
  expiresIn?: number,
): Promise<void> => {
  const client = await getRedisClient();
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (expiresIn) {
      await client.setex(key, expiresIn, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
    logger.info(`Stored in Redis: ${key}`);
  } catch (error) {
    logger.error(`Error storing ${key} in Redis:`, error);
    throw new Error(`Failed to store ${key} in Redis`);
  }
};

export const getRedisValue = async <T = string>(key: string): Promise<T | null> => {
  const client = await getRedisClient();
  try {
    const value: string | null = await client.get(key);
    if (!value) {
      logger.info(`No value found for ${key} in Redis`);
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch (error) {
    logger.error(`Error retrieving ${key} from Redis:`, error);
    throw new Error(`Failed to retrieve ${key} from Redis`);
  }
};

export const deleteRedisValue = async (key: string): Promise<void> => {
  const client = await getRedisClient();
  try {
    await client.del(key);
    logger.info(`Deleted from Redis: ${key}`);
  } catch (error) {
    logger.error(`Error deleting ${key} from Redis:`, error);
    throw new Error(`Failed to delete ${key} from Redis`);
  }
};
