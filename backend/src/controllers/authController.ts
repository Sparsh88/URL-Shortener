import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { sendSuccess, sendError } from '../utils/response';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/jwt';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: any, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Only the designated admin email can have admin role
    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();
    const role = email.toLowerCase() === adminEmail ? 'admin' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      'Registration successful. Please check your email to verify your account.',
      201
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const login = async (req: any, res: Response): Promise<any> => {
  try {
    const { email, password, requiredRole } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.isSuspended) {
      return sendError(res, 'Your account has been suspended by an administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();
    if (requiredRole && requiredRole === 'admin') {
      if (user.role !== 'admin' || user.email.toLowerCase() !== adminEmail) {
        return sendError(res, 'Access Denied: Administrator privileges required to log in via Admin Portal.', 403);
      }
    }


    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to DB
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, refreshToken);

    return sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
        },
      },
      'Login successful'
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return sendError(res, 'Refresh token missing', 401);
    }

    const decoded = verifyRefreshToken(token);
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return sendError(res, 'Invalid or revoked refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.isSuspended) {
      return sendError(res, 'User not found or suspended', 401);
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Replace old refresh token
    await RefreshToken.deleteOne({ token });
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    clearRefreshCookie(res);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return sendError(res, 'Verification token is required', 400);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Email verified successfully! You can now log in.');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendSuccess(res, null, 'If that email exists in our system, a password reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    return sendSuccess(res, null, 'If that email exists in our system, a password reset link has been sent.');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset token', 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful. You may now log in with your new password.');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const user = await User.findById(req.user.userId);
    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};
