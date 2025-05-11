import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DotEcommerseBackend API',
      version: '1.0.0',
      description: 'API documentation for DotEcommerseBackend',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://dotbackendcode-latst.onrender.com', // Corrected production server URL
        description: 'Production server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Ensure this path matches your route files
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
