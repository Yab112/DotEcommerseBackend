// src/services/otp.service.ts
import { getRedisClient } from '@/config/redis';
import { sendOtpEmail } from './email.service';
import { env } from '@/config/env';

const OTP_EXPIRES_IN = env.OTP_EXPIRES_IN || 6000; 

export const generateAndSendOtp = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const client = await getRedisClient();
  try {
    await client.setex(`otp:${normalizedEmail}`, OTP_EXPIRES_IN, otp);
    const stored = await client.get(`otp:${normalizedEmail}`);
    if (!stored) {
      console.error(`Failed to verify OTP storage for ${normalizedEmail}`);
      throw new Error('Failed to store OTP');
    }
    console.log(`Stored OTP for ${normalizedEmail}: ${otp}, TTL: ${OTP_EXPIRES_IN}s`);
  } catch (err) {
    console.error(`Error storing OTP for ${normalizedEmail}:`, err);
    throw new Error('Failed to store OTP');
  }
  await sendOtpEmail(normalizedEmail, otp);
};

export const verifyOtpCode = async (email: string, otp: string): Promise<boolean> => {
  const client = await getRedisClient();
  const storedOtp = await client.get(`otp:${email}`);
  console.log(`Verifying OTP: email=${email}, storedOtp=${storedOtp}, providedOtp=${otp}`);
  if (storedOtp !== otp) {
    console.log(`OTP mismatch: storedOtp=${storedOtp}, providedOtp=${otp}`);
    return false;
  }
  await client.del(`otp:${email}`);
  console.log(`OTP verified, deleted key: otp:${email}`);
  return true;
};
