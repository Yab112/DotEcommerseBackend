import type { Request, Response } from 'express';
import { IProduct, ProductFilter } from '@/dto/product.dto';
import productService from '../services/product.service';

export class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: Partial<IProduct> = req.body as Partial<IProduct>;
      const product = await productService.createProduct(productData);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as {
        page?: string;
        limit?: string;
        sort?: string;
        category?: string;
        status?: string;
        minPrice?: string;
        maxPrice?: string;
        brand?: string;
        isFeatured?: string;
      };

      const {
        page = '1',
        limit = '10',
        sort = '-createdAt',
        category,
        status,
        minPrice,
        maxPrice,
        brand,
        isFeatured,
      } = query;

      const filter: ProductFilter = {};
      if (minPrice || maxPrice) {
        filter.price = {};

        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      if (category) filter.category = category;
      if (status && ['active', 'draft', 'out_of_stock', 'discontinued'].includes(status)) {
        filter.status = status as 'active' | 'draft' | 'out_of_stock' | 'discontinued';
      }
      if (brand) filter.brand = brand;
      if (isFeatured) filter.isFeatured = isFeatured === 'true';

      const result = await productService.getProducts(filter, Number(page), Number(limit), sort);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          pages: result.pages,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductBySku(req.params.sku);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body as Partial<IProduct>,
      );

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.deleteProduct(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = '1', limit = '10' } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const result = await productService.searchProducts(q, Number(page), Number(limit));

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          pages: result.pages,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async addProductReview(req: Request, res: Response): Promise<void> {
    try {
      const { rating, comment, user } = req.body as {
        rating: number;
        comment?: string;
        user?: { id: string };
      };
      const { id } = req.params;

      const userId = user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        });
        return;
      }

      const product = await productService.addProductReview(id, userId, rating, comment);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { quantity } = req.body as { quantity: number };

      if (quantity === undefined) {
        res.status(400).json({
          success: false,
          error: 'Quantity is required',
        });
        return;
      }

      const product = await productService.updateProductStock(req.params.id, Number(quantity));

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = '10' } = req.query;
      const products = await productService.getFeaturedProducts(Number(limit));
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

export default new ProductController();
