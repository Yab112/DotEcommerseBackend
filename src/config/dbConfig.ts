import { setTimeout } from 'timers/promises';

import mongoose from 'mongoose';

import logger from '@/services/logger.service';
import { env } from './env';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const { MONGO_URI } = env;

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    conn.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    conn.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(RETRY_DELAY_MS).then(() => connectDB());
    });
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      logger.warn(
        `⚠️ Connection attempt ${retryCount + 1} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
      );
      await setTimeout(RETRY_DELAY_MS);
      return connectDB(retryCount + 1);
    }

    logger.error(`❌ Failed to connect after ${MAX_RETRIES} attempts:`);
    logger.error((error as Error).message);
    process.exit(1);
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('⏏️ MongoDB connection closed through app termination');
  process.exit(0);
});
