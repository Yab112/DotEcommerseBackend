// src/services/otp.service.ts
import { getRedisClient } from '@/config/redis';
import { sendOtpEmail } from './email.service';
import { env } from '@/config/env';

const OTP_EXPIRES_IN = env.OTP_EXPIRES_IN || 600; 

export const generateAndSendOtp = async (email: string): Promise<void> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const client = await getRedisClient();
  await client.setEx(`otp:${email}`, OTP_EXPIRES_IN, otp);
  await sendOtpEmail(email, otp);
};

export const verifyOtpCode = async (email: string, otp: string): Promise<boolean> => {
  const client = await getRedisClient();
  const storedOtp = await client.get(`otp:${email}`);
  if (storedOtp !== otp) return false;
  await client.del(`otp:${email}`);
  return true;
};
