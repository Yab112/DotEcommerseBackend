import { createClient } from 'redis';

// Type for our Redis client
export type RedisClient = ReturnType<typeof createClient>;

const client = createClient({
  username: 'default',
  password: 'ukut7doSHlQF3hQDq0SLqKsYAb719jAj',
  socket: {
    host: 'redis-10310.c16.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 10310,
    tls: true, // Enable for Redis Cloud
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