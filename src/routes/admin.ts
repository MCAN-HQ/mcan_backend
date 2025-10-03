import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { adminValidation } from '../utils/validation';

const router = Router();

// All admin routes require SUPER_ADMIN role
router.use(authenticate);
router.use(authorize(['SUPER_ADMIN']));

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SUPER_ADMIN required
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users:
 *   post:
 *     summary: Create a new user (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MCLO_AMEER, STATE_SECRETARY, STATE_AMEER, NATIONAL_ADMIN]
 *               stateCode:
 *                 type: string
 *               deploymentState:
 *                 type: string
 *               serviceYear:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/users',
  validateRequest(adminValidation.createUser),
  adminController.createUser
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   put:
 *     summary: Update a user (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MCLO_AMEER, STATE_SECRETARY, STATE_AMEER, NATIONAL_ADMIN]
 *               stateCode:
 *                 type: string
 *               deploymentState:
 *                 type: string
 *               serviceYear:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 */
router.put('/users/:userId',
  validateRequest(adminValidation.updateUser),
  adminController.updateUser
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       403:
 *         description: Cannot delete SUPER_ADMIN
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 */
router.post('/users/:userId/reset-password',
  validateRequest(adminValidation.resetPassword),
  adminController.resetUserPassword
);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get user statistics (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', adminController.getUserStats);

/**
 * @swagger
 * /api/v1/admin/permissions:
 *   get:
 *     summary: Get role permissions (SUPER_ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 */
router.get('/permissions', adminController.getRolePermissions);

export default router;
