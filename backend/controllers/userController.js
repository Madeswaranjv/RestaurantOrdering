import UserRepository from '../repositories/UserRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user._id);
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, 'User profile retrieved successfully')
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await UserRepository.updateById(req.user._id, updateData);
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, 'Profile updated successfully')
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await UserRepository.findById(req.user._id);
  
  // Verify old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid old password');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully')
  );
});

export const addAddress = asyncHandler(async (req, res) => {
  const { label, address, isDefault } = req.body;

  const user = await UserRepository.findById(req.user._id);

  // If new address is default, clear existing default addresses
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    label,
    address,
    isDefault: isDefault || user.addresses.length === 0 // Default if it's the first address
  });

  await user.save();
  user.password = undefined;

  res.status(201).json(
    new ApiResponse(201, { addresses: user.addresses }, 'Address added successfully')
  );
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label, address, isDefault } = req.body;

  const user = await UserRepository.findById(req.user._id);
  const targetAddress = user.addresses.id(id);

  if (!targetAddress) {
    throw new ApiError(404, 'Address not found');
  }

  if (label) targetAddress.label = label;
  if (address) targetAddress.address = address;

  if (isDefault !== undefined) {
    targetAddress.isDefault = isDefault;
    if (isDefault) {
      // Set all other addresses isDefault to false
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== id) {
          addr.isDefault = false;
        }
      });
    }
  }

  await user.save();
  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, 'Address updated successfully')
  );
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserRepository.findById(req.user._id);
  const targetAddress = user.addresses.id(id);

  if (!targetAddress) {
    throw new ApiError(404, 'Address not found');
  }

  // Remove address
  user.addresses.pull(id);

  // If we deleted the default address, set another one as default
  if (targetAddress.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, 'Address removed successfully')
  );
});
