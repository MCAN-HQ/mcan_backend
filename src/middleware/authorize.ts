import { Response, NextFunction } from 'express';
import { UserRole, AuthenticatedRequest } from '../types';
import { createError } from './errorHandler';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        throw createError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
