import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { User, UserRole } from '../types';

export const adminController = {
  // Get all users (SUPER_ADMIN only)
  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');
    
    const users = await db('users')
      .select([
        'id',
        'email',
        'full_name',
        'phone',
        'role',
        'state_code',
        'deployment_state',
        'service_year',
        'is_active',
        'is_email_verified',
        'created_at',
        'updated_at'
      ])
      .orderBy('created_at', 'desc');

    const formattedUsers = users.map(user => userService.mapRowToUser(user));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: formattedUsers,
    });
  }),

  // Create user (SUPER_ADMIN only)
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');
    const {
      fullName,
      email,
      phone,
      role,
      stateCode,
      deploymentState,
      serviceYear,
      password = 'TempPassword123!', // Default password for admin-created users
    } = req.body;

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Create user
    const newUser = {
      id: uuidv4(),
      email,
      full_name: fullName,
      phone,
      password_hash: passwordHash,
      role: role || 'MEMBER',
      state_code: stateCode || null,
      deployment_state: deploymentState || null,
      service_year: serviceYear || null,
      is_active: true,
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('users').insert(newUser);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = newUser;
    const formattedUser = userService.mapRowToUser(userWithoutPassword);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formattedUser,
    });
  }),

  // Update user (SUPER_ADMIN only)
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');
    const { userId } = req.params;
    const {
      fullName,
      email,
      phone,
      role,
      stateCode,
      deploymentState,
      serviceYear,
      isActive,
    } = req.body;

    // Check if user exists
    const existingUser = await userService.findById(userId);
    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await userService.findByEmail(email);
      if (emailExists) {
        throw createError('Email already in use', 409);
      }
    }

    // Update user
    const updateData: any = {
      updated_at: new Date(),
    };

    if (fullName) updateData.full_name = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (stateCode !== undefined) updateData.state_code = stateCode;
    if (deploymentState !== undefined) updateData.deployment_state = deploymentState;
    if (serviceYear !== undefined) updateData.service_year = serviceYear;
    if (isActive !== undefined) updateData.is_active = isActive;

    await db('users').where({ id: userId }).update(updateData);

    // Get updated user
    const updatedUser = await userService.findById(userId);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  }),

  // Delete user (SUPER_ADMIN only)
  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await userService.findById(userId);
    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Prevent deletion of SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN') {
      throw createError('Cannot delete SUPER_ADMIN user', 403);
    }

    // Soft delete by setting is_active to false
    await db('users').where({ id: userId }).update({
      is_active: false,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  }),

  // Reset user password (SUPER_ADMIN only)
  resetUserPassword: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const existingUser = await userService.findById(userId);
    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Update password
    await db('users').where({ id: userId }).update({
      password_hash: passwordHash,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  }),

  // Get user statistics
  getUserStats: asyncHandler(async (req: Request, res: Response) => {
    const { db } = await import('../config/database');

    const stats = await db('users')
      .select('role')
      .count('* as count')
      .groupBy('role');

    const totalUsers = await db('users').count('* as count').first();
    const activeUsers = await db('users').where('is_active', true).count('* as count').first();
    const verifiedUsers = await db('users').where('is_email_verified', true).count('* as count').first();

    const roleStats = stats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count as string);
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        total: parseInt(totalUsers?.count as string) || 0,
        active: parseInt(activeUsers?.count as string) || 0,
        verified: parseInt(verifiedUsers?.count as string) || 0,
        byRole: roleStats,
      },
    });
  }),

  // Get role permissions
  getRolePermissions: asyncHandler(async (req: Request, res: Response) => {
    const permissions = {
      SUPER_ADMIN: {
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canManageProperties: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSystem: true,
        canAccessAllStates: true,
      },
      NATIONAL_ADMIN: {
        canCreateUsers: false,
        canEditUsers: true,
        canDeleteUsers: false,
        canManageProperties: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSystem: false,
        canAccessAllStates: true,
      },
      STATE_AMEER: {
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canManageProperties: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSystem: false,
        canAccessAllStates: false,
      },
      STATE_SECRETARY: {
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canManageProperties: true,
        canManagePayments: true,
        canViewAnalytics: false,
        canManageSystem: false,
        canAccessAllStates: false,
      },
      MCLO_AMEER: {
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canManageProperties: false,
        canManagePayments: false,
        canViewAnalytics: false,
        canManageSystem: false,
        canAccessAllStates: false,
      },
      MEMBER: {
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canManageProperties: false,
        canManagePayments: false,
        canViewAnalytics: false,
        canManageSystem: false,
        canAccessAllStates: false,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Role permissions retrieved successfully',
      data: permissions,
    });
  }),
};

export default adminController;
