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

dotenv.config();

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());
// auth routes

app.use('/api/auth', authRoutes);
app.use('/health', healthRouter);
app.use('/api/product', ProductRoute);
app.use('/api/profile', ProfileRoute);
app.use('/api/cart', CartRoute);
export default app;
