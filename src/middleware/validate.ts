import logger from '@/services/logger.service';
import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';

export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'params' | 'query' = 'body',
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      logger.error(`Validation error in ${property}:`, errors);
      res.status(400).json({ errors });
      return;
    }
    next();
  };
};
