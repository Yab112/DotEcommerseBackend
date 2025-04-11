// src/routes/auth.routes.ts
import { AuthController } from '@/controllers/auth.controller';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate} from '@/middleware/validate';
import { loginSchema, otpSchema, registerSchema } from '@/validators/auth.validation';
import { Router } from 'express';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/otp', authRateLimiter, validate(otpSchema), AuthController.generateOtp);
router.post('/verify-otp', authRateLimiter, validate(otpSchema), AuthController.verifyOtp);
router.post('/refresh-token', authRateLimiter, AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;