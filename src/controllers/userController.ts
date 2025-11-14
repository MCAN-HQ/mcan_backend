import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import db from '../config/database';
import { userService } from '../services/userService';

const USER_SELECT_FIELDS = [
  'id',
  'email',
  'full_name',
  'phone',
  'role',
  'state_code',
  'state_of_origin',
  'deployment_state',
  'service_year',
  'is_active',
  'is_email_verified',
  'profile_picture',
  'biometric_data',
  'created_at',
  'updated_at',
] as const;

export const userController = {
  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
    const search = (req.query.search as string) || '';
    const role = req.query.role as string | undefined;
    const stateCode = req.query.stateCode as string | undefined;

    const query = db('users');

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('full_name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('phone', `%${search}%`);
      });
    }

    if (role) {
      query.andWhere('role', role);
    }

    if (stateCode) {
      query.andWhere('state_code', stateCode);
    }

    const totalRow = await query.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? parseInt(totalRow.count, 10) : 0;

    const rows = await query
      .clone()
      .select(...USER_SELECT_FIELDS)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const users = rows.map((row) => userService.mapRowToUser(row));

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
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

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }
    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await db('users').where({ id }).first();
    if (!existing) {
      throw createError('User not found', 404);
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    const { fullName, phone, stateCode, stateOfOrigin, deploymentState, serviceYear } = req.body;

    if (fullName !== undefined) updateData.full_name = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (stateCode !== undefined) updateData.state_code = stateCode;
    if (stateOfOrigin !== undefined) updateData.state_of_origin = stateOfOrigin;
    if (deploymentState !== undefined) updateData.deployment_state = deploymentState;
    if (serviceYear !== undefined) updateData.service_year = serviceYear;

    await db('users').where({ id }).update(updateData);

    const updated = await userService.findById(id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated,
    });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await db('users').where({ id }).first();
    if (!existing) {
      throw createError('User not found', 404);
    }

    if (existing.role === 'SUPER_ADMIN') {
      throw createError('Cannot delete SUPER_ADMIN', 403);
    }

    await db('users').where({ id }).update({
      is_active: false,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  }),

  activateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await db('users').where({ id }).first();
    if (!user) {
      throw createError('User not found', 404);
    }

    await db('users').where({ id }).update({
      is_active: true,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
    });
  }),

  deactivateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await db('users').where({ id }).first();
    if (!user) {
      throw createError('User not found', 404);
    }

    await db('users').where({ id }).update({
      is_active: false,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  }),
};
