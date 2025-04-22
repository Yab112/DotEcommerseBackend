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
} from '@/validators/auth.validation';
import AuthController from '@/controllers/auth.controller';
import { controllerWrapper } from '@/utils/controllerWrapper.utils';
import authController from '@/controllers/auth.controller';

const router = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  /**
   * @swagger
   * tags:
   *   - name: Authentication
   *     description: User authentication endpoints
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     RegisterDTO:
   *       type: object
   *       required:
   *         - firstName
   *         - lastName
   *         - email
   *         - password
   *       properties:
   *         firstName:
   *           type: string
   *           example: "Yabibal"
   *         lastName:
   *           type: string
   *           example: "Eshetie"
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *         password:
   *           type: string
   *           format: password
   *           example: "password123"
   *         phone:
   *           type: string
   *           example: "1234567890"
   *     LoginDTO:
   *       type: object
   *       required:
   *         - email
   *         - password
   *       properties:
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *         password:
   *           type: string
   *           format: password
   *           example: "password123"
   *     OtpDTO:
   *       type: object
   *       required:
   *         - email
   *         - otp
   *       properties:
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *         otp:
   *           type: string
   *           example: "123456"
   *     ResetPasswordDTO:
   *       type: object
   *       required:
   *         - email
   *         - otp
   *         - newPassword
   *       properties:
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *         otp:
   *           type: string
   *           example: "123456"
   *         newPassword:
   *           type: string
   *           format: password
   *           example: "newpassword123"
   *     ForgotPasswordDTO:
   *       type: object
   *       required:
   *         - email
   *       properties:
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *     AuthResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *           example: "Login successful"
   *         user:
   *           $ref: '#/components/schemas/User'
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "507f1f77bcf86cd799439011"
   *         firstName:
   *           type: string
   *           example: "Yabibal"
   *         lastName:
   *           type: string
   *           example: "Eshetie"
   *         email:
   *           type: string
   *           format: email
   *           example: "eshetieyabibal@gmail.com"
   *         isAdmin:
   *           type: boolean
   *           example: false
   */

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     description: Creates a new user account and sends an OTP to the user's email for verification.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterDTO'
   *     responses:
   *       201:
   *         description: User registered successfully. OTP sent to the user's email.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User registered. OTP sent."
   *                 userId:
   *                   type: string
   *                   example: "507f1f77bcf86cd799439011"
   *       400:
   *         description: Bad request. Possible reasons include invalid input or user already exists.
   */
  router.post(
    '/register',
    authRateLimiterMiddleware,
    validate(registerSchema),
    controllerWrapper(AuthController.register),
  );

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login a user
   *     description: Authenticates a user with email and password. Returns access and refresh tokens.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginDTO'
   *     responses:
   *       200:
   *         description: Login successful. Returns user details and tokens.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials or unverified user.
   */
  router.post(
    '/login',
    authRateLimiterMiddleware,
    validate(loginSchema),
    controllerWrapper(AuthController.login),
  );

  /**
   * @swagger
   * /api/auth/verify-otp:
   *   post:
   *     summary: Verify OTP for user registration or password reset
   *     description: Verifies the OTP sent to the user's email during registration or password reset.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/OtpDTO'
   *     responses:
   *       200:
   *         description: OTP verified successfully. Returns updated user details.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "OTP verified"
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid or expired OTP.
   */
  router.post(
    '/verify-otp',
    authRateLimiterMiddleware,
    validate(otpSchema),
    AuthController.verifyOtp,
  );

  /**
   * @swagger
   * /api/auth/resend-otp:
   *   post:
   *     summary: Resend OTP to the user's email
   *     description: Resends the OTP to the user's email for verification.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordDTO'
   *           example:
   *             email: "eshetieyabibal@gmail.com"
   *     responses:
   *       200:
   *         description: OTP resent successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "OTP resent"
   *       400:
   *         description: Failed to resend OTP. Possible reasons include user not found or already verified.
   */
  router.post(
    '/resend-otp',
    authRateLimiterMiddleware,
    validate(resendotpSchema),
    AuthController.resendOtp,
  );

  /**
   * @swagger
   * /api/auth/forgot-password-request:
   *   post:
   *     summary: Request OTP for forgotten password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordDTO'
   *     responses:
   *       200:
   *         description: OTP sent for forgotten password
   *       400:
   *         description: Failed to send OTP
   */
  router.post(
    '/forgot-password-request',
    authRateLimiterMiddleware,
    validate(forgotPassword),
    controllerWrapper(AuthController.forgotPassword),
  );

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: reset forgotten password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/VerifyForgotPasswordDTO'
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Failed to reset password
   */
  router.post(
    '/forgot-password',
    authRateLimiterMiddleware,
    validate(forgotPasswordshema),
    controllerWrapper(AuthController.verifyForgotPassword),
  );

  /**
   * @swagger
   * /api/auth/refresh-token:
   *   post:
   *     summary: Refresh the user's access token
   *     description: Generates a new access token using the refresh token.
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Access token refreshed successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Access token refreshed
   *       401:
   *         description: Invalid or missing refresh token.
   */
  router.post(
    '/refresh-token',
    authRateLimiterMiddleware,
    controllerWrapper(AuthController.refreshToken),
  );

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Log out the user and clear refresh token
   *     description: Logs out the user by clearing the refresh token from the server and cookies.
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Logged out successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Logged out successfully
   *       400:
   *         description: Failed to log out. Possible reasons include invalid token.
   */
  router.post('/logout', AuthController.logout);

  // google auth
  router.get('/auth/google', authController.googleAuth);
  router.get('/auth/google/callback', authRateLimiterMiddleware, authController.googleAuthCallback);
})();

export default router;
