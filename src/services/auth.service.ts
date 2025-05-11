import User from '@/models/profile.model';
import { hashPassword, comparePassword } from '@/utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt.utils';
import type { IUser } from '@/dto/user.dto';

import { setRedisValue, getRedisValue, deleteRedisValue } from '@/utils/redis.utils';
import { generateAndSendOtp, verifyOtpCode } from './otp.service';
import logger from './logger.service';

export class AuthService {
  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<IUser> {
    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists');
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      isVerified: false,
      loginMethod: 'password',
    });
    try {
      await generateAndSendOtp(email);
    } catch (error) {
      logger.error('Failed to send OTP', { error });
      await User.deleteOne({ _id: user._id });
      throw new Error('Failed to send OTP');
    }
    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<IUser> {
    const isValid = await verifyOtpCode(email, otp);
    if (!isValid) throw new Error('Invalid or expired OTP');
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) throw new Error('User not found');
    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUser;
  }> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (user.password === '') {
      throw new Error('This account uses Google login. Please use /auth/google.');
    }
    if (!user.isVerified) throw new Error('User not verified');
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin ?? false,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Store refresh token in Redis
    await setRedisValue(
      `refresh_token:${user._id}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7 days
    );
    return { accessToken, refreshToken, user };
  }

  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');
    try {
      await generateAndSendOtp(email);
    } catch (error) {
      logger.error('Failed to send OTP', { error });
      throw new Error('Failed to send OTP');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!user.isVerified) throw new Error('User not verified');
    try {
      await generateAndSendOtp(email);
    } catch (error) {
      logger.error('Failed to send OTP', { error });
      throw new Error('Failed to send OTP');
    }
  }

  async verifyForgotPasswordOtp(email: string, newPassword: string): Promise<IUser> {
    const newPasswordhashed = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate(
      { email },
      { password: newPasswordhashed },
      { new: true },
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken) as { id: string; email: string };
    const storedToken = await getRedisValue<string>(`refresh_token:${payload.id}`);
    if (storedToken !== refreshToken) throw new Error('Invalid refresh token');
    const user = await User.findById(payload.id);
    if (!user) throw new Error('User not found');
    return generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin ?? false,
    });
  }

  async logout(userId: string): Promise<void> {
    await deleteRedisValue(`refresh_token:${userId}`);
  }
}

export const authService = new AuthService();
