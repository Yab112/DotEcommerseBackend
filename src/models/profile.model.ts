// user.model.ts
import { Schema, model } from 'mongoose';

import type { IUser } from '@/dto/user.dto';

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      default: '',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: false,
    },
    loginMethod: {
      type: String,
      enum: ['password', 'google', 'both'],
      default: 'password',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      default: null,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    phone: {
      type: String,
      trim: true,
    },
    orders: [
      {
        type: String,
        ref: 'Order',
      },
    ],
    cart: [
      {
        productId: {
          type: String,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', function (next) {
  if (this.loginMethod === 'google' && !this.password) {
    this.password = '';
  } else if (!this.password && this.loginMethod !== 'google') {
    this.invalidate('password', 'Password is required for non-Google users');
  }
  next();
});

const User = model<IUser>('User', userSchema);
export default User;
