import { getRedisClient } from '../config/redis';

const DEFAULT_TTL = 3600; 
export const CacheService = {
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: any, ttl = DEFAULT_TTL): Promise<void> {
    const client = await getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
  },

  async invalidate(key: string): Promise<void> {
    const client = await getRedisClient();
    await client.del(key);
  },

  // For cache stampede protection
  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const freshData = await fetchFn();
    await this.set(key, freshData, ttl);
    return freshData;
  }
};