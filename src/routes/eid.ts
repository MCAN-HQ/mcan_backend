import { Router } from 'express';
import { eidController } from '../controllers/eidController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/eid/me:
 *   get:
 *     summary: Get current user's E-ID card
 *     tags: [EID]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: E-ID fetched
 *       404:
 *         description: Not found
 */
router.get('/me', authenticate, eidController.getMyEid);

/**
 * @swagger
 * /api/v1/eid/me:
 *   post:
 *     summary: Generate/regenerate current user's E-ID card
 *     tags: [EID]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: E-ID generated
 */
router.post('/me', authenticate, eidController.regenerateMyEid);

export default router;


