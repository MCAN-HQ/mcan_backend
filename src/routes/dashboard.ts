import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/stats',
  dashboardController.getDashboardStats
);

/**
 * @swagger
 * /api/v1/dashboard/members:
 *   get:
 *     summary: Get member statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Member statistics retrieved successfully
 */
router.get('/members',
  dashboardController.getMemberStats
);

/**
 * @swagger
 * /api/v1/dashboard/revenue:
 *   get:
 *     summary: Get revenue statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Revenue statistics retrieved successfully
 */
router.get('/revenue',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  dashboardController.getRevenueStats
);

/**
 * @swagger
 * /api/v1/dashboard/states:
 *   get:
 *     summary: Get state-wise statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: State statistics retrieved successfully
 */
router.get('/states',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN']),
  dashboardController.getStateStats
);

/**
 * @swagger
 * /api/v1/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 */
router.get('/recent-activities',
  dashboardController.getRecentActivities
);

/**
 * @swagger
 * /api/v1/dashboard/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/notifications',
  dashboardController.getNotifications
);

/**
 * @swagger
 * /api/v1/dashboard/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/notifications/:id/read',
  dashboardController.markNotificationAsRead
);

/**
 * @swagger
 * /api/v1/dashboard/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/notifications/read-all',
  dashboardController.markAllNotificationsAsRead
);

/**
 * @swagger
 * /api/v1/dashboard/reports:
 *   get:
 *     summary: Get dashboard reports
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [members, payments, properties, orders]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
router.get('/reports',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  dashboardController.getReports
);

export default router;
