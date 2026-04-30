const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.env} mode on port ${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('💤 Server closed');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
