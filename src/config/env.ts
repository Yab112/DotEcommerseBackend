import { cleanEnv, str, num, url } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

// 1. Load .env file FIRST
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// 2. Then validate
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  PORT: num({ default: 5000 }),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  FRONTEND_URL: url({ default: 'http://localhost:3000' }),
  ...(process.env.NODE_ENV === 'production'
    ? {
        SENTRY_DSN: str(),
        AWS_ACCESS_KEY_ID: str(),
        AWS_SECRET_ACCESS_KEY: str(),
      }
    : {}),
});

// 3. Runtime checks
if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (env.MONGO_URI.includes('localhost')) {
    console.warn('Warning: Using local MongoDB in production!');
  }
}