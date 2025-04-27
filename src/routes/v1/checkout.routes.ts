// routes/checkout.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate';
import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import { initiateCheckoutSchema } from '@/validators/checkout.validator';
import { checkoutController } from '@/controllers/checkout.controller';

const CheckoutRoute = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  CheckoutRoute.post(
    '/',
    authenticate,
    authRateLimiterMiddleware,
    validate(initiateCheckoutSchema),
    controllerWrapper(checkoutController.initiateCheckout),
  );
})();

export default CheckoutRoute;
