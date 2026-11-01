import { logger } from '../config/logger.js';

/**
 * HTTP Access Logging Middleware
 * Tracks request lifecycle, measures execution latency in milliseconds,
 * and records correlation ID, IP, user-agent, and status code.
 */
export const httpLogger = (req, res, next) => {
  const startTime = process.hrtime();
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  // Listen to response finish event
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const statusCode = res.statusCode;

    const logPayload = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      status: statusCode,
      duration: `${durationMs}ms`,
      ip: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown',
    };

    const message = `${req.method} ${req.originalUrl || req.url} ${statusCode} - ${durationMs}ms [IP: ${clientIp}]`;

    if (statusCode >= 500) {
      logger.error(message, logPayload);
    } else if (statusCode >= 400) {
      logger.warn(message, logPayload);
    } else {
      logger.http(message, logPayload);
    }
  });

  next();
};

export default httpLogger;

