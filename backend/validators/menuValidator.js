import { body, param } from 'express-validator';
import { validate } from './validate.js';

export const validateCreateMenuItem = [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Category must be a valid MongoDB ObjectId'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array of strings'),
  body('nutrition').optional().isObject().withMessage('Nutrition details must be an object'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  validate
];

export const validateUpdateMenuItem = [
  param('id').isMongoId().withMessage('Invalid menu item ID format'),
  body('name').optional().trim().notEmpty().withMessage('Menu item name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isMongoId().withMessage('Category must be a valid MongoDB ObjectId'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  validate
];

export const validateMenuItemId = [
  param('id').isMongoId().withMessage('Invalid menu item ID format'),
  validate
];
