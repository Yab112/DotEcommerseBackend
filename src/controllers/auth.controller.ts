import type { Request, Response } from 'express';
import passport from 'passport';
import { authService } from '@/services/auth.service';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  setAccessTokenCookie,
} from '@/utils/cookie';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { hashPassword } from '@/utils/passwordUtils';
import { getRedisClient } from '@/config/redis';
import logger from '@/services/logger.service';
import {
  RegisterDTO,
  LoginDTO,
  OtpDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  ResetPasswordDTO,
  AuthResponse,
  IUser,
} from '../dto/user.dto';

class AuthController {
  async register(req: Request<unknown, unknown, RegisterDTO>, res: Response) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
      const user = await authService.registerUser(firstName, lastName, email, password, phone);
      logger.info('User registered', { email, userId: user._id });
      res.status(201).json({ message: 'User registered. OTP sent.', userId: user._id });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Registration failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async login(req: Request<unknown, unknown, LoginDTO>, res: Response) {
    try {
      const { email, password } = req.body;
      const result: AuthResponse = await authService.login(email, password);
      setAccessTokenCookie(res, result.accessToken!);
      setRefreshTokenCookie(res, result.refreshToken!);
      logger.info('User logged in', { email });
      res.status(200).json({ message: 'Login successful', user: result.user });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Login failed', { error: err.message });
      res.status(401).json({ message: err.message });
    }
  }

  async verifyOtp(req: Request<unknown, unknown, OtpDTO>, res: Response) {
    try {
      const { email, otp } = req.body;
      const user = await authService.verifyOtp(email, otp);
      logger.info('OTP verified', { email });
      res.status(200).json({ message: 'OTP verified', user });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('OTP verification failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async resendOtp(req: Request<unknown, unknown, ForgotPasswordDTO>, res: Response) {
    try {
      const { email } = req.body;
      await authService.resendOtp(email);
      logger.info('OTP resent', { email });
      res.status(200).json({ message: 'OTP resent' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('OTP resend failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordDTO>, res: Response) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      logger.info('Forgot password OTP sent', { email });
      res.status(200).json({ message: 'OTP sent to reset your password' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Forgot password failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async verifyForgotPasswordOtp(
    req: Request<unknown, unknown, VerifyForgotPasswordDTO>,
    res: Response,
  ) {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await authService.verifyForgotPasswordOtp(email, otp, newPassword);
      logger.info('Forgot password OTP verified', { email });
      res.status(200).json({ message: 'OTP verified', user });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Forgot password OTP verification failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies as { refreshToken?: string };
      if (!refreshToken) throw new Error('No refresh token provided');
      const accessToken = await authService.refreshAccessToken(refreshToken);
      setAccessTokenCookie(res, accessToken);
      logger.info('Access token refreshed');
      res.status(200).json({ message: 'Access token refreshed' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Token refresh failed', { error: err.message });
      res.status(401).json({ message: err.message });
    }
  }

  async requestPasswordReset(req: Request<unknown, unknown, ForgotPasswordDTO>, res: Response) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      logger.info('Password reset OTP sent', { email });
      res.status(200).json({ message: 'Password reset OTP sent' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Password reset request failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async verifyResetPassword(req: Request<unknown, unknown, ResetPasswordDTO>, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const hashedPassword = await hashPassword(newPassword);
      await authService.resetPassword(email, otp, hashedPassword);
      logger.info('Password reset successful', { email });
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Password reset failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies as { refreshToken?: string };
      if (refreshToken) {
        const payload = verifyRefreshToken(refreshToken) as { id: string };
        await authService.logout(payload.id);
      }
      clearRefreshTokenCookie(res);
      logger.info('User logged out');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Logout failed', { error: err.message });
      res.status(400).json({ message: err.message });
    }
  }

  static googleAuth(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res);
  }

  static async googleAuthCallback(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate('google', { session: false })(req, res, async () => {
      try {
        const user = req.user as IUser;
        const accessToken = generateAccessToken({
          id: user._id,
          email: user.email,
          isAdmin: user.isAdmin ?? false,
        });
        const refreshToken = generateRefreshToken({
          id: user._id || '',
          email: user.email,
        });
        const client = await getRedisClient();
        await client.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);
        logger.info('Google authentication successful', { email: user.email });
        res.json({
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
      } catch (error: unknown) {
        const err = error as Error;
        logger.error('Google authentication failed', { error: err.message });
        res.status(500).json({ error: 'Google authentication failed' });
      }
    });
  }
}

export default new AuthController();
