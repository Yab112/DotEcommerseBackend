// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, RedisClient } from '../config/redis';

export const authRateLimiter = () => {
  return (async () => {
    const client: RedisClient = await getRedisClient();
    return rateLimit({
      store: new RedisStore({
        sendCommand: async (...args: string[]) => client.sendCommand(args),
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 requests per windowMs
      message: 'Too many requests, please try again later.',
    });
  })();
};
