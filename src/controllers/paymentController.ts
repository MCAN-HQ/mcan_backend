import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { flutterwaveService } from '../services/flutterwaveService';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const paymentController = {
  getAllPayments: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement get all payments
    logger.info('Get all payments endpoint called');
    res.status(200).json({
      success: true,
      message: 'Get all payments endpoint - implementation pending',
      data: [],
    });
  }),

  getPaymentById: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement get payment by ID
    logger.info('Get payment by ID endpoint called');
    res.status(200).json({
      success: true,
      message: 'Get payment by ID endpoint - implementation pending',
      data: null,
    });
  }),

  createPaymentConsent: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const memberId = authReq.user?.id;
    const { monthlyAmount, paymentMethod, autoDeduction, bankDetails } = req.body;
    const id = uuidv4();
    await db('payment_consents').insert({
      id,
      member_id: memberId,
      monthly_amount: monthlyAmount,
      consent_given: true,
      consent_date: new Date(),
      payment_method: paymentMethod,
      bank_details: bankDetails || null,
      auto_deduction: !!autoDeduction,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json({ success: true, message: 'Consent saved', data: { id } });
  }),

  getPaymentConsent: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement get payment consent
    logger.info('Get payment consent endpoint called');
    res.status(200).json({
      success: true,
      message: 'Get payment consent endpoint - implementation pending',
      data: null,
    });
  }),

  updatePaymentConsent: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement update payment consent
    logger.info('Update payment consent endpoint called');
    res.status(200).json({
      success: true,
      message: 'Update payment consent endpoint - implementation pending',
      data: null,
    });
  }),

  initializePayment: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const { amount, paymentMethod, description } = req.body as { amount: number; paymentMethod: string; description: string };
    const tx_ref = `MCAN_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const user = authReq.user;
    const init = await flutterwaveService.initializePayment({
      tx_ref,
      amount,
      customer: { email: user.email, name: user.fullName, phonenumber: user.phone },
      payment_options: 'card,banktransfer,ussd',
      meta: { description },
    });
    // save pending payment
    const id = uuidv4();
    await db('payments').insert({
      id,
      member_id: user.id,
      amount,
      currency: 'NGN',
      status: 'PENDING',
      payment_method: paymentMethod,
      transaction_reference: tx_ref,
      description,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json({ success: true, message: 'Payment initialized', data: init });
  }),

  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const { transactionReference } = req.body as { transactionReference: string };
    const verify = await flutterwaveService.verifyTransaction(transactionReference);
    if (verify?.status !== 'success') throw createError('Verification failed', 400);
    await db('payments').where({ transaction_reference: transactionReference }).update({
      status: 'COMPLETED',
      flutterwave_reference: verify?.data?.id?.toString() || null,
      payment_date: new Date(),
      updated_at: new Date(),
    });
    res.status(200).json({ success: true, message: 'Payment verified', data: verify });
  }),

  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const event = req.body;
    try {
      if (event?.data?.tx_ref && event?.data?.status === 'successful') {
        await db('payments').where({ transaction_reference: event.data.tx_ref }).update({
          status: 'COMPLETED',
          flutterwave_reference: event.data.id?.toString() || null,
          payment_date: new Date(),
          updated_at: new Date(),
        });
      }
      res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (e) {
      logger.error('Webhook error', e);
      res.status(200).json({ success: true });
    }
  }),
};
