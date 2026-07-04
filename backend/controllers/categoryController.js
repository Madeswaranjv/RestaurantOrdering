import CategoryRepository from '../repositories/CategoryRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryRepository.find({}, '', { name: 1 });
  res.status(200).json(
    new ApiResponse(200, { categories }, 'Categories retrieved successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  // Check unique category name
  const existingCategory = await CategoryRepository.findOne({ name });
  if (existingCategory) {
    throw new ApiError(400, `Category '${name}' already exists`);
  }

  const category = await CategoryRepository.create({ name, description, image });
  res.status(201).json(
    new ApiResponse(201, { category }, 'Category created successfully')
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  let category = await CategoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name) {
    const existing = await CategoryRepository.findOne({ name, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(400, `Category name '${name}' is already in use`);
    }
  }

  category = await CategoryRepository.updateById(id, { name, description, image });

  res.status(200).json(
    new ApiResponse(200, { category }, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await CategoryRepository.deleteById(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});
