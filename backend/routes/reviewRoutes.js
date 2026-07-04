import { Router } from 'express';
import { createReview, getReviews, deleteReview } from '../controllers/reviewController.js';
import { validateCreateReview, validateReviewId } from '../validators/reviewValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// GET reviews is public
router.get('/', getReviews);

// POST/DELETE reviews require authentication
router.post('/', authenticate, validateCreateReview, createReview);
router.delete('/:id', authenticate, validateReviewId, deleteReview);

export default router;
