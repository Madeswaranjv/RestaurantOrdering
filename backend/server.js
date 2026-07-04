import http from 'http';
import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports that might use them
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const [
      { default: app },
      { default: connectDB },
      { initSocket }
    ] = await Promise.all([
      import('./app.js'),
      import('./config/db.js'),
      import('./config/socket.js')
    ]);

    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server from Express app
    const server = http.createServer(app);

    // 3. Initialize Socket.IO on the HTTP server
    const io = initSocket(server);
    console.log('Socket.IO initialized');

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`\n══════════════════════════════════════════════`);
      console.log(`  FlavorDash API Server`);
      console.log(`  Mode:     ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port:     ${PORT}`);
      console.log(`  API:      http://localhost:${PORT}/api`);
      console.log(`  Docs:     http://localhost:${PORT}/api-docs`);
      console.log(`  Health:   http://localhost:${PORT}/health`);
      console.log(`══════════════════════════════════════════════\n`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      // Force close after 10s
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
