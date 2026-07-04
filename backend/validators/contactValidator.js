import { body } from 'express-validator';
import { validate } from './validate.js';

export const validateCreateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty if specified'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate
];
