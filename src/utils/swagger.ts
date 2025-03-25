import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import path from 'path';
import { Express, Request, Response } from 'express';

// Type definitions for Swagger components
interface SwaggerContact {
  name: string;
  email: string;
  url: string;
}

interface SwaggerLicense {
  name: string;
  url: string;
}

interface SwaggerInfo {
  title: string;
  version: string;
  description: string;
  contact: SwaggerContact;
  license: SwaggerLicense;
}

interface SwaggerServer {
  url: string;
  description: string;
}

interface SwaggerSecurityScheme {
  type: string;
  scheme: string;
  bearerFormat: string;
  description: string;
}

interface SwaggerComponents {
  securitySchemes: {
    bearerAuth: SwaggerSecurityScheme;
  };
  schemas: {
    User: Record<string, unknown>;
    Error: Record<string, unknown>;
  };
}

// Load package.json with type safety
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson: { version: string } = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'P2P Marketplace API',
      version: packageJson.version,
      description: `
        API Documentation for P2P Marketplace
        
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
        url: 'https://p2pmarketplace.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    } as SwaggerInfo,
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.p2pmarketplace.com/v1',
        description: 'Production server'
      }
    ] as SwaggerServer[],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      } as { bearerAuth: SwaggerSecurityScheme },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['buyer', 'seller', 'admin'],
              example: 'buyer'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error description'
            }
          }
        }
      }
    } as SwaggerComponents,
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/**/*.ts',
    './src/models/*.ts',
    './src/controllers/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express, port: number): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // API Docs in JSON format
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`
    📚 Swagger UI available at http://localhost:${port}/api-docs
    📝 API Specification available at http://localhost:${port}/api-docs.json
  `);
};