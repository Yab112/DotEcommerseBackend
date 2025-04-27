// File: src/routes/wishlist.routes.ts
import { Router } from 'express';
import { wishlistController } from '@/controllers/wishlist.controller';

import { authenticate } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import { validate } from '@/middleware/validate';
import { addToWishlistSchema, removeFromWishlist } from '@/validators/wishlist.validator';

const wishlistrouter = Router();
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
    controllerWrapper(wishlistController.moveToCart),
  );
})();
export default wishlistrouter;
