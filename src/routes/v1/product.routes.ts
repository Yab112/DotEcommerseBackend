// src/routes/product.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import ProductController from '../../controllers/product.controller';

const ProductRoute = Router();

// Public routes
ProductRoute.get('/', ProductController.getProducts);
ProductRoute.get('/search', ProductController.searchProducts);
ProductRoute.get('/featured', ProductController.getFeaturedProducts);
ProductRoute.get('/sku/:sku', ProductController.getProductBySku);
ProductRoute.get('/:id', ProductController.getProductById);

// Protected routes - require authentication
ProductRoute.post('/', authenticate, ProductController.createProduct);
ProductRoute.put('/:id', authenticate, ProductController.updateProduct);
ProductRoute.delete('/:id', authenticate, ProductController.deleteProduct);
ProductRoute.post('/:id/reviews', authenticate, ProductController.addProductReview);
ProductRoute.patch('/:id/stock', authenticate, ProductController.updateProductStock);

export default ProductRoute;
