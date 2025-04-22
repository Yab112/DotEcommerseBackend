import type { Request, Response } from 'express';
import logger from '@/services/logger.service';

export function controllerWrapper<T extends (req: Request, res: Response) => Promise<void>>(fn: T) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Unhandled controller error', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  };
}
