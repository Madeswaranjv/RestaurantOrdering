import RestaurantRepository from '../repositories/RestaurantRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantRepository.getSingleRestaurant();
  
  if (!restaurant) {
    return res.status(200).json(
      new ApiResponse(200, null, 'No restaurant profile found. Please seed or create one.')
    );
  }
  
  res.status(200).json(
    new ApiResponse(200, { restaurant }, 'Restaurant details retrieved successfully')
  );
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant = await RestaurantRepository.getSingleRestaurant();

  if (!restaurant) {
    // Auto-create a skeleton restaurant profile if none exists
    restaurant = await RestaurantRepository.create({
      name: req.body.name || 'FlavorDash Premium Kitchen',
      address: req.body.address || '42 Gourmet Lane, Chelsea, London SW3',
      openingHours: req.body.openingHours || '09:00 AM - 11:00 PM',
      cuisines: req.body.cuisines || ['Gastronomy', 'Fine Dining'],
      ...req.body
    });
  } else {
    // Update existing record
    restaurant = await RestaurantRepository.updateById(restaurant._id, req.body);
  }

  res.status(200).json(
    new ApiResponse(200, { restaurant }, 'Restaurant profile updated successfully')
  );
});
