import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// In-memory circular buffer for fast real-time log inspection via API
const LOG_BUFFER_LIMIT = 200;
const memoryLogBuffer = [];

const appendToLogBuffer = (entry) => {
  memoryLogBuffer.push(entry);
  if (memoryLogBuffer.length > LOG_BUFFER_LIMIT) {
    memoryLogBuffer.shift();
  }
};

// Custom Winston format to capture logs into memory buffer for API access
const memoryBufferFormat = winston.format((info) => {
  appendToLogBuffer({
    timestamp: info.timestamp || new Date().toISOString(),
    level: info.level,
    requestId: info.requestId || info.correlationId || '-',
    message: info.message,
    meta: info.meta || {},
  });
  return info;
});

// Custom colored console format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const traceId = info.requestId || info.correlationId ? ` [Trace: ${info.requestId || info.correlationId}]` : '';
    const metaString = info.meta && Object.keys(info.meta).length > 0 ? ` ${JSON.stringify(info.meta)}` : '';
    return `[${info.timestamp}] [${info.level}]${traceId}: ${info.message}${metaString}`;
  })
);

// Structured JSON format for file persistence (compatible with Logstash, ELK, Datadog)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  memoryBufferFormat(),
  winston.format.json()
);

// Daily Rotate File Transports
const dailyAppRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const dailyErrorRotateTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

const dailyHttpRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
});

// Create Winston Logger instance
const winstonInstance = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    dailyAppRotateTransport,
    dailyErrorRotateTransport,
  ],
  exitOnError: false,
});

/**
 * Enterprise Production Logging Stack
 * Exposes standard logging methods with correlation ID support
 */
export const logger = {
  info: (message, meta = {}) => {
    winstonInstance.info(message, { requestId: meta.requestId || meta.correlationId, meta });
  },

  warn: (message, meta = {}) => {
    winstonInstance.warn(message, { requestId: meta.requestId || meta.correlationId, meta });
  },

  error: (message, meta = {}) => {
    winstonInstance.error(message, { requestId: meta.requestId || meta.correlationId, meta });
  },

  http: (message, meta = {}) => {
    winstonInstance.info(message, { requestId: meta.requestId || meta.correlationId, isHttp: true, meta });
  },

  debug: (message, meta = {}) => {
    winstonInstance.debug(message, { requestId: meta.requestId || meta.correlationId, meta });
  },

  getRecentLogs: (limit = 50) => {
    return memoryLogBuffer.slice(-limit).reverse();
  },
};

export default logger;
