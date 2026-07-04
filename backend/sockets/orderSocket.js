/**
 * Handles custom real-time events for Order tracking
 * @param {object} io - The Socket.IO server instance
 * @param {object} socket - The connected client socket
 */
const registerOrderSocketHandlers = (io, socket) => {
  // Driver location updates: broadcast to order room
  socket.on('driverLocationUpdate', ({ orderId, coords }) => {
    console.log(`Live tracking: Order #${orderId} driver location updated:`, coords);
    
    // Broadcast coordinate change to the specific order room
    socket.to(`order_${orderId}`).emit('driverLocationChanged', {
      orderId,
      coords // expecting { x, y } or { latitude, longitude }
    });
  });

  // Chat message support for delivery partner & customer (premium addition)
  socket.on('sendOrderMessage', ({ orderId, message, sender }) => {
    io.to(`order_${orderId}`).emit('newOrderMessage', {
      orderId,
      message,
      sender, // 'customer' or 'driver'
      timestamp: new Date()
    });
  });
};

export default registerOrderSocketHandlers;
