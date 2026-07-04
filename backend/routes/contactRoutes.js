import { Router } from 'express';
import { submitInquiry } from '../controllers/contactController.js';
import { validateCreateContact } from '../validators/contactValidator.js';

const router = Router();

// POST /api/contact (Public)
router.post('/', validateCreateContact, submitInquiry);

export default router;
