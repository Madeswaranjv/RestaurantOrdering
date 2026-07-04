import { body } from 'express-validator';
import { validate } from './validate.js';

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty if provided'),
  body('role').optional().isIn(['customer', 'deliveryPartner', 'admin']).withMessage('Invalid user role'),
  validate
];

export const validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

export const validateForgotPassword = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  validate
];

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validate
];
