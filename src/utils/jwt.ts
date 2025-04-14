// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

import { env } from '@/config/env';

const { JWT_SECRET } = env;
const { JWT_REFRESH_SECRET } = env;

export const generateAccessToken = (user: { id: string; email: string; isAdmin: boolean }) => {
  return jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
export interface JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}
