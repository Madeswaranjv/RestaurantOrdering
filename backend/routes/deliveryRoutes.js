import { Router } from 'express';
import {
  getAvailableOrders,
  acceptOrder,
  pickupOrder,
  deliverOrder,
  getHistory,
  getEarnings,
  getDashboard
} from '../controllers/deliveryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { param } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

const validateOrderIdParam = [
  param('orderId').isMongoId().withMessage('Invalid Order ID format'),
  validate
];

// Secure all delivery endpoints to deliveryPartner role
router.use(authenticate, authorizeRoles('deliveryPartner'));

router.get('/orders', getAvailableOrders);
router.put('/accept/:orderId', validateOrderIdParam, acceptOrder);
router.put('/pickup/:orderId', validateOrderIdParam, pickupOrder);
router.put('/deliver/:orderId', validateOrderIdParam, deliverOrder);
router.get('/history', getHistory);
router.get('/earnings', getEarnings);
router.get('/dashboard', getDashboard);

export default router;
