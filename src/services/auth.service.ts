// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendOtpEmail } from './email.service';
import { getRedisClient, RedisClient } from '../config/redis';
import User from '@/models/User.nodel';

export class AuthService {
  static async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();
    return user;
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin ?? false,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    return { accessToken, refreshToken, user };
  }

  static async generateOtp(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const client: RedisClient = await getRedisClient();
    // Store OTP in Redis with 10-minute expiration
    await client.setEx(`otp:${email}`, 10 * 60, otp);
    await sendOtpEmail(email, otp);
  }

  static async verifyOtp(email: string, otp: string) {
    const client: RedisClient = await getRedisClient();
    // Retrieve OTP from Redis
    const storedOtp = await client.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    // Delete OTP from Redis after verification
    await client.del(`otp:${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
       isAdmin: user.isAdmin ?? false,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    return { accessToken, refreshToken, user };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken) as { id: string; email: string };
      const user = await User.findById(payload.id);
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
         isAdmin: user.isAdmin ?? false,
      });
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}