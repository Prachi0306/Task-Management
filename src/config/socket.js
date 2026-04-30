const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index');
const logger = require('../utils/logger');

let io;
const userSockets = new Map(); // Maps userId to socket.id

const initSocket = (server) => {
  io = new Server(server, {
    cors: config.cors,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    userSockets.set(userId, socket.id);
    logger.info(`🔌 Socket connected: ${userId} (${socket.id})`);

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      logger.info(`🔌 Socket disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = { initSocket, emitToUser, emitToAll };
