import { Router } from 'express';
import { createPayment, verifyPayment } from '../controllers/paymentController.js';
import { validateCreatePayment, validateVerifyPayment } from '../validators/paymentValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all payment routes
router.use(authenticate);

router.post('/create', validateCreatePayment, createPayment);
router.post('/verify', validateVerifyPayment, verifyPayment);

export default router;
