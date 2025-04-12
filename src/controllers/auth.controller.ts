import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '@/utils/cookie';
import { verifyRefreshToken } from '@/utils/jwt';
import { hashPassword } from '@/utils/passwordUtils';

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
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({ message: 'Login successful', accessToken, user });
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
      res.status(200).json({ accessToken });
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
}

export default new AuthController();
