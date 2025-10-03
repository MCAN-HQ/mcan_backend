import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export const validateRequest = (validationSchema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = validationSchema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const validationErrors = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        
        throw createError('Validation failed', 400);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
