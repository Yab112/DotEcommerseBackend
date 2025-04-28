import { Router } from 'express';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate';
import { cartController } from '@/controllers/cart.controller';
import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import {
  addToCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from '@/validators/cart.validator';

const CartRoute = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for managing the shopping cart
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       description: The user ID
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             description: The product ID
 *                           variantName:
 *                             type: string
 *                             description: The name of the variant (e.g., "Color")
 *                           variantValue:
 *                             type: string
 *                             description: The value of the variant (e.g., "Red")
 *                           price:
 *                             type: number
 *                             description: The price of the product
 *                           quantity:
 *                             type: number
 *                             description: The quantity of the product
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: Image URLs for the product
 *                     _id:
 *                       type: string
 *                       description: The cart ID
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the cart was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the cart was last updated
 *       401:
 *         description: Unauthorized
 */
(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  CartRoute.get(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    controllerWrapper(cartController.getCart),
  );

  /**
   * @swagger
   * /api/cart:
   *   post:
   *     summary: Add an item to the cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AddToCartDTO'
   *     responses:
   *       201:
   *         description: Successfully added the item to the cart
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   description: The updated cart
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  CartRoute.post(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    validate(addToCartSchema),
    controllerWrapper(cartController.addToCart),
  );

  /**
   * @swagger
   * /api/cart:
   *   patch:
   *     summary: Update an item in the cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCartItemDTO'
   *     responses:
   *       200:
   *         description: Successfully updated the item in the cart
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   description: The updated cart
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  CartRoute.patch(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    validate(updateCartItemSchema),
    controllerWrapper(cartController.updateCartItem),
  );

  /**
   * @swagger
   * /api/cart/{itemId}:
   *   delete:
   *     summary: Remove an item from the cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: itemId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: The ID of the cart item to remove
   *     responses:
   *       204:
   *         description: Successfully removed the item from the cart
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Item not found
   */
  CartRoute.delete(
    '/:itemId',
    authenticate,
    authRateLimiterMiddleware,
    validate(removeCartItemSchema, 'params'),
    controllerWrapper(cartController.removeFromCart),
  );
})();

export default CartRoute;

/**
 * @swagger
 * components:
 *   schemas:
 *     AddToCartDTO:
 *       type: object
 *       required:
 *         - product
 *         - variantName
 *         - variantValue
 *         - quantity
 *         - price
 *       properties:
 *         product:
 *           type: string
 *           description: The ID of the product to add
 *         variantName:
 *           type: string
 *           description: The name of the variant (e.g., "Color")
 *         variantValue:
 *           type: string
 *           description: The value of the variant (e.g., "Red")
 *         quantity:
 *           type: number
 *           description: The quantity of the product to add
 *         price:
 *           type: number
 *           description: The price of the product
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             description: Image URLs for the product
 *     UpdateCartItemDTO:
 *       type: object
 *       required:
 *         - product
 *         - variantName
 *         - variantValue
 *         - quantity
 *       properties:
 *         product:
 *           type: string
 *           description: The ID of the product to update
 *         variantName:
 *           type: string
 *           description: The name of the variant (e.g., "Color")
 *         variantValue:
 *           type: string
 *           description: The value of the variant (e.g., "Red")
 *         quantity:
 *           type: number
 *           description: The new quantity of the product
 */
