import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { eidService } from '../services/eidService';

export const memberController = {
  getAllMembers: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement get all members
    logger.info('Get all members endpoint called');
    res.status(200).json({
      success: true,
      message: 'Get all members endpoint - implementation pending',
      data: [],
    });
  }),

  getMemberById: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement get member by ID
    logger.info('Get member by ID endpoint called');
    res.status(200).json({
      success: true,
      message: 'Get member by ID endpoint - implementation pending',
      data: null,
    });
  }),

  createMember: asyncHandler(async (req: Request, res: Response) => {
    const { userId, stateCode, deploymentState, serviceYear } = req.body;
    const id = uuidv4();
    await db('members').insert({
      id,
      user_id: userId,
      state_code: stateCode,
      deployment_state: deploymentState,
      service_year: serviceYear,
      membership_status: 'ACTIVE',
      payment_status: 'CURRENT',
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json({ success: true, message: 'Member created', data: { id } });
  }),

  updateMember: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement update member
    logger.info('Update member endpoint called');
    res.status(200).json({
      success: true,
      message: 'Update member endpoint - implementation pending',
      data: null,
    });
  }),

  generateEIDCard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await db('members').where({ id }).first();
    if (!member) throw createError('Member not found', 404);
    const card = await eidService.generate(id);
    res.status(201).json({ success: true, message: 'e-ID generated', data: card });
  }),

  getEIDCard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const card = await db('eid_cards').where({ member_id: id }).orderBy('issue_date', 'desc').first();
    if (!card) throw createError('e-ID not found', 404);
    res.status(200).json({ success: true, message: 'e-ID fetched', data: card });
  }),

  downloadEIDCard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const card = await db('eid_cards').where({ member_id: id }).orderBy('issue_date', 'desc').first();
    if (!card) throw createError('e-ID not found', 404);
    res.status(200).json({ success: true, message: 'e-ID download', data: { url: card.download_url || card.qr_code } });
  }),
};
