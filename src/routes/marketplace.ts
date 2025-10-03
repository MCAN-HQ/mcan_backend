import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/marketplace/products:
 *   get:
 *     summary: Get all products
 *     tags: [Marketplace]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FOOD_PACKAGES, BASIC_ITEMS, ISLAMIC_BOOKS, CLOTHING, ELECTRONICS, OTHER]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/products',
  marketplaceController.getAllProducts
);

/**
 * @swagger
 * /api/v1/marketplace/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Marketplace]
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
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:id',
  marketplaceController.getProductById
);

/**
 * @swagger
 * /api/v1/marketplace/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Marketplace]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/orders',
  marketplaceController.getUserOrders
);

/**
 * @swagger
 * /api/v1/marketplace/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Marketplace]
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
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id',
  marketplaceController.getOrderById
);

/**
 * @swagger
 * /api/v1/marketplace/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/orders',
  marketplaceController.createOrder
);

/**
 * @swagger
 * /api/v1/marketplace/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Marketplace]
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
 *         description: Order cancelled successfully
 */
router.patch('/orders/:id/cancel',
  marketplaceController.cancelOrder
);

/**
 * @swagger
 * /api/v1/marketplace/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/cart',
  marketplaceController.getCart
);

/**
 * @swagger
 * /api/v1/marketplace/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 */
router.post('/cart',
  marketplaceController.addToCart
);

/**
 * @swagger
 * /api/v1/marketplace/cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 */
router.delete('/cart/:productId',
  marketplaceController.removeFromCart
);

export default router;
