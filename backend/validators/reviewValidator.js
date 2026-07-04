import { body, param } from 'express-validator';
import { validate } from './validate.js';

export const validateCreateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  body('reviewType').isIn(['Restaurant', 'Food', 'Order']).withMessage('Review type must be one of: Restaurant, Food, Order'),
  body('referenceId').isMongoId().withMessage('Reference ID must be a valid MongoDB ObjectId'),
  validate
];

export const validateReviewId = [
  param('id').isMongoId().withMessage('Invalid review ID format'),
  validate
];
