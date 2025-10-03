import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { eidService } from '../services/eidService';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { RegisterData } from '../types';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as RegisterData;

    const existing = await userService.findByEmail(data.email);
    if (existing) {
      throw createError('User with this email already exists', 409);
    }

    const user = await userService.createUser(data);
    try {
      await eidService.ensureTable();
      await eidService.generateForUser(user);
    } catch (e) {
      // Non-blocking: log but don't fail registration
      logger.warn('E-ID generation failed during registration', e as any);
    }
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token, refreshToken },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };

    const row = await userService.findByEmail(email);
    if (!row) {
      throw createError('Invalid credentials', 401);
    }

    // Fetch password hash
    const pwdRow = await (await import('../config/database')).default('users')
      .select('password_hash')
      .where({ id: row.id })
      .first();
    const isMatch = await bcrypt.compare(password, pwdRow.password_hash);
    if (!isMatch) {
      throw createError('Invalid credentials', 401);
    }

    const token = signAccessToken(row);
    const refreshToken = signRefreshToken(row);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: row, token, refreshToken },
    });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const userId = authReq.user?.id;
    const user = userId ? await userService.findById(userId) : null;
    if (!user) {
      throw createError('User not found', 404);
    }
    res.status(200).json({ success: true, message: 'Profile fetched', data: user });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) throw createError('Refresh token required', 400);

    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);
    const user = await userService.findById(payload.userId);
    if (!user) throw createError('Invalid refresh token', 401);

    const newAccess = signAccessToken(user);
    res.status(200).json({ success: true, message: 'Token refreshed', data: { token: newAccess } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Logged out', data: null });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(200).json({ success: true, message: 'If account exists, email sent' });
    }
    const { tokenService } = await import('../services/tokenService');
    const { emailService } = await import('../services/emailService');
    const token = tokenService.generateToken(24);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await tokenService.savePasswordReset(user.id, token, expires);
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await emailService.sendMail(user.email, 'Reset your MCAN password', `<p>Click to reset: <a href="${link}">${link}</a></p>`);
    return res.status(200).json({ success: true, message: 'If account exists, email sent' });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body as { token: string; password: string };
    const { tokenService } = await import('../services/tokenService');
    const userId = await tokenService.consumePasswordReset(token);
    if (!userId) throw createError('Invalid or expired token', 400);
    const bcrypt = await import('bcryptjs');
    const password_hash = await bcrypt.default.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const db = (await import('../config/database')).default;
    await db('users').where({ id: userId }).update({ password_hash, updated_at: new Date() });
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const authReq = req as any;
    const userId = authReq.user?.id;
    const db = (await import('../config/database')).default;
    const row = await db('users').select('password_hash').where({ id: userId }).first();
    const isMatch = await bcrypt.compare(currentPassword, row.password_hash);
    if (!isMatch) throw createError('Current password is incorrect', 400);
    const newHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    await db('users').where({ id: userId }).update({ password_hash: newHash, updated_at: new Date() });
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body as { token: string };
    const { tokenService } = await import('../services/tokenService');
    const userId = await tokenService.verifyEmail(token);
    if (!userId) throw createError('Invalid or expired token', 400);
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  }),

  resendVerification: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const db = (await import('../config/database')).default;
    const user = await userService.findById(authReq.user?.id);
    if (!user) throw createError('User not found', 404);
    if (user.isEmailVerified) return res.status(200).json({ success: true, message: 'Already verified' });
    const { tokenService } = await import('../services/tokenService');
    const { emailService } = await import('../services/emailService');
    const token = tokenService.generateToken(24);
    await tokenService.saveEmailVerification(user.id, token);
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    await emailService.sendMail(user.email, 'Verify your MCAN email', `<p>Verify your email: <a href="${link}">${link}</a></p>`);
    return res.status(200).json({ success: true, message: 'Verification email sent' });
  }),
};
