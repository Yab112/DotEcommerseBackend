import type { FilterQuery, UpdateQuery } from 'mongoose';

import type { IProduct } from '@/dto/product.dto';

import Product from '../models/product.model';

export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  /**
   * Get all products with optional filtering, pagination and sorting
   */
  async getProducts(
    filter: FilterQuery<IProduct> = {},
    page = 1,
    limit = 10,
    sort: string = '-createdAt',
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<IProduct | null> {
    return Product.findById(id);
  }

  /**
   * Get a single product by SKU
   */
  async getProductBySku(sku: string): Promise<IProduct | null> {
    return Product.findOne({ sku });
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, updateData: UpdateQuery<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }

  /**
   * Search products by name, description, or tags
   */
  async searchProducts(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const searchRegex = new RegExp(query, 'i');

    const filter = {
      $or: [{ name: searchRegex }, { description: searchRegex }, { tags: searchRegex }],
    };

    return this.getProducts(filter, page, limit);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    page = 1,
    limit = 10,
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    return this.getProducts({ category }, page, limit);
  }

  /**
   * Add a review to a product
   */
  async addProductReview(
    productId: string,
    userId: string,
    rating: number,
    comment?: string,
  ): Promise<IProduct | null> {
    const product = await Product.findById(productId);

    if (!product) {
      return null;
    }

    // Check if user already reviewed this product
    const existingReviewIndex = product.reviews.findIndex((review) => review.user === userId);

    const review = {
      user: userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    if (existingReviewIndex >= 0) {
      // Update existing review
      product.reviews[existingReviewIndex] = review;
    } else {
      // Add new review
      product.reviews.push(review);
    }

    return product.save();
  }

  /**
   * Update product stock
   */
  async updateProductStock(id: string, quantity: number): Promise<IProduct | null> {
    const product = await Product.findById(id);

    if (!product) {
      return null;
    }

    product.stock += quantity;

    // Update status if needed
    if (product.stock <= 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock') {
      product.status = 'active';
    }

    return product.save();
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<IProduct[]> {
    return Product.find({ isFeatured: true }).sort('-createdAt').limit(limit);
  }
}

export default new ProductService();
