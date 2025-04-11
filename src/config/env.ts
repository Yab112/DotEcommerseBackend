//config/env.ts
import { cleanEnv, str, num, url } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

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
  REDIS_URL: str(),
  JWT_REFRESH_SECRET: str({ default: 'your_refresh_secret' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '30d' }),

  //email
  EMAIL_USER: str(),
  EMAIL_PASS: str(),
  EMAIL_FROM:str(),


  // Production-only variables
  ...(process.env.NODE_ENV === 'production'
    ? {
        SENTRY_DSN: str(),
        AWS_ACCESS_KEY_ID: str(),
        AWS_SECRET_ACCESS_KEY: str(),
      }
    : {}),
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
    console.warn('⚠️  Using default JWT secret in development - change this in production!');
  }
}
