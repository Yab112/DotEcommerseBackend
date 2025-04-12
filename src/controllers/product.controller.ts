import { Request, Response } from 'express';
import productService from '../services/product.service'; // Assuming you have a product service
import { IProduct } from '../models/product.model'; // Assuming you have a product model

export class ProductController {
  /**
   * Create a new product
   * POST /api/products
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all products with filtering, pagination and sorting
   * GET /api/products
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = '-createdAt',
        category,
        status,
        minPrice,
        maxPrice,
        brand,
        isFeatured
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (brand) filter.brand = brand;
      if (isFeatured) filter.isFeatured = isFeatured === 'true';
      
      // Price range
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const result = await productService.getProducts(
        filter,
        Number(page),
        Number(limit),
        sort as string
      );

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          pages: result.pages,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get a single product by ID
   * GET /api/products/:id
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get a single product by SKU
   * GET /api/products/sku/:sku
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductBySku(req.params.sku);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update a product
   * PUT /api/products/:id
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete a product
   * DELETE /api/products/:id
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.deleteProduct(req.params.id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }
      
      const result = await productService.searchProducts(
        q as string,
        Number(page),
        Number(limit)
      );
      
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          pages: result.pages,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Add a review to a product
   * POST /api/products/:id/reviews
   */
  async addProductReview(req: Request, res: Response): Promise<void> {
    try {
      const { rating, comment } = req.body;
      const { id } = req.params;
      
      // Assuming user ID is available from authentication middleware
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }
      
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
        return;
      }
      
      const product = await productService.addProductReview(
        id,
        userId,
        rating,
        comment
      );
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update product stock
   * PATCH /api/products/:id/stock
   */
  async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        res.status(400).json({
          success: false,
          error: 'Quantity is required'
        });
        return;
      }
      
      const product = await productService.updateProductStock(
        req.params.id,
        Number(quantity)
      );
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get featured products
   * GET /api/products/featured
   */
  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      
      const products = await productService.getFeaturedProducts(Number(limit));
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ProductController();