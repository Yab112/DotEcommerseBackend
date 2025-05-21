import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import healthRouter from '@/routes/v1/health.routes';
import authRoutes from '@/routes/v1/auth.routes';
import ProductRoute from '@/routes/v1/product.routes';
import ProfileRoute from '@/routes/v1/profile.routes';
import cookieParser from 'cookie-parser';
import CartRoute from '@/routes/v1/cart.routes';
import wishlistrouter from '@/routes/v1/wishlist.routes';
import { env } from '@/config/env'; // <-- Add this import

dotenv.config();

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.FRONTEND_URL, // Use validated env variable for allowed origin
    credentials: true, // Allow credentials (cookies)
  }),
);
app.use(express.json());
// auth routes

app.use('/api/auth', authRoutes);
app.use('/health', healthRouter);
app.use('/api/product', ProductRoute);
app.use('/api/profile', ProfileRoute);
app.use('/api/cart', CartRoute);
app.use('/api/wishlist', wishlistrouter);
export default app;
