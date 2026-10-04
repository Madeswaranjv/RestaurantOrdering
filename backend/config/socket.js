import { Server } from 'socket.io';
import registerOrderSocketHandlers from '../sockets/orderSocket.js';

let io = null;

const getClientOrigins = () => {
  const configuredClientUrls =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  return Array.from(new Set([
    ...configuredClientUrls.split(",").map((url) => url.trim().replace(/\/+$/, '')).filter(Boolean),
    ...(process.env.ELECTRON_RENDERER_ORIGIN ? [process.env.ELECTRON_RENDERER_ORIGIN] : []),
    ...(process.env.NODE_ENV !== 'production'
      ? [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5174",
          "http://[::1]:5173",
          "http://[::1]:5174"
        ]
      : [])
  ]));
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getClientOrigins(),
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Register custom handlers
    registerOrderSocketHandlers(io, socket);

    // Join room for a specific order tracking
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined room: order_${orderId}`);
    });

    // Join room for a specific user notifications/updates
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room: user_${userId}`);
    });

    // Driver specific room for new available orders
    socket.on('joinDrivers', () => {
      socket.join('drivers');
      console.log(`Driver socket ${socket.id} joined room: drivers`);
    });

    // socket.on('disconnect', () => {
    //   console.log(`Client disconnected: ${socket.id}`);
    // });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please call initSocket first.');
  }
  return io;
};
