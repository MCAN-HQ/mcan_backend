import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { eidService } from '../services/eidService';
import { AuthenticatedRequest } from '../types';

export const eidController = {
  getMyEid: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw createError('Unauthorized', 401);
    await eidService.ensureTable();
    const card = await eidService.getByUserId(req.user.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'E-ID not found' });
    }
    return res.json({ success: true, message: 'E-ID fetched', data: card });
  }),

  regenerateMyEid: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw createError('Unauthorized', 401);
    await eidService.ensureTable();
    const card = await eidService.generateForUser(req.user);
    return res.json({ success: true, message: 'E-ID generated', data: card });
  }),
};

export default eidController;


