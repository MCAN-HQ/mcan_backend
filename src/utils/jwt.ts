import jwt from 'jsonwebtoken';
import { JWTPayload, User } from '../types';

// Use numeric expirations to satisfy jsonwebtoken v9 types
const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '604800', 10); // 7d
const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '2592000', 10); // 30d

export const signAccessToken = (user: User): string => {
  const payload: Partial<JWTPayload> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

export const signRefreshToken = (user: User): string => {
  const payload: Partial<JWTPayload> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JWTPayload;
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};


