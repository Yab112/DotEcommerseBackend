import type { Application } from 'express';

import logger from '@/services/logger.service';
import { env } from './env';

logger.info('Environment variable loading .........', env.PORT);
export const startServer = (app: Application, port: number) => {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${port}`);
  });
};
