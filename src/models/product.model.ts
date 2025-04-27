// product.model.ts
import { Schema, model } from 'mongoose';
import type { IProduct } from '@/dto/product.dto';

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
    variants: [
      {
        name: { type: String, required: true },
        options: [
          {
            value: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            stock: { type: Number, required: true, min: 0 },
            images: [{ type: String, required: true }],
          },
        ],
      },
    ],
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
  },
  {
    timestamps: true,
  },
);

productSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const Product = model<IProduct>('Product', productSchema);
export default Product;
