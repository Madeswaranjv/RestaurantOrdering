import OrderRepository from '../repositories/OrderRepository.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../config/socket.js';

export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const order = await OrderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    throw new ApiError(400, 'Order has already been paid');
  }

  let paymentGatewayPayload = {};

  if (paymentMethod === 'STRIPE') {
    // Generate mock Stripe Client Secret
    paymentGatewayPayload = {
      clientSecret: `pi_mock_${Math.random().toString(36).substring(2, 10)}_secret_${Math.random().toString(36).substring(2, 6)}`,
      amount: order.grandTotal,
      currency: 'usd',
      orderId: order._id
    };
  } else if (paymentMethod === 'RAZORPAY') {
    // Generate mock Razorpay Order ID (Razorpay works in paise/cents, multiply by 100)
    paymentGatewayPayload = {
      razorpayOrderId: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
      amount: Math.round(order.grandTotal * 100),
      currency: 'INR',
      orderId: order._id
    };
  } else {
    // COD
    paymentGatewayPayload = {
      message: 'Cash on delivery selected. Payment will be collected on delivery.',
      orderId: order._id
    };
  }

  // Update order with selected payment method if it changed
  order.paymentMethod = paymentMethod;
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { payment: paymentGatewayPayload }, 'Payment initiated successfully')
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, transactionId } = req.body;

  const order = await OrderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Verify payment status transition
  order.paymentStatus = 'PAID';
  await order.save();

  // Create notifications
  await NotificationRepository.create({
    user: order.user,
    title: 'Payment Confirmed',
    message: `Payment of $${order.grandTotal.toFixed(2)} using ${paymentMethod} has been verified successfully.`,
    type: 'Payment'
  });

  // Socket notification to update the order card status
  try {
    const io = getIO();
    io.to(`order_${order._id}`).emit('paymentVerified', { orderId: order._id, paymentStatus: 'PAID' });
  } catch (err) {}

  res.status(200).json(
    new ApiResponse(200, { order }, 'Payment verified successfully')
  );
});
