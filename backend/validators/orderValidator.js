import { body, param } from 'express-validator';
import { validate } from './validate.js';

export const validateCreateOrder = [
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
  body('paymentMethod').optional().isIn(['COD', 'RAZORPAY', 'STRIPE']).withMessage('Invalid payment method selection'),
  validate
];

export const validateUpdateOrderStatus = [
  param('id').isMongoId().withMessage('Invalid order ID format'),
  body('status').isIn(['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .withMessage('Invalid order status value'),
  validate
];

export const validateOrderId = [
  param('id').isMongoId().withMessage('Invalid order ID format'),
  validate
];
