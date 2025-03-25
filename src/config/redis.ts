import { env } from 'process';
import { createClient } from 'redis';

// Type for our Redis client
export type RedisClient = ReturnType<typeof createClient>;

const client = createClient({
  username:env.REDIS_USER,
  password: env.REDIS_PASSWORD,
  socket: {
    host: env.REDIS_HOST,
    port: 10310,
    tls: true, 
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000) // Exponential backoff
  }
});

// Error handling
client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('ready', () => console.log('Redis connected successfully'));

// Connect only once
let isConnected = false;
export const getRedisClient = async (): Promise<RedisClient> => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.quit();
  console.log('Redis connection closed');
});