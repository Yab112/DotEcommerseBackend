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

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  CartRoute.get(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    controllerWrapper(cartController.getCart),
  );

  CartRoute.post(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    validate(addToCartSchema),
    controllerWrapper(cartController.addToCart),
  );

  CartRoute.patch(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    validate(updateCartItemSchema),
    controllerWrapper(cartController.updateCartItem),
  );

  CartRoute.delete(
    '/:itemId',
    authenticate,
    authRateLimiterMiddleware,
    validate(removeCartItemSchema),
    controllerWrapper(cartController.removeFromCart),
  );
})();

export default CartRoute;
