const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('../config');

const logDir = path.resolve(__dirname, '../../logs');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}${metaStr}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
  })
);

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), logFormat),
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
