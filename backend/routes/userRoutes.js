import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleSaveRestaurant
} from '../controllers/userController.js';
import {
  validateUpdateProfile,
  validateChangePassword,
  validateAddress,
  validateAddressId
} from '../validators/userValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all user endpoints
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);

// Addresses
router.post('/address', validateAddress, addAddress);
router.put('/address/:id', validateAddressId, validateAddress, updateAddress);
router.delete('/address/:id', validateAddressId, deleteAddress);

// Save/unsave restaurant
router.put('/save-restaurant/:id', toggleSaveRestaurant);

export default router;
