import { Router } from 'express';

import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate';
import {
  forgotPassword,
  forgotPasswordshema,
  loginSchema,
  otpSchema,
  registerSchema,
  resendotpSchema,
  resetPasswordSchema,
} from '@/validators/auth.validation';
import AuthController from '@/controllers/auth.controller';

const router = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  router.post(
    '/register',
    authRateLimiterMiddleware,
    validate(registerSchema),
    AuthController.register,
  );

  router.post('/login', authRateLimiterMiddleware, validate(loginSchema), AuthController.login);

  router.post(
    '/verify-otp',
    authRateLimiterMiddleware,
    validate(otpSchema),
    AuthController.verifyOtp,
  );

  router.post(
    '/resend-otp',
    authRateLimiterMiddleware,
    validate(resendotpSchema),
    AuthController.resendOtp,
  );

  router.post(
    '/reset-password-request',
    authRateLimiterMiddleware,
    validate(otpSchema), // Reuses otpSchema for email
    AuthController.requestPasswordReset,
  );

  router.post(
    '/reset-password',
    authRateLimiterMiddleware,
    validate(resetPasswordSchema),
    AuthController.verifyResetPassword,
  );

  router.post(
    '/forgot-Password-request',
    authRateLimiterMiddleware,
    validate(forgotPassword),
    AuthController.forgotPassword,
  );

  router.post(
    '/forgot-password',
    authRateLimiterMiddleware,
    validate(forgotPasswordshema),
    AuthController.verifyForgotPasswordOtp,
  );

  router.post('/refresh-token', authRateLimiterMiddleware, AuthController.refreshToken);

  router.post('/logout', AuthController.logout);

  // google auth
  // router.get('/auth/google', AuthController.googleAuth);
  // router.get(
  //   '/auth/google/callback',
  //   authRateLimiterMiddleware,
  //   AuthController.googleAuthCallback
  // );
})();

export default router;
