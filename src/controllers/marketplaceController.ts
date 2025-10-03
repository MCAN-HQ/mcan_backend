import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const marketplaceController = {
  getAllProducts: asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 12, search, category, minPrice, maxPrice } = req.query as any;
    let query = db('products').select('*').where({ is_available: true });
    if (search) query = query.whereILike('name', `%${search}%`);
    if (category) query = query.where('category', category);
    if (minPrice) query = query.where('price', '>=', Number(minPrice));
    if (maxPrice) query = query.where('price', '<=', Number(maxPrice));
    const data = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));
    res.status(200).json({ success: true, message: 'Products fetched', data });
  }),

  getProductById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db('products').where({ id }).first();
    if (!row) throw createError('Product not found', 404);
    res.status(200).json({ success: true, message: 'Product fetched', data: row });
  }),

  getUserOrders: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const rows = await db('orders').where({ member_id: userId }).orderBy('order_date', 'desc');
    res.status(200).json({ success: true, message: 'Orders fetched', data: rows });
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db('orders').where({ id }).first();
    if (!row) throw createError('Order not found', 404);
    res.status(200).json({ success: true, message: 'Order fetched', data: row });
  }),

  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { items, shippingAddress } = req.body as { items: { productId: string; quantity: number }[]; shippingAddress: any };
    const prodRows = await db('products').whereIn('id', items.map((i) => i.productId));
    const priceMap = new Map(prodRows.map((p: any) => [p.id, p.price]));
    const detailed = items.map((i: { productId: string; quantity: number }) => ({
      productId: i.productId,
      productName: prodRows.find((p: any) => p.id === i.productId)?.name || '',
      quantity: i.quantity,
      price: Number(priceMap.get(i.productId) || 0),
      total: Number(priceMap.get(i.productId) || 0) * Number(i.quantity),
    }));
    const totalAmount = detailed.reduce((s: number, i: { total: number }) => s + Number(i.total), 0);
    const id = uuidv4();
    await db('orders').insert({
      id,
      member_id: userId,
      items: JSON.stringify(detailed),
      total_amount: totalAmount,
      currency: 'NGN',
      status: 'PENDING',
      payment_status: 'PENDING',
      shipping_address: shippingAddress,
      order_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json({ success: true, message: 'Order created', data: { id, totalAmount } });
  }),

  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await db('orders').where({ id }).update({ status: 'CANCELLED', updated_at: new Date() });
    res.status(200).json({ success: true, message: 'Order cancelled' });
  }),

  getCart: asyncHandler(async (req: Request, res: Response) => {
    // Placeholder in-DB cart could be implemented; return empty for now
    res.status(200).json({ success: true, message: 'Cart fetched', data: { items: [] } });
  }),

  addToCart: asyncHandler(async (req: Request, res: Response) => {
    // Placeholder
    res.status(200).json({ success: true, message: 'Item added to cart' });
  }),

  removeFromCart: asyncHandler(async (req: Request, res: Response) => {
    // Placeholder
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  }),
};
