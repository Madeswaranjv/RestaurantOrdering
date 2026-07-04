import MenuRepository from '../repositories/MenuRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMenuItems = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, isAvailable, featured, sort, page, limit } = req.query;

  const result = await MenuRepository.queryMenuItems({
    search,
    category,
    minPrice,
    maxPrice,
    isAvailable,
    featured,
    sort,
    page,
    limit
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Menu items retrieved successfully')
  );
});

export const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await MenuRepository.findById(id, 'category');

  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  res.status(200).json(
    new ApiResponse(200, { menuItem }, 'Menu item retrieved successfully')
  );
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    images,
    price,
    ingredients,
    nutrition,
    featured,
    isAvailable,
    customizationOptions
  } = req.body;

  const menuItem = await MenuRepository.create({
    name,
    description,
    category,
    images: images || [],
    price,
    ingredients: ingredients || [],
    nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
    featured: featured || false,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    customizationOptions: customizationOptions || []
  });

  res.status(201).json(
    new ApiResponse(201, { menuItem }, 'Menu item created successfully')
  );
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingItem = await MenuRepository.findById(id);
  if (!existingItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  const updatedItem = await MenuRepository.updateById(id, req.body);

  res.status(200).json(
    new ApiResponse(200, { menuItem: updatedItem }, 'Menu item updated successfully')
  );
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuRepository.findById(id);
  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  await MenuRepository.deleteById(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Menu item deleted successfully')
  );
});
