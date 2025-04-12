// src/routes/product.routes.ts
import { Router } from 'express';
// Removed unused 'authenticate' import
import ProductController from '../../controllers/product.controller';
import { authRateLimiter } from '@/middleware/rateLimiter';

const ProductRoute = Router();

(async () => {
const authRateLimiterMiddleware = await authRateLimiter();

// Public routes
ProductRoute.get('/getProducts', ProductController.getProducts);
ProductRoute.get('/search', ProductController.searchProducts);
ProductRoute.get('/featured', ProductController.getFeaturedProducts);
ProductRoute.get('/sku/:sku', ProductController.getProductBySku);
ProductRoute.get('/:id', ProductController.getProductById);

// Protected routes - require authentication
ProductRoute.post('/createProduct', authRateLimiterMiddleware, ProductController.createProduct); //name it createProduct
ProductRoute.put('/:id', authRateLimiterMiddleware, ProductController.updateProduct);
ProductRoute.delete('/:id', authRateLimiterMiddleware, ProductController.deleteProduct);
ProductRoute.post('/:id/reviews', authRateLimiterMiddleware, ProductController.addProductReview);
ProductRoute.patch('/:id/stock', authRateLimiterMiddleware, ProductController.updateProductStock);

})();
export default ProductRoute;
