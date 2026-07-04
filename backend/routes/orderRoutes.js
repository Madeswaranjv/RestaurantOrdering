import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { validateCreateOrder, validateOrderId } from '../validators/orderValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all order endpoints
router.use(authenticate);

router.post('/', validateCreateOrder, createOrder);
router.get('/', getOrders);
router.get('/:id', validateOrderId, getOrderById);
router.put('/cancel/:id', validateOrderId, cancelOrder);

export default router;
