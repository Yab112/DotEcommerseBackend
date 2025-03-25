import mongoose from 'mongoose';
import { setTimeout } from 'timers/promises';

const MAX_RETRIES = 5; // Maximum number of retry attempts
const RETRY_DELAY_MS = 5000; // Delay between retries in milliseconds
const MONGO_URI = process.env.MONGO_URI!;

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    conn.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    conn.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(RETRY_DELAY_MS).then(() => connectDB());
    });

  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`⚠️ Connection attempt ${retryCount + 1} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await setTimeout(RETRY_DELAY_MS);
      return connectDB(retryCount + 1);
    }

    console.error(`❌ Failed to connect after ${MAX_RETRIES} attempts:`);
    console.error((error as Error).message);
    process.exit(1);
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('⏏️ MongoDB connection closed through app termination');
  process.exit(0);
});