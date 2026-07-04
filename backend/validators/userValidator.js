import { body, param } from 'express-validator';
import { validate } from './validate.js';

export const validateUpdateProfile = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL or path'),
  validate
];

export const validateChangePassword = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validate
];

export const validateAddress = [
  body('label').trim().notEmpty().withMessage('Address label is required (e.g. Home, Office)'),
  body('address').trim().notEmpty().withMessage('Address line is required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  validate
];

export const validateAddressId = [
  param('id').isMongoId().withMessage('Invalid address ID format'),
  validate
];
