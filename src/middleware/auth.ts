import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, JWTPayload, AuthenticatedRequest } from '../types';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

export const authenticate = async (
  req: AuthenticatedRequest & Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers?.authorization as string | undefined;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw createError('Access token is required', 401);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // TODO: Fetch user from database using decoded.userId
    // For now, we'll create a mock user object
    const user: User = {
      id: decoded.userId,
      email: decoded.email,
      fullName: 'Mock User',
      phone: '+2348000000000',
      role: decoded.role,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired', 401));
    }
    
    next(error);
  }
};

export default authenticate;
