// config/env.ts
import path from 'path';

import { cleanEnv, str, num, url } from 'envalid';
import dotenv from 'dotenv';
import logger from '@/services/logger.service';

// 1. Load .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// 2. Validate environment variables
export const env = cleanEnv(process.env, {
  // Core Application
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: num({ default: 5000 }),
  FRONTEND_URL: url({ default: 'http://localhost:3000' }),

  // MongoDB
  MONGO_URI: str(),

  // JWT Authentication
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),

  // Redis Configuration
  REDIS_TOKEN: str(),
  REDIS_URL: str({ default: 'https://your-upstash-redis-url' }),
  JWT_REFRESH_SECRET: str({ default: 'your_refresh_secret' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '30d' }),

  // email
  EMAIL_USER: str(),
  EMAIL_PASS: str(),
  EMAIL_FROM: str(),

  // google
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: str({ default: 'http://localhost:5000/auth/google/callback' }),
  // otp
  OTP_EXPIRES_IN: num({ default: 600 }),

  // Stripe
  STRIPE_SECRET_KEY: str(),

  // Production-only variables
  // ...(process.env.NODE_ENV === 'production'
  //   ? {
  //       SENTRY_DSN: str(),
  //       AWS_ACCESS_KEY_ID: str(),
  //       AWS_SECRET_ACCESS_KEY: str(),
  //     }
  //   : {}),
});

// 3. Runtime validation
if (env.NODE_ENV === 'production') {
  // JWT Secret strength
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  // MongoDB configuration
  if (env.MONGO_URI.includes('localhost')) {
    throw new Error('Cannot use local MongoDB in production');
  }
} else {
  // Development warnings
  if (env.JWT_SECRET === '12345678gyhujiokj$RDFTGY&B*NUIMOK<PL@fnuhebvsjfgvskeurh$#%678') {
    logger.warn('⚠️  Using default JWT secret in development - change this in production!');
  }
}
