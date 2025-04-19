import { Request, Response, NextFunction } from 'express';
import logger from '@/services/logger.service';
import { verifyAccessToken } from '@/utils/jwt';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = (req.cookies as { accessToken?: string })?.accessToken;
  logger.info('Authenticate middleware: Checking token', {
    cookies: req.cookies,
    token,
  });

  if (!token) {
    logger.error('No access token provided', { cookies: req.cookies });
    res.status(401).json({ error: 'No access token provided. Please log in.' });
    return;
  }

  try {
    const payload = verifyAccessToken(token) as {
      id: string;
      email: string;
      isAdmin: boolean;
    };
    logger.info('Token verified', { payload });
    req.user = payload;
    next();
  } catch (error) {
    logger.error('Authentication error:', { error, token });
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
};
