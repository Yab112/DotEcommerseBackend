// src/routes/product.routes.ts
import { Router } from 'express';

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
})();
export default ProductRoute;
