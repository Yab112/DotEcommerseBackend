import { readFileSync } from 'fs';
import path from 'path';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express, Request, Response } from 'express';
import logger from '@/services/logger.service';
import {
  SwaggerComponents,
  SwaggerInfo,
  SwaggerSecurityScheme,
  SwaggerServer,
} from '@/types/swagger.types';

// Type definitions for Swagger components

// Load package.json with type safety
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
const packageJson: { version: string } = JSON.parse(packageJsonContent) as { version: string };

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'P2P Marketplace API',
      version: packageJson.version,
      description: `
        API Documentation for eccomerce backenbackend.
        This API allows users to manage their profiles, products, and transactions in a peer-to-peer marketplace.
        The API is designed to be RESTful and follows standard conventions for HTTP methods and status codes.
        The API is built with TypeScript and Express, and uses MongoDB for data storage.
        The API supports user authentication using JWT, and includes features for managing product listings,
        peer-to-peer transactions, and messaging between users.
        The API is designed to be secure, scalable, and easy to use.
        
        
         Key Features:
        - User authentication (JWT)
        - Product listings management
        - Peer-to-peer transactions
        - Messaging between users
        
         Authentication
        Use the Authorize button to set your JWT token.
      `,
      contact: {
        name: 'API Support',
        email: 'eshetieyabibal@gmail.com',
        url: 'https://p2pmarketplace.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    } as SwaggerInfo,
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://dotbackendcode-latst.onrender.com',
        description: 'Production server',
      },
    ] as SwaggerServer[],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      } as { bearerAuth: SwaggerSecurityScheme },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['buyer', 'seller', 'admin'],
              example: 'buyer',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
          },
        },
      },
    } as SwaggerComponents,
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts', './src/controllers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express, port: number): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info(`📚 Swagger UI available at http://localhost:${port}/api-docs`);

  // API Docs in JSON format
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
  logger.info(`📝 API Specification available at http://localhost:${port}/api-docs.json`);
};
