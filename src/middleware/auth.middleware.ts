import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return; // ✅ return here to stop further execution, but don't return the response itself
  }

  try {
    const payload = verifyAccessToken(token) as { id: string; email: string; isAdmin: boolean };
    req.user = payload;
    next(); // ✅ pass control to next middleware or route
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Type augmentation
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; isAdmin: boolean };
    }
  }
}
