import { body } from 'express-validator';
import { validate } from './validate.js';

export const validateCreatePayment = [
  body('orderId').isMongoId().withMessage('Valid Order ID is required to initiate a payment'),
  body('paymentMethod').isIn(['COD', 'RAZORPAY', 'STRIPE']).withMessage('Payment method must be COD, RAZORPAY, or STRIPE'),
  validate
];

export const validateVerifyPayment = [
  body('orderId').isMongoId().withMessage('Valid Order ID is required for verification'),
  body('paymentMethod').isIn(['RAZORPAY', 'STRIPE']).withMessage('Online payment verification is restricted to RAZORPAY or STRIPE'),
  // Stripe uses paymentIntent ID, Razorpay uses paymentId + signature
  body('transactionId').trim().notEmpty().withMessage('Transaction/Payment ID is required'),
  body('signature').optional().trim().notEmpty().withMessage('Signature is required for Razorpay verification'),
  validate
];
