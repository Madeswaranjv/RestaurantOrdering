import UserRepository from '../repositories/UserRepository.js';
import MenuRepository from '../repositories/MenuRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addFavorite = asyncHandler(async (req, res) => {
  const { menuId } = req.params;

  // 1. Verify menu item exists
  const menuItem = await MenuRepository.findById(menuId);
  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  // 2. Add to user favorites if not already present
  const user = await UserRepository.findById(req.user._id);
  if (user.favorites.includes(menuId)) {
    return res.status(200).json(
      new ApiResponse(200, { favorites: user.favorites }, 'Item is already in favorites')
    );
  }

  user.favorites.push(menuId);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { favorites: user.favorites }, 'Added to favorites successfully')
  );
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { menuId } = req.params;

  const user = await UserRepository.findById(req.user._id);
  if (!user.favorites.includes(menuId)) {
    throw new ApiError(400, 'Item is not in favorites');
  }

  user.favorites = user.favorites.filter(id => id.toString() !== menuId);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { favorites: user.favorites }, 'Removed from favorites successfully')
  );
});

export const getFavorites = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user._id, 'favorites');
  const populatedUser = await user.populate('favorites');

  res.status(200).json(
    new ApiResponse(200, { favorites: populatedUser.favorites }, 'Favorites list retrieved successfully')
  );
});
