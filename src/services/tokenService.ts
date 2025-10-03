import crypto from 'crypto';
import db from '../config/database';

export const tokenService = {
  generateToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  },

  async saveEmailVerification(userId: string, token: string): Promise<void> {
    await db('users').where({ id: userId }).update({
      email_verification_token: token,
      updated_at: new Date(),
    });
  },

  async verifyEmail(token: string): Promise<string | null> {
    const row = await db('users').select('id').where({ email_verification_token: token }).first();
    if (!row) return null;
    await db('users').where({ id: row.id }).update({
      is_email_verified: true,
      email_verification_token: null,
      updated_at: new Date(),
    });
    return row.id as string;
  },

  async savePasswordReset(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db('users').where({ id: userId }).update({
      password_reset_token: token,
      password_reset_expires: expiresAt,
      updated_at: new Date(),
    });
  },

  async consumePasswordReset(token: string): Promise<string | null> {
    const now = new Date();
    const row = await db('users')
      .select('id')
      .where('password_reset_token', token)
      .andWhere('password_reset_expires', '>', now)
      .first();
    if (!row) return null;
    await db('users').where({ id: row.id }).update({
      password_reset_token: null,
      password_reset_expires: null,
      updated_at: new Date(),
    });
    return row.id as string;
  },
};

export default tokenService;


