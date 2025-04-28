// File: src/routes/wishlist.routes.ts
import { Router } from 'express';
import { wishlistController } from '@/controllers/wishlist.controller';

import { authenticate } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import { validate } from '@/middleware/validate';
import { addToWishlistSchema, removeFromWishlist } from '@/validators/wishlist.validator';

const wishlistrouter = Router();

/**
 * @swagger
 * /wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get the user's wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             description: Product ID
 *                           variant:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: Variant name
 *                               value:
 *                                 type: string
 *                                 description: Variant value
 *                           price:
 *                             type: number
 *                             description: Product price
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: Image URL
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add a product to the wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               variant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Variant name
 *                   value:
 *                     type: string
 *                     description: Variant value
 *               price:
 *                 type: number
 *                 description: Product price
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Image URL
 *             required:
 *               - product
 *               - variant
 *               - price
 *               - images
 *     responses:
 *       200:
 *         description: Successfully added product to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             description: Product ID
 *                           variant:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: Variant name
 *                               value:
 *                                 type: string
 *                                 description: Variant value
 *                           price:
 *                             type: number
 *                             description: Product price
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: Image URL
 * /wishlist/{productId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove a product from the wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Variant name
 *                   value:
 *                     type: string
 *                     description: Variant value
 *             required:
 *               - variant
 *     responses:
 *       200:
 *         description: Successfully removed product from wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             description: Product ID
 *                           variant:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: Variant name
 *                               value:
 *                                 type: string
 *                                 description: Variant value
 *                           price:
 *                             type: number
 *                             description: Product price
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: Image URL
 */

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();
  wishlistrouter.use(authenticate);

  wishlistrouter.get(
    '/',
    authRateLimiterMiddleware,
    controllerWrapper(wishlistController.getWishlist),
  );
  wishlistrouter.post(
    '/',
    authRateLimiterMiddleware,
    validate(addToWishlistSchema),
    controllerWrapper(wishlistController.addToWishlist),
  );
  wishlistrouter.delete(
    '/:productId',
    authRateLimiterMiddleware,
    validate(removeFromWishlist),
    controllerWrapper(wishlistController.removeFromWishlist),
  );
  wishlistrouter.delete(
    '/',
    validate(removeFromWishlist, 'params'),
    authRateLimiterMiddleware,
    controllerWrapper(wishlistController.clearWishlist),
  );
  wishlistrouter.post(
    '/:productId/move-to-cart',
    authRateLimiterMiddleware,
    validate(removeFromWishlist),
    controllerWrapper(wishlistController.moveToCart),
  );
})();
export default wishlistrouter;
