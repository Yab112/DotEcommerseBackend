import type { Request, Response } from 'express';
import passport from 'passport';
import { authService } from '@/services/auth.service';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  setAccessTokenCookie,
} from '@/utils/cookie.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt.utils';
import logger from '@/services/logger.service';
import { setRedisValue } from '@/utils/redis.utils';
import {
  RegisterDTO,
  LoginDTO,
  OtpDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  AuthResponse,
  IUser,
} from '../dto/user.dto';

class AuthController {
  async register(req: Request<unknown, unknown, RegisterDTO>, res: Response) {
    const { firstName, lastName, email, password, phone } = req.body;
    const user = await authService.registerUser(firstName, lastName, email, password, phone);
    logger.info('User registered', { email, userId: user._id });
    res.status(201).json({ message: 'User registered. OTP sent.', userId: user._id });
  }

  async login(req: Request<unknown, unknown, LoginDTO>, res: Response) {
    const { email, password } = req.body;
    const result: AuthResponse = await authService.login(email, password);
    setAccessTokenCookie(res, result.accessToken!);
    setRefreshTokenCookie(res, result.refreshToken!);
    logger.info('User logged in, cookies set', {
      email,
      accessToken: result.accessToken,
    });
    res.status(200).json({ message: 'Login successful', user: result.user });
  }

  async verifyOtp(req: Request<unknown, unknown, OtpDTO>, res: Response) {
    const { email, otp } = req.body;
    const user = await authService.verifyOtp(email, otp);
    logger.info('OTP verified', { email });
    res.status(200).json({ message: 'OTP verified', user });
  }

  async resendOtp(req: Request<unknown, unknown, ForgotPasswordDTO>, res: Response) {
    const { email } = req.body;
    await authService.resendOtp(email);
    logger.info('OTP resent', { email });
    res.status(200).json({ message: 'OTP resent' });
  }

  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordDTO>, res: Response) {
    const { email } = req.body;
    await authService.forgotPassword(email);
    logger.info('Forgot password OTP sent', { email });
    res.status(200).json({ message: 'OTP sent to reset your password' });
  }

  async verifyForgotPassword(
    req: Request<unknown, unknown, VerifyForgotPasswordDTO>,
    res: Response,
  ) {
    const { email, newPassword } = req.body;
    const user = await authService.verifyForgotPasswordOtp(email, newPassword);
    logger.info('Forgot password OTP verified', { email });
    res.status(200).json({ message: 'OTP verified', user });
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies as { refreshToken?: string };
    if (!refreshToken) throw new Error('No refresh token provided');
    const accessToken = await authService.refreshAccessToken(refreshToken);
    setAccessTokenCookie(res, accessToken);
    logger.info('Access token refreshed');
    res.status(200).json({ message: 'Access token refreshed' });
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies as { refreshToken?: string };
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken) as { id: string };
      await authService.logout(payload.id);
    }
    clearRefreshTokenCookie(res);
    logger.info('User logged out');
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async googleAuth(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res);
  }

  async googleAuthCallback(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate('google', { session: false })(req, res, async () => {
      try {
        const user = req.user as Partial<IUser>;
        if (!user || !user._id || !user.firstName || !user.lastName || !user.email) {
          logger.error('Invalid user data from Google authentication', { user });
          throw new Error('Invalid user data from Google authentication');
        }

        const accessToken = generateAccessToken({
          id: user._id,
          email: user.email,
          isAdmin: user.isAdmin ?? false,
        });

        const refreshToken = generateRefreshToken({
          id: user._id || '',
          email: user.email,
        });

        // Store refresh token in Redis with 7-day expiration
        const refreshTokenKey = `refresh_token:${user._id}`;
        await setRedisValue(refreshTokenKey, refreshToken, 7 * 24 * 60 * 60);

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
      } catch (error) {
        logger.error('Error in Google authentication callback:', error);
        res.status(500).json({ error: 'Failed to authenticate with Google' });
      }
    });
  }
}

// Export wrapped controller methods
export default new AuthController();
