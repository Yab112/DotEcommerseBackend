// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(
        req.body.email,
        req.body.password
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ accessToken, user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async generateOtp(req: Request, res: Response): Promise<void> {
    try {
      await AuthService.generateOtp(req.body.email);
      res.json({ message: 'OTP sent to email' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  //resend otp if otp is expired

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = await AuthService.verifyOtp(
        req.body.email,
        req.body.otp
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ accessToken, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const { accessToken } = await AuthService.refreshToken(refreshToken);
      res.json({ accessToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  }
}