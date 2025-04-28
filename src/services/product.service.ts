import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { IProduct } from '@/dto/product.dto';
import Product from '@/models/product.model';

export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const totalStock =
      productData.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
    const product = new Product({ ...productData, totalStock });
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
    if (updateData.variants) {
      const totalStock = (updateData.variants as Array<{ stock?: number }>).reduce(
        (sum, variant) => sum + (variant.stock || 0),
        0,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedData = { ...updateData, totalStock };
    }

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

    if (!product.reviews) {
      product.reviews = [];
    }

    const existingReviewIndex = product.reviews.findIndex((review) => review.user === userId);

    const review = {
      user: userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    if (existingReviewIndex >= 0) {
      product.reviews[existingReviewIndex] = review;
    } else {
      product.reviews.push(review);
    }

    return product.save();
  }

  /**
   * Update product stock (by variant)
   */
  async updateProductStock(
    productId: string,
    variantId: string,
    stockChange: number,
  ): Promise<IProduct | null> {
    const product = await Product.findById(productId);

    if (!product) {
      return null;
    }

    const variant = product.variants?.find((v) => v._id?.toString() === variantId);

    if (!variant) {
      throw new Error('Variant not found');
    }

    variant.stock = Math.max(0, (variant.stock || 0) + stockChange);

    // Recalculate total stock
    product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    // Update product status
    product.status = product.totalStock > 0 ? 'active' : 'discontinued';

    return product.save();
  }

  /**
   * Get product stock (by variant)
   */
  async getProductStock(productId: string, variantId: string): Promise<number> {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const variant = product.variants?.find((v) => v._id?.toString() === variantId);

    if (!variant) {
      throw new Error('Variant not found');
    }

    return variant.stock || 0;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<IProduct[]> {
    return Product.find({ isFeatured: true }).sort('-createdAt').limit(limit);
  }

  /**
   * Get products with pagination and filtering
   */
  async getFilteredProducts(
    filter: FilterQuery<IProduct>,
    page = 1,
    limit = 10,
    sort = '-createdAt',
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
}

export default new ProductService();
