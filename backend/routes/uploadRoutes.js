import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload } from '../config/cloudinary.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/upload (requires Auth & Multer middleware to process 'image' field)
router.post(
  '/',
  authenticate,
  upload.single('image'),
  uploadImage
);

export default router;
