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
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         type:
 *           type: string
 *           description: Product type
 *         sku:
 *           type: string
 *           description: Product SKU
 *         category:
 *           type: string
 *           description: Product category
 *         subCategory:
 *           type: string
 *           description: Product subcategory
 *         brand:
 *           type: string
 *           description: Product brand
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               color:
 *                 type: string
 *               size:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, child, unisex]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *         specifications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         averageRating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         status:
 *           type: string
 *           enum: [active, draft, discontinued]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         weight:
 *           type: number
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *         isFeatured:
 *           type: boolean
 *         totalStock:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - type
 *         - category
 *         - variants
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           minLength: 10
 *         type:
 *           type: string
 *         sku:
 *           type: string
 *         category:
 *           type: string
 *         subCategory:
 *           type: string
 *         brand:
 *           type: string
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - price
 *               - color
 *               - size
 *               - gender
 *               - images
 *             properties:
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: number
 *                 minimum: 0
 *               color:
 *                 type: string
 *               size:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, child, unisex]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *         specifications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         weight:
 *           type: number
 *           minimum: 0
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *               minimum: 0
 *             width:
 *               type: number
 *               minimum: 0
 *             height:
 *               type: number
 *               minimum: 0
 *         isFeatured:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [active, draft, discontinued]
 */

/**
 * @swagger
 * /api/product/getProducts:
 *   get:
 *     summary: Get all products with pagination and filtering
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, draft, discontinued]
 *         description: Filter by status
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
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
 * /api/product/search:
 *   get:
 *     summary: Search products by name, description, or tags
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *     responses:
 *       200:
 *         description: Search results
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
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of featured products to return
 *     responses:
 *       200:
 *         description: List of featured products
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
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/sku/{sku}:
 *   get:
 *     summary: Get a product by SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: Product SKU
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
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
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
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}/reviews:
 *   post:
 *     summary: Add a review to a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review added successfully
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/{id}/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - variantId
 *               - stockChange
 *             properties:
 *               variantId:
 *                 type: string
 *               stockChange:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product or variant not found
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get product stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Product stock information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product or variant not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/product/filtered:
 *   get:
 *     summary: Get filtered products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *         description: Filtered products
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
 *       401:
 *         description: Unauthorized
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
  ProductRoute.get('/getProducts', controllerWrapper(ProductController.getProducts));
  ProductRoute.get('/search', controllerWrapper(ProductController.searchProducts));
  ProductRoute.get('/featured', controllerWrapper(ProductController.getFeaturedProducts));
  ProductRoute.get('/sku/:sku', controllerWrapper(ProductController.getProductBySku));
  ProductRoute.get('/:id', controllerWrapper(ProductController.getProductById));

  // Protected routes - require authentication
  ProductRoute.post(
    '/createProduct',
    authRateLimiterMiddleware,
    authenticate,
    validate(createProductSchema),
    controllerWrapper(ProductController.createProduct),
  );
  ProductRoute.put(
    '/:id',
    authRateLimiterMiddleware,
    authenticate,
    validate(updateProductSchema),
    controllerWrapper(ProductController.updateProduct),
  );
  ProductRoute.delete(
    '/:id',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.deleteProduct),
  );
  ProductRoute.post(
    '/:id/reviews',
    authRateLimiterMiddleware,
    authenticate,
    validate(addReviewSchema),
    controllerWrapper(ProductController.addProductReview),
  );
  ProductRoute.patch(
    '/:id/stock',
    authRateLimiterMiddleware,
    authenticate,
    validate(updateProductStockSchema),
    controllerWrapper(ProductController.updateProductStock),
  );
  ProductRoute.get(
    '/:id/stock',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.getProductStock),
  );
  ProductRoute.get(
    '/filtered',
    authRateLimiterMiddleware,
    authenticate,
    controllerWrapper(ProductController.getFilteredProducts),
  );
})();
export default ProductRoute;
