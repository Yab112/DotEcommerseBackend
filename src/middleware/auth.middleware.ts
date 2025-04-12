import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

// Extend the Request interface to include the user property

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: 'No access token provided. Please log in.' });
    return; // Stop execution, do not return the response
  }

  try {
    const payload = verifyAccessToken(token) as { id: string; email: string; isAdmin: boolean };
    req.user = payload;
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired access token' });
    return;
  }
};