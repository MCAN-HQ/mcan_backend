import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { eidService } from '../services/eidService';
import { userService } from '../services/userService';

const mapMemberRow = (row: any) => ({
  id: row.id,
  userId: row.user_id,
  user: userService.mapRowToUser({
    id: row.user_id,
    email: row.user_email,
    full_name: row.user_full_name,
    phone: row.user_phone,
    role: row.user_role,
    state_code: row.user_state_code,
    state_of_origin: row.user_state_of_origin,
    deployment_state: row.user_deployment_state,
    service_year: row.user_service_year,
    is_active: row.user_is_active,
    is_email_verified: row.user_is_email_verified,
    profile_picture: row.user_profile_picture,
    biometric_data: row.user_biometric_data,
    created_at: row.user_created_at,
    updated_at: row.user_updated_at,
  }),
  stateCode: row.state_code,
  deploymentState: row.deployment_state,
  serviceYear: row.service_year,
  membershipStatus: row.membership_status,
  paymentStatus: row.payment_status,
  registrationDate: row.registration_date,
  lastPaymentDate: row.last_payment_date,
  nextPaymentDate: row.next_payment_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const memberController = {
  getAllMembers: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
    const search = (req.query.search as string) || '';
    const stateCode = req.query.stateCode as string | undefined;
    const membershipStatus = req.query.membershipStatus as string | undefined;

    const baseQuery = db('members as m').leftJoin('users as u', 'm.user_id', 'u.id');

    if (search) {
      baseQuery.where((builder) => {
        builder
          .whereILike('u.full_name', `%${search}%`)
          .orWhereILike('u.email', `%${search}%`)
          .orWhereILike('u.phone', `%${search}%`);
      });
    }

    if (stateCode) {
      baseQuery.andWhere('m.state_code', stateCode);
    }

    if (membershipStatus) {
      baseQuery.andWhere('m.membership_status', membershipStatus);
    }

    const totalRow = await baseQuery.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? parseInt(totalRow.count, 10) : 0;

    const rows = await baseQuery
      .clone()
      .select([
        'm.*',
        'u.id as user_id',
        'u.email as user_email',
        'u.full_name as user_full_name',
        'u.phone as user_phone',
        'u.role as user_role',
        'u.state_code as user_state_code',
        'u.state_of_origin as user_state_of_origin',
        'u.deployment_state as user_deployment_state',
        'u.service_year as user_service_year',
        'u.is_active as user_is_active',
        'u.is_email_verified as user_is_email_verified',
        'u.profile_picture as user_profile_picture',
        'u.biometric_data as user_biometric_data',
        'u.created_at as user_created_at',
        'u.updated_at as user_updated_at',
      ])
      .orderBy('m.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const members = rows.map(mapMemberRow);

    res.status(200).json({
      success: true,
      message: 'Members fetched successfully',
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }),

  getMemberById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db('members as m')
      .leftJoin('users as u', 'm.user_id', 'u.id')
      .select([
        'm.*',
        'u.id as user_id',
        'u.email as user_email',
        'u.full_name as user_full_name',
        'u.phone as user_phone',
        'u.role as user_role',
        'u.state_code as user_state_code',
        'u.state_of_origin as user_state_of_origin',
        'u.deployment_state as user_deployment_state',
        'u.service_year as user_service_year',
        'u.is_active as user_is_active',
        'u.is_email_verified as user_is_email_verified',
        'u.profile_picture as user_profile_picture',
        'u.biometric_data as user_biometric_data',
        'u.created_at as user_created_at',
        'u.updated_at as user_updated_at',
      ])
      .where('m.id', id)
      .first();

    if (!row) {
      throw createError('Member not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Member fetched successfully',
      data: mapMemberRow(row),
    });
  }),

  createMember: asyncHandler(async (req: Request, res: Response) => {
    const { userId, stateCode, deploymentState, serviceYear } = req.body;
    const user = await userService.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const existingMember = await db('members').where({ user_id: userId }).first();
    if (existingMember) {
      throw createError('Member record already exists for this user', 409);
    }

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

    const created = await db('members as m')
      .leftJoin('users as u', 'm.user_id', 'u.id')
      .select([
        'm.*',
        'u.id as user_id',
        'u.email as user_email',
        'u.full_name as user_full_name',
        'u.phone as user_phone',
        'u.role as user_role',
        'u.state_code as user_state_code',
        'u.state_of_origin as user_state_of_origin',
        'u.deployment_state as user_deployment_state',
        'u.service_year as user_service_year',
        'u.is_active as user_is_active',
        'u.is_email_verified as user_is_email_verified',
        'u.profile_picture as user_profile_picture',
        'u.biometric_data as user_biometric_data',
        'u.created_at as user_created_at',
        'u.updated_at as user_updated_at',
      ])
      .where('m.id', id)
      .first();

    res.status(201).json({ success: true, message: 'Member created successfully', data: created ? mapMemberRow(created) : null });
  }),

  updateMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await db('members').where({ id }).first();
    if (!member) {
      throw createError('Member not found', 404);
    }

    const { stateCode, deploymentState, serviceYear, membershipStatus } = req.body;
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (stateCode !== undefined) updateData.state_code = stateCode;
    if (deploymentState !== undefined) updateData.deployment_state = deploymentState;
    if (serviceYear !== undefined) updateData.service_year = serviceYear;
    if (membershipStatus !== undefined) updateData.membership_status = membershipStatus;

    await db('members').where({ id }).update(updateData);

    const updated = await db('members as m')
      .leftJoin('users as u', 'm.user_id', 'u.id')
      .select([
        'm.*',
        'u.id as user_id',
        'u.email as user_email',
        'u.full_name as user_full_name',
        'u.phone as user_phone',
        'u.role as user_role',
        'u.state_code as user_state_code',
        'u.state_of_origin as user_state_of_origin',
        'u.deployment_state as user_deployment_state',
        'u.service_year as user_service_year',
        'u.is_active as user_is_active',
        'u.is_email_verified as user_is_email_verified',
        'u.profile_picture as user_profile_picture',
        'u.biometric_data as user_biometric_data',
        'u.created_at as user_created_at',
        'u.updated_at as user_updated_at',
      ])
      .where('m.id', id)
      .first();

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: updated ? mapMemberRow(updated) : null,
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
    const member = await db('members').where({ id }).first();
    if (!member) throw createError('Member not found', 404);
    const card = await db('eid_cards').where({ user_id: member.user_id }).orderBy('created_at', 'desc').first();
    if (!card) throw createError('e-ID not found', 404);
    res.status(200).json({ success: true, message: 'e-ID fetched', data: card });
  }),

  downloadEIDCard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await db('members').where({ id }).first();
    if (!member) throw createError('Member not found', 404);
    const card = await db('eid_cards').where({ user_id: member.user_id }).orderBy('created_at', 'desc').first();
    if (!card) throw createError('e-ID not found', 404);
    res.status(200).json({
      success: true,
      message: 'e-ID download ready',
      data: {
        svgMarkup: card.svg_markup,
        version: card.version,
      },
    });
  }),
};
