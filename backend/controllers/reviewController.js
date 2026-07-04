import ReviewRepository from '../repositories/ReviewRepository.js';
import MenuRepository from '../repositories/MenuRepository.js';
import RestaurantRepository from '../repositories/RestaurantRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, reviewType, referenceId } = req.body;

  // 1. Verify that the referenced resource exists
  if (reviewType === 'Food') {
    const item = await MenuRepository.findById(referenceId);
    if (!item) throw new ApiError(404, 'Menu item not found');
  } else if (reviewType === 'Restaurant') {
    const restaurant = await RestaurantRepository.findById(referenceId);
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
  } else if (reviewType === 'Order') {
    const order = await OrderRepository.findById(referenceId);
    if (!order) throw new ApiError(404, 'Order not found');
  }

  // 2. Create the review
  const review = await ReviewRepository.create({
    user: req.user._id,
    rating,
    comment,
    reviewType,
    referenceId
  });

  // 3. Proactively recalculate average rating for Menu or Restaurant
  if (reviewType === 'Food') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Food', referenceId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await MenuRepository.updateById(referenceId, { rating: Number(avg.toFixed(1)) });
  } else if (reviewType === 'Restaurant') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Restaurant', referenceId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await RestaurantRepository.updateById(referenceId, { rating: Number(avg.toFixed(1)) });
  }

  res.status(201).json(
    new ApiResponse(201, { review }, 'Review posted successfully')
  );
});

export const getReviews = asyncHandler(async (req, res) => {
  const { reviewType, referenceId } = req.query;
  const filter = {};

  if (reviewType) filter.reviewType = reviewType;
  if (referenceId) filter.referenceId = referenceId;
  filter.isHidden = { $ne: true };

  const reviews = await ReviewRepository.findDetailed(filter);

  res.status(200).json(
    new ApiResponse(200, { reviews }, 'Reviews retrieved successfully')
  );
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await ReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Security Check: Only owner or admin can delete
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. You cannot delete this review.');
  }

  await ReviewRepository.deleteById(id);

  // Recalculate average ratings after deletion
  if (review.reviewType === 'Food') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Food', referenceId: review.referenceId });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;
    await MenuRepository.updateById(review.referenceId, { rating: Number(avg.toFixed(1)) });
  } else if (review.reviewType === 'Restaurant') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Restaurant', referenceId: review.referenceId });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;
    await RestaurantRepository.updateById(review.referenceId, { rating: Number(avg.toFixed(1)) });
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully')
  );
});
