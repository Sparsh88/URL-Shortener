import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  console.log(`[Email Service] Verification link for ${email}: ${verifyUrl}`);

  const mailer = getTransporter();
  if (!mailer) {
    return;
  }

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verify your LinkForge Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #6366f1;">Welcome to LinkForge!</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Verify Email</a>
          <p style="color: #94a3b8; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`[Email Service] Failed to send email: ${(err as Error).message}`);
  }
};

export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  console.log(`[Email Service] Password Reset link for ${email}: ${resetUrl}`);

  const mailer = getTransporter();
  if (!mailer) {
    return;
  }

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset your LinkForge Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>Click the link below to set a new password for your account:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #94a3b8; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`[Email Service] Failed to send reset email: ${(err as Error).message}`);
  }
};

