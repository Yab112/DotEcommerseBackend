import { cleanEnv, str, num, url } from 'envalid';

export const env = cleanEnv(process.env, {
  // Required variables
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  
  // Optional variables with defaults
  PORT: num({ default: 5000 }),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  FRONTEND_URL: url({ default: 'http://localhost:3000' }),
  
  // Production-only requirements
  ...(process.env.NODE_ENV === 'production' ? {
    SENTRY_DSN: str(),
    AWS_ACCESS_KEY_ID: str(),
    AWS_SECRET_ACCESS_KEY: str()
  } : {})
});

// Optional: Add runtime checks
if (process.env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}