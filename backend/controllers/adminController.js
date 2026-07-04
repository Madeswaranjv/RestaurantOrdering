import UserRepository from '../repositories/UserRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import MenuRepository from '../repositories/MenuRepository.js';
import ReviewRepository from '../repositories/ReviewRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import DriverProfileRepository from '../repositories/DriverProfileRepository.js';
import RestaurantRepository from '../repositories/RestaurantRepository.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await UserRepository.countDocuments();
  const totalOrders = await OrderRepository.countDocuments();
  const totalMenuItems = await MenuRepository.countDocuments();
  const totalReviews = await ReviewRepository.countDocuments();

  // Calculate revenue from all DELIVERED orders
  const revenueAggregation = await Order.aggregate([
    { $match: { status: 'DELIVERED' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? Number(revenueAggregation[0].total.toFixed(2)) : 0;

  const pendingOrders = await OrderRepository.countDocuments({
    status: { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] }
  });

  const deliveredOrders = await OrderRepository.countDocuments({ status: 'DELIVERED' });

  res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalMenuItems,
      totalReviews
    }, 'Admin dashboard stats retrieved successfully')
  );
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  // Aggregate daily revenue for the last 30 days
  const dailyRevenue = await Order.aggregate([
    { $match: { status: 'DELIVERED' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        amount: { $sum: '$grandTotal' }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);

  // Aggregate monthly revenue
  const monthlyRevenue = await Order.aggregate([
    { $match: { status: 'DELIVERED' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        amount: { $sum: '$grandTotal' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      daily: dailyRevenue.map(item => ({ label: item._id, value: Number(item.amount.toFixed(2)) })),
      monthly: monthlyRevenue.map(item => ({ label: item._id, value: Number(item.amount.toFixed(2)) }))
    }, 'Revenue analytics retrieved successfully')
  );
});

export const getOrderAnalytics = asyncHandler(async (req, res) => {
  // Aggregate count of orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Daily order volumes for the last 30 days
  const dailyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      statusBreakdown: ordersByStatus.map(item => ({ label: item._id, value: item.count })),
      dailyVolume: dailyOrders.map(item => ({ label: item._id, value: item.count }))
    }, 'Order analytics retrieved successfully')
  );
});

export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  // Monthly user signups
  const monthlySignups = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Role breakdown
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      monthlyRegistrations: monthlySignups.map(item => ({ label: item._id, value: item.count })),
      roleBreakdown: usersByRole.map(item => ({ label: item._id, value: item.count }))
    }, 'Customer analytics retrieved successfully')
  );
});

// ─── Admin User Management Controllers ────────────────────────────────

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status, sort = 'desc' } = req.query;
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (status) {
    if (status === 'blocked') {
      filter.isBlocked = true;
    } else if (status === 'active') {
      filter.isBlocked = { $ne: true };
    }
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = sort === 'asc' ? 1 : -1;

  const users = await UserRepository.model.find(filter)
    .select('-password -refreshTokens')
    .sort({ createdAt: sortDirection })
    .skip(skip)
    .limit(Number(limit));

  const total = await UserRepository.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }, 'Admin users list retrieved successfully')
  );
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserRepository.findById(id, '', '-password -refreshTokens');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User details retrieved successfully')
  );
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['customer', 'deliveryPartner', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await UserRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, `User role updated to ${role} successfully`)
  );
});

export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await UserRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot block administrative accounts');
  }

  user.isBlocked = true;
  user.blockedAt = new Date();
  user.blockedReason = reason || 'Violation of terms of service';
  user.refreshTokens = []; // Force logout
  await user.save();

  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, 'User blocked successfully')
  );
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isBlocked = false;
  user.blockedAt = undefined;
  user.blockedReason = undefined;
  await user.save();

  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, 'User unblocked successfully')
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Administrative accounts cannot be deleted');
  }

  await UserRepository.deleteById(id);
  await CartRepository.deleteMany({ user: id });
  await DriverProfileRepository.deleteMany({ user: id });

  res.status(200).json(
    new ApiResponse(200, null, 'User and associated profiles deleted successfully')
  );
});

// ─── Admin Review Moderation Controllers ──────────────────────────────

export const getAdminReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, reviewType, isHidden, rating } = req.query;
  const filter = {};

  if (reviewType) filter.reviewType = reviewType;
  if (rating) filter.rating = Number(rating);
  if (isHidden !== undefined) filter.isHidden = isHidden === 'true';

  if (search) {
    filter.comment = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const reviews = await ReviewRepository.model.find(filter)
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await ReviewRepository.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }, 'Admin reviews retrieved successfully')
  );
});

export const hideReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await ReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isHidden = true;
  await review.save();

  res.status(200).json(
    new ApiResponse(200, { review }, 'Review hidden successfully')
  );
});

export const unhideReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await ReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isHidden = false;
  await review.save();

  res.status(200).json(
    new ApiResponse(200, { review }, 'Review unhidden successfully')
  );
});

export const deleteAdminReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await ReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await ReviewRepository.deleteById(id);

  const { reviewType, referenceId } = review;
  if (reviewType === 'Food') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Food', referenceId });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;
    await MenuRepository.updateById(referenceId, { rating: Number(avg.toFixed(1)) });
  } else if (reviewType === 'Restaurant') {
    const allReviews = await ReviewRepository.find({ reviewType: 'Restaurant', referenceId });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;
    await RestaurantRepository.updateById(referenceId, { rating: Number(avg.toFixed(1)) });
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully by admin')
  );
});
