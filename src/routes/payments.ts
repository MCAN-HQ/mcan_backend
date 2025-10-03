import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
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
 *         name: memberId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get('/',
  paymentController.getAllPayments
);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get('/:id',
  paymentController.getPaymentById
);

/**
 * @swagger
 * /api/v1/payments/consent:
 *   post:
 *     summary: Create payment consent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyAmount
 *               - paymentMethod
 *               - autoDeduction
 *             properties:
 *               monthlyAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               autoDeduction:
 *                 type: boolean
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   accountName:
 *                     type: string
 *                   bankCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: Payment consent created successfully
 */
router.post('/consent',
  paymentController.createPaymentConsent
);

/**
 * @swagger
 * /api/v1/payments/consent/{id}:
 *   get:
 *     summary: Get payment consent by ID
 *     tags: [Payments]
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
 *         description: Payment consent retrieved successfully
 *       404:
 *         description: Payment consent not found
 */
router.get('/consent/:id',
  paymentController.getPaymentConsent
);

/**
 * @swagger
 * /api/v1/payments/consent/{id}:
 *   put:
 *     summary: Update payment consent
 *     tags: [Payments]
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
 *               monthlyAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               autoDeduction:
 *                 type: boolean
 *               bankDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment consent updated successfully
 */
router.put('/consent/:id',
  paymentController.updatePaymentConsent
);

/**
 * @swagger
 * /api/v1/payments/initialize:
 *   post:
 *     summary: Initialize payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, CARD, USSD, ALLOWANCE_DEDUCTION]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 */
router.post('/initialize',
  paymentController.initializePayment
);

/**
 * @swagger
 * /api/v1/payments/verify:
 *   post:
 *     summary: Verify payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionReference
 *             properties:
 *               transactionReference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.post('/verify',
  paymentController.verifyPayment
);

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Payment webhook (Flutterwave)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook',
  paymentController.handleWebhook
);

export default router;
