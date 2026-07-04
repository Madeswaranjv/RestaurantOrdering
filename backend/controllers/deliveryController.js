import OrderRepository from '../repositories/OrderRepository.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import DriverProfileRepository from '../repositories/DriverProfileRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../config/socket.js';

export const getAvailableOrders = asyncHandler(async (req, res) => {
  // Find orders that are READY_FOR_PICKUP and do not have an assigned delivery partner
  const orders = await OrderRepository.find({
    status: 'READY_FOR_PICKUP',
    deliveryPartner: { $exists: false }
  }, 'user items');

  res.status(200).json(
    new ApiResponse(200, { orders }, 'Available delivery orders retrieved successfully')
  );
});

export const acceptOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await OrderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartner) {
    throw new ApiError(400, 'Order has already been assigned to another delivery partner.');
  }

  // Assign driver and update status to CONFIRMED
  order.deliveryPartner = req.user._id;
  order.status = 'CONFIRMED';
  await order.save();

  // Create notifications
  await NotificationRepository.create({
    user: order.user,
    title: 'Delivery Partner Assigned',
    message: `Driver ${req.user.name} has accepted your order #${order._id} and is heading to the kitchen.`,
    type: 'Delivery'
  });

  // Socket notification
  try {
    const io = getIO();
    io.to(`order_${order._id}`).emit('orderConfirmed', order);
    io.to(`order_${order._id}`).emit('orderStatusChanged', { orderId: order._id, status: 'CONFIRMED' });
    io.to(`user_${order.user}`).emit('orderStatusChanged', { orderId: order._id, status: 'CONFIRMED' });
  } catch (err) {}

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order accepted successfully')
  );
});

export const pickupOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await OrderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to pick up this order.');
  }

  order.status = 'OUT_FOR_DELIVERY';
  await order.save();

  // Notify customer
  await NotificationRepository.create({
    user: order.user,
    title: 'Order Out For Delivery',
    message: `Your order #${order._id} is out for delivery with ${req.user.name}.`,
    type: 'Delivery'
  });

  // Socket broadcast
  try {
    const io = getIO();
    io.to(`order_${order._id}`).emit('orderOutForDelivery', order);
    io.to(`order_${order._id}`).emit('orderStatusChanged', { orderId: order._id, status: 'OUT_FOR_DELIVERY' });
    io.to(`user_${order.user}`).emit('orderStatusChanged', { orderId: order._id, status: 'OUT_FOR_DELIVERY' });
  } catch (err) {}

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order status updated to Out for Delivery')
  );
});

export const deliverOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await OrderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to deliver this order.');
  }

  order.status = 'DELIVERED';
  order.paymentStatus = 'PAID';
  await order.save();

  // Notify customer
  await NotificationRepository.create({
    user: order.user,
    title: 'Order Delivered',
    message: `Your order #${order._id} has been delivered. Enjoy!`,
    type: 'Delivery'
  });

  // Socket broadcast
  try {
    const io = getIO();
    io.to(`order_${order._id}`).emit('orderDelivered', order);
    io.to(`order_${order._id}`).emit('orderStatusChanged', { orderId: order._id, status: 'DELIVERED' });
    io.to(`user_${order.user}`).emit('orderStatusChanged', { orderId: order._id, status: 'DELIVERED' });
  } catch (err) {}

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order delivered successfully')
  );
});

export const getHistory = asyncHandler(async (req, res) => {
  const orders = await OrderRepository.find({
    deliveryPartner: req.user._id,
    status: 'DELIVERED'
  });

  res.status(200).json(
    new ApiResponse(200, { orders }, 'Delivery history retrieved successfully')
  );
});

export const getEarnings = asyncHandler(async (req, res) => {
  const completedOrders = await OrderRepository.find({
    deliveryPartner: req.user._id,
    status: 'DELIVERED'
  });

  // Driver gets 15% commission of total order price
  let totalEarnings = 0;
  const history = completedOrders.map(order => {
    const earning = Number((order.grandTotal * 0.15).toFixed(2));
    totalEarnings += earning;
    return {
      orderId: order._id,
      date: order.updatedAt,
      amount: order.grandTotal,
      earning
    };
  });

  res.status(200).json(
    new ApiResponse(200, { totalEarnings: Number(totalEarnings.toFixed(2)), history }, 'Earnings retrieved successfully')
  );
});

export const getDashboard = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  const totalDeliveries = await OrderRepository.countDocuments({
    deliveryPartner: driverId,
    status: 'DELIVERED'
  });

  const activeOrdersCount = await OrderRepository.countDocuments({
    deliveryPartner: driverId,
    status: { $in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] }
  });

  // Fetch completed orders to calculate earnings
  const completedOrders = await OrderRepository.find({
    deliveryPartner: driverId,
    status: 'DELIVERED'
  });

  // Calculate earnings
  let totalEarnings = 0;
  let todayEarnings = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  completedOrders.forEach(order => {
    const earning = Number((order.grandTotal * 0.15).toFixed(2));
    totalEarnings += earning;
    if (new Date(order.updatedAt) >= today) {
      todayEarnings += earning;
    }
  });

  res.status(200).json(
    new ApiResponse(200, {
      todayDeliveries: completedOrders.filter(o => new Date(o.updatedAt) >= today).length,
      weeklyEarnings: Number((totalEarnings * 0.6).toFixed(2)), // Mock weekly portion
      totalDeliveries,
      activeOrders: activeOrdersCount,
      averageDeliveryTime: '25 mins',
      todayEarnings: Number(todayEarnings.toFixed(2)),
      totalEarnings: Number(totalEarnings.toFixed(2))
    }, 'Delivery partner dashboard retrieved successfully')
  );
});
