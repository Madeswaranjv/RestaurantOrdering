import OrderRepository from '../repositories/OrderRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../config/socket.js';
import { sendEmail } from '../services/emailService.js';
import { getOrderConfirmationTemplate } from '../utils/emailTemplates.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod = 'COD' } = req.body;

  // 1. Fetch user's cart
  const cart = await CartRepository.findByUserId(req.user._id, true);
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cannot place order. Your cart is empty.');
  }

  // 2. Map cart items to order items snapshot
  const orderItems = cart.items.map(item => {
    if (!item.menuItem) {
      throw new ApiError(400, 'One or more items in your cart are no longer available.');
    }
    return {
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      customization: item.customization
    };
  });

  // 3. Create order
  const order = await OrderRepository.create({
    user: req.user._id,
    items: orderItems,
    subtotal: cart.subtotal,
    tax: cart.tax,
    deliveryFee: cart.deliveryFee,
    grandTotal: cart.grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID', // Online payments marked as paid in mock verification
    deliveryAddress,
    status: 'PLACED'
  });

  // 4. Empty the user's cart
  cart.items = [];
  cart.subtotal = 0;
  cart.tax = 0;
  cart.deliveryFee = 0;
  cart.grandTotal = 0;
  await cart.save();

  // 5. Create notification record
  await NotificationRepository.create({
    user: req.user._id,
    title: 'Order Placed Successfully',
    message: `Your order of $${order.grandTotal.toFixed(2)} has been placed. Order ID: ${order._id}`,
    type: 'Order'
  });

  // 6. Emit real-time Socket.IO events
  try {
    const io = getIO();
    // Notify user
    io.to(`user_${req.user._id}`).emit('orderStatusChanged', { orderId: order._id, status: 'PLACED' });
    // Notify drivers about new order
    io.to('drivers').emit('orderPlaced', order);
  } catch (socketError) {
    console.error(`Socket emission failed: ${socketError.message}`);
  }

  // 7. Send confirmation email in background
  sendEmail({
    to: req.user.email,
    subject: `FlavorDash - Order Confirmed #${order._id}`,
    html: getOrderConfirmationTemplate(order, req.user.name)
  }).catch(emailErr => console.error(`Failed to send order email: ${emailErr.message}`));

  res.status(201).json(
    new ApiResponse(201, { order }, 'Order placed successfully')
  );
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await OrderRepository.findByUserId(req.user._id);
  res.status(200).json(
    new ApiResponse(200, { orders }, 'Orders retrieved successfully')
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await OrderRepository.findDetailedOrderById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Security Check: Only allow owner, assigned driver, or admin
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssignedDriver = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssignedDriver) {
    throw new ApiError(403, 'Access denied. You do not have permissions to view this order.');
  }

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order details retrieved successfully')
  );
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await OrderRepository.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Only owner can cancel
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied');
  }

  // Can only cancel if PLACED
  if (order.status !== 'PLACED') {
    throw new ApiError(400, `Cannot cancel order at stage: ${order.status}`);
  }

  order.status = 'CANCELLED';
  await order.save();

  // Create user notification
  await NotificationRepository.create({
    user: order.user,
    title: 'Order Cancelled',
    message: `Your order #${order._id} has been cancelled.`,
    type: 'Order'
  });

  // Socket update
  try {
    const io = getIO();
    io.to(`order_${order._id}`).emit('orderCancelled', { orderId: order._id });
    io.to(`user_${order.user}`).emit('orderStatusChanged', { orderId: order._id, status: 'CANCELLED' });
  } catch (err) {}

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order cancelled successfully')
  );
});

// Admin Controllers
export const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await OrderRepository.findAllDetailed();
  res.status(200).json(
    new ApiResponse(200, { orders }, 'All orders retrieved successfully')
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await OrderRepository.findDetailedOrderById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.status = status;
  
  // Mark as PAID if delivered
  if (status === 'DELIVERED') {
    order.paymentStatus = 'PAID';
  }

  await order.save();

  // Create notification for user
  await NotificationRepository.create({
    user: order.user._id,
    title: `Order Status: ${status}`,
    message: `Your order #${order._id} status is now ${status}.`,
    type: 'Order'
  });

  // Socket real-time update
  try {
    const io = getIO();
    
    // Map status to socket event names
    const statusEvents = {
      CONFIRMED: 'orderConfirmed',
      PREPARING: 'orderPreparing',
      READY_FOR_PICKUP: 'orderReadyForPickup', // extra helper
      OUT_FOR_DELIVERY: 'orderOutForDelivery',
      DELIVERED: 'orderDelivered'
    };

    const eventName = statusEvents[status];
    if (eventName) {
      // Emit to order-specific room
      io.to(`order_${order._id}`).emit(eventName, order);
    }
    
    // Generic event
    io.to(`order_${order._id}`).emit('orderStatusChanged', { orderId: order._id, status });
    io.to(`user_${order.user._id}`).emit('orderStatusChanged', { orderId: order._id, status });

    // If READY_FOR_PICKUP, broadcast to all drivers
    if (status === 'READY_FOR_PICKUP') {
      io.to('drivers').emit('deliveryOrderAvailable', order);
    }
  } catch (socketError) {
    console.error(`Socket broadcast error: ${socketError.message}`);
  }

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order status updated successfully')
  );
});
