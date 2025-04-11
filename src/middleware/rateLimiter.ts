// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, RedisClient } from '../config/redis';

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const client: RedisClient = await getRedisClient();
      return client.sendCommand(args);
    },
  }),
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: 'Too many requests, please try again later.',
});