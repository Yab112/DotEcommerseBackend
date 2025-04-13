import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  setAccessTokenCookie,
} from '@/utils/cookie';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { hashPassword } from '@/utils/passwordUtils';
import passport from 'passport';
import { getRedisClient } from '@/config/redis';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
      const user = await authService.registerUser(firstName, lastName, email, password, phone);
      res.status(201).json({ message: 'User registered. OTP sent.', userId: user._id });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.login(email, password);

      // Set both tokens as HTTP-only cookies
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({ message: 'Login successful', user });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const user = await authService.verifyOtp(email, otp);
      res.status(200).json({ message: 'OTP verified', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.resendOtp(email);
      res.status(200).json({ message: 'OTP resent' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({ message: 'Otp send to reset your password' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await authService.verifyForgotPasswordOtp(email, otp, newPassword);
      res.status(200).json({ message: 'OTP verified', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error('No refresh token provided');
      const accessToken = await authService.refreshAccessToken(refreshToken);
      setAccessTokenCookie(res, accessToken);
      res.status(200).json({ message: 'Access token refreshed' });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({ message: 'Password reset OTP sent' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyresetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const hashedPassword = await hashPassword(newPassword);
      await authService.resetPassword(email, otp, hashedPassword);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        const payload = verifyRefreshToken(refreshToken) as { id: string };
        await authService.logout(payload.id);
      }
      clearRefreshTokenCookie(res);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static googleAuth(req: Request, res: Response) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res);
  }

  static async googleAuthCallback(req: Request, res: Response) {
    passport.authenticate('google', { session: false })(req, res, async () => {
      try {
        const user = req.user as any;
        const accessToken = generateAccessToken({
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.isAdmin ?? false,
        });
        const refreshToken = generateRefreshToken({
          id: user._id.toString(),
          email: user.email,
        });
        const client = await getRedisClient();
        await client.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);
        res.json({
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
      } catch (error) {
        res.status(500).json({ error: 'Google authentication failed' });
      }
    });
  }
}

export default new AuthController();
