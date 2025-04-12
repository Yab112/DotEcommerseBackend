import { getRedisClient } from '@/config/redis';
import User from '@/models/User.nodel';
import { generateAndSendOtp, verifyOtpCode } from './otp.service';
import { hashPassword, comparePassword } from '@/utils/passwordUtils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { IUser } from '@/dto/user.dto';

export class AuthService {
  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string
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
    });
    try {
      await generateAndSendOtp(email);
    } catch (error) {
      await User.deleteOne({ _id: user._id }); // Rollback on OTP failure
      throw new Error('Failed to send OTP');
    }
    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<IUser> {
    const isValid = await verifyOtpCode(email, otp);
    if (!isValid) throw new Error('Invalid or expired OTP');
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  async login(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUser;
  }> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
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
    const client = await getRedisClient();
    await client.setex(
      `refresh_token:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );
    return { accessToken, refreshToken, user };
  }


  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');
    try {
        await generateAndSendOtp(email);
        }
    catch (error) {
        throw new Error('Failed to send OTP');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!user.isVerified) throw new Error('User not verified');
    try {
        await generateAndSendOtp(email);
        }
    catch (error) {
        throw new Error('Failed to send OTP');
    }
  }

    async verifyForgotPasswordOtp(email: string, otp: string, newPassword: string): Promise<IUser> {
        const isValid = await verifyOtpCode(email, otp);
        if (!isValid) throw new Error('Invalid or expired OTP');
        const newPasswordhashed = await hashPassword(newPassword); 
        const user = await User.findOneAndUpdate(
            { email },
            { password: newPasswordhashed },
            { new: true }
        );
        if (!user) throw new Error('User not found');
        return user;
    }


  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const isValid = await verifyOtpCode(email, otp);
    if (!isValid) throw new Error('Invalid or expired OTP');
    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) throw new Error('User not found');
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken) as { id: string; email: string };
    const client = await getRedisClient();
    const storedToken = await client.get(`refresh_token:${payload.id}`);
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
    const client = await getRedisClient();
    await client.del(`refresh_token:${userId}`);
  }
}

export const authService = new AuthService();