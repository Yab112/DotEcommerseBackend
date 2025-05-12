import type { Request, Response } from 'express';
import { IProduct, ProductFilter } from '@/dto/product.dto';
import { FilterQuery } from 'mongoose';
import productService from '../services/product.service';

class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: Partial<IProduct> = req.body as Partial<IProduct>;

      // Validate variants
      if (!productData.variants || productData.variants.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one variant is required.',
        });
        return;
      }

      const product = await productService.createProduct(productData);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as Record<string, string | undefined>;

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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.getProductBySku(req.params.sku);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
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
          message: 'Product not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.deleteProduct(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = '1', limit = '10' } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
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
          message: 'User not authenticated',
        });
        return;
      }
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }

      const product = await productService.addProductReview(id, userId, rating, comment);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { variantId, stockChange } = req.body as { variantId: string; stockChange: number };
      if (!variantId || stockChange === undefined) {
        res.status(400).json({
          success: false,
          message: 'Variant ID and stock change are required',
        });
        return;
      }

      const product = await productService.updateProductStock(
        req.params.id,
        variantId,
        stockChange,
      );
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { variantId } = req.query as { variantId: string };
      if (!variantId) {
        res.status(400).json({
          success: false,
          message: 'Variant ID is required',
        });
        return;
      }

      const stock = await productService.getProductStock(req.params.id, variantId);
      res.status(200).json({
        success: true,
        data: { stock },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getFilteredProducts(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', sort = '-createdAt', ...filters } = req.query;
      const result = await productService.getFilteredProducts(
        filters as FilterQuery<IProduct>,
        Number(page),
        Number(limit),
        sort as string,
      );
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}

// Export wrapped controller methods
export default new ProductController();
