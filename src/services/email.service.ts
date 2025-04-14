// src/services/email.service.ts
import { env } from '@/config/env';

import { transporter } from '../config/nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
