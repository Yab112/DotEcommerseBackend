import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate';
import { loginSchema, otpSchema, registerSchema } from '@/validators/auth.validation';

const router = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();
  router.post('/register', authRateLimiterMiddleware, validate(registerSchema), AuthController.register);
  router.post('/login', authRateLimiterMiddleware, validate(loginSchema), AuthController.login);
  router.post('/otp', authRateLimiterMiddleware, validate(otpSchema), AuthController.generateOtp);
  router.post('/verify-otp', authRateLimiterMiddleware, validate(otpSchema), AuthController.verifyOtp);
  router.post('/refresh-token', authRateLimiterMiddleware, AuthController.refreshToken);
  router.post('/logout', AuthController.logout);
})();

export default router;
