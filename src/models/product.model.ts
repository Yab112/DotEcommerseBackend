// product.model.ts
import { Document, Schema, model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  sku: string; // Stock Keeping Unit
  price: number;
  compareAtPrice?: number; // For showing discounts
  stock: number;
  category: string;
  subCategory?: string;
  brand?: string;
  images: string[];
  variants: {
    name: string; // e.g., "Size" or "Color"
    options: string[]; // e.g., ["S", "M", "L"] or ["Red", "Blue"]
  }[];
  specifications: {
    key: string;
    value: string;
  }[];
  reviews: {
    user: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];
  averageRating: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  tags: string[];
  weight?: number; // For shipping calculations
  dimensions?: {
    length: number;
    width: number;
    height: number;
  }; // For shipping
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: IProduct, value: number) {
          return !value || value > this.price;
        },
        message: 'Compare at price must be greater than the regular price',
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
    images: [{
      type: String,
      required: true,
    }],
    variants: [{
      name: { type: String, required: true },
      options: [{ type: String, required: true }],
    }],
    specifications: [{
      key: { type: String, required: true },
      value: { type: String, required: true },
    }],
    reviews: [{
      user: { type: String, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    }],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'out_of_stock', 'discontinued'],
      default: 'draft',
    },
    tags: [{
      type: String,
      trim: true,
    }],
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
  }
);

// Pre-save hook to calculate average rating
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