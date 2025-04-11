import { createClient } from 'redis';
import { env } from './env';

export type RedisClient = ReturnType<typeof createClient>;

// Use your full Upstash Redis URL
const redisUrl = env.REDIS_URL;

const client = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 5000);
    },
  },
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('ready', () => console.log('Redis connected successfully'));

let connectionPromise: Promise<RedisClient> | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (!connectionPromise) {
    connectionPromise = client.connect();
  }
  await connectionPromise;
  return client;
};

process.on('SIGINT', async () => {
  await client.quit();
  console.log('Redis connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.quit();
  console.log('Redis connection closed');
  process.exit(0);
});
