// src/routes/product.routes.ts
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and operations
 */

/**
 * @swagger
 * /api/product/getProducts:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/createProduct:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

// Removed unused 'authenticate' import
import { authRateLimiter } from '@/middleware/rateLimiter';
import { authenticate } from '@/middleware/auth.middleware';

import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import { validate } from '@/middleware/validate';
import {
  addReviewSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema,
} from '@/validators/product.validation';
import ProductController from '../../controllers/product.controller';

const ProductRoute = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  // Public routes
  ProductRoute.get('/api/product/getProducts', controllerWrapper(ProductController.getProducts));
  ProductRoute.get('/api/product/search', controllerWrapper(ProductController.searchProducts));
  ProductRoute.get(
    '/api/product/featured',
    controllerWrapper(ProductController.getFeaturedProducts),
  );
  ProductRoute.get('/api/product/sku/:sku', controllerWrapper(ProductController.getProductBySku));
  ProductRoute.get('/api/product/:id', controllerWrapper(ProductController.getProductById));

  // Protected routes - require authentication
  ProductRoute.post(
    '/api/product/createProduct',
    authRateLimiterMiddleware,
    authenticate,
    validate(createProductSchema),
    controllerWrapper(ProductController.createProduct),
  );
  ProductRoute.put(
    '/api/product/:id',
    authRateLimiterMiddleware,
    authenticate,
    validate(updateProductSchema),
    controllerWrapper(ProductController.updateProduct),
  );
  ProductRoute.delete(
    '/api/product/:id',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.deleteProduct),
  );
  ProductRoute.post(
    '/api/product/:id/reviews',
    authRateLimiterMiddleware,
    authenticate,
    validate(addReviewSchema),
    controllerWrapper(ProductController.addProductReview),
  );
  ProductRoute.patch(
    '/api/product/:id/stock',
    authRateLimiterMiddleware,
    authenticate,
    validate(updateProductStockSchema),
    controllerWrapper(ProductController.updateProductStock),
  );
  ProductRoute.get(
    '/api/product/:id/stock',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.getProductStock),
  );
  ProductRoute.get(
    '/api/product/filtered',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.getFilteredProducts),
  );
})();
export default ProductRoute;
