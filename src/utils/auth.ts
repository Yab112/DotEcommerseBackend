import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';

const JWT_SECRET: Secret = env.JWT_SECRET;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = env.JWT_EXPIRES_IN as SignOptions['expiresIn']; 

interface TokenPayload {
  id: string;
  role: string;
}

export const generateAuthToken = (userId: Types.ObjectId, role: string): string => {
  return jwt.sign(
    { id: userId.toHexString(), role }, // Convert ObjectId to string
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } // Correct type
  );
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
    throw new Error('Invalid token');
  }

  return {
    id: decoded.id,
    role: decoded.role
  };
};
