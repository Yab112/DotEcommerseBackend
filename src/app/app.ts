import express from 'express';
import cors from 'cors';
import healthRouter from '@/routes/v1/health.routes';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from '@/routes/v1/auth.routes';
import ProductRoute from '@/routes/v1/product.routes';
dotenv.config();

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
//auth routes

app.use('/api/auth', authRoutes);
app.use('/health',healthRouter)
app.use('/api/product',ProductRoute)
export default app;