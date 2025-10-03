import { Router } from 'express';
import { memberController } from '../controllers/memberController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: stateCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, EXPIRED]
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get('/',
  memberController.getAllMembers
);

/**
 * @swagger
 * /api/v1/members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
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
 *         description: Member retrieved successfully
 *       404:
 *         description: Member not found
 */
router.get('/:id',
  memberController.getMemberById
);

/**
 * @swagger
 * /api/v1/members:
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - stateCode
 *               - nyscNumber
 *               - deploymentState
 *               - serviceYear
 *             properties:
 *               userId:
 *                 type: string
 *               stateCode:
 *                 type: string
 *               nyscNumber:
 *                 type: string
 *               deploymentState:
 *                 type: string
 *               serviceYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  memberController.createMember
);

/**
 * @swagger
 * /api/v1/members/{id}:
 *   put:
 *     summary: Update member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               stateCode:
 *                 type: string
 *               nyscNumber:
 *                 type: string
 *               deploymentState:
 *                 type: string
 *               serviceYear:
 *                 type: string
 *               membershipStatus:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, EXPIRED]
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       404:
 *         description: Member not found
 */
router.put('/:id',
  memberController.updateMember
);

/**
 * @swagger
 * /api/v1/members/{id}/eid:
 *   post:
 *     summary: Generate e-ID card for member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: e-ID card generated successfully
 *       404:
 *         description: Member not found
 */
router.post('/:id/eid',
  memberController.generateEIDCard
);

/**
 * @swagger
 * /api/v1/members/{id}/eid:
 *   get:
 *     summary: Get member's e-ID card
 *     tags: [Members]
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
 *         description: e-ID card retrieved successfully
 *       404:
 *         description: e-ID card not found
 */
router.get('/:id/eid',
  memberController.getEIDCard
);

/**
 * @swagger
 * /api/v1/members/{id}/eid/download:
 *   get:
 *     summary: Download e-ID card
 *     tags: [Members]
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
 *         description: e-ID card downloaded successfully
 *       404:
 *         description: e-ID card not found
 */
router.get('/:id/eid/download',
  memberController.downloadEIDCard
);

export default router;
