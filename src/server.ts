import { startServer } from './config/StartServer';
import { connectDB } from './config/dbConfig';
import { swaggerDocs } from './utils/swagger.utils';
import { env } from './config/env';
import app from './app/app';
import logger from './services/logger.service';

// Database connection
connectDB().catch((err) => {
  logger.error('Fatal DB connection error:', err);
  process.exit(1);
});
startServer(app, env.PORT);

// Swagger documentation
swaggerDocs(app, env.PORT);
