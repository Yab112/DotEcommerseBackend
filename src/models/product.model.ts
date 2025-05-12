// product.model.ts
import { Schema, model } from 'mongoose';
import type { IProduct } from '@/dto/product.dto';

const variantSchema = new Schema({
  sku: { type: String, trim: true, required: true },
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0, default: 0, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'child', 'unisex'], required: true },
  images: [{ type: String, required: true }],
  attributes: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
});

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: String,
      ref: 'Category',
    },
    brand: {
      type: String,
      trim: true,
    },
    variants: {
      type: [variantSchema],
      required: true,
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    reviews: [
      {
        user: { type: String, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'discontinued'],
      default: 'draft',
    },
    tags: [{ type: String, trim: true }],
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    totalStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Auto calculate totalStock from variants
productSchema.pre('save', function (next) {
  const product = this as IProduct;

  if (product.variants && product.variants.length > 0) {
    product.totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  } else {
    product.totalStock = 0;
  }

  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
  } else {
    product.averageRating = 0;
  }

  next();
});

const Product = model<IProduct>('Product', productSchema);
export default Product;
