import type { Request, Response } from 'express';
import { IProduct, ProductFilter } from '@/dto/product.dto';
import productService from '../services/product.service';

class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    const productData: Partial<IProduct> = req.body as Partial<IProduct>;
    const product = await productService.createProduct(productData);
    res.status(201).json({
      success: true,
      data: product,
    });
  }

  async getProducts(req: Request, res: Response): Promise<void> {
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
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async getProductBySku(req: Request, res: Response): Promise<void> {
    const product = await productService.getProductBySku(req.params.sku);
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const product = await productService.updateProduct(
      req.params.id,
      req.body as Partial<IProduct>,
    );
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    const { q, page = '1', limit = '10' } = req.query;
    if (!q || typeof q !== 'string') {
      throw Object.assign(new Error('Search query is required'), { status: 400 });
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
  }

  async addProductReview(req: Request, res: Response): Promise<void> {
    const { rating, comment, user } = req.body as {
      rating: number;
      comment?: string;
      user?: { id: string };
    };
    const { id } = req.params;

    const userId = user?.id;
    if (!userId) {
      throw Object.assign(new Error('User not authenticated'), { status: 401 });
    }
    if (!rating || rating < 1 || rating > 5) {
      throw Object.assign(new Error('Rating must be between 1 and 5'), { status: 400 });
    }

    const product = await productService.addProductReview(id, userId, rating, comment);
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async updateProductStock(req: Request, res: Response): Promise<void> {
    const { variantId, stockChange } = req.body as { variantId: string; stockChange: number };
    if (!variantId || stockChange === undefined) {
      throw Object.assign(new Error('Variant ID and stock change are required'), { status: 400 });
    }

    const product = await productService.updateProductStock(req.params.id, variantId, stockChange);
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async getProductStock(req: Request, res: Response): Promise<void> {
    const { variantId } = req.query as { variantId: string };
    if (!variantId) {
      throw Object.assign(new Error('Variant ID is required'), { status: 400 });
    }

    const stock = await productService.getProductStock(req.params.id, variantId);
    res.status(200).json({
      success: true,
      data: { stock },
    });
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    const { limit = '10' } = req.query;
    const products = await productService.getFeaturedProducts(Number(limit));
    res.status(200).json({
      success: true,
      data: products,
    });
  }
}

// Export wrapped controller methods
export default new ProductController();
