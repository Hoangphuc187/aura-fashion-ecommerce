import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../config/logger.js';

// In-memory LRU cache of recently processed idempotency keys
const processedKeys = new Map();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Idempotency Key Middleware (UUID v4)
 * Protects critical mutation endpoints (Order Creation, Payments) against duplicate execution.
 */
export const requireIdempotency = (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key) {
    // If not supplied, proceed normally
    return next();
  }

  const trimmedKey = typeof key === 'string' ? key.trim() : '';
  const now = Date.now();

  // Clean expired keys
  for (const [k, item] of processedKeys.entries()) {
    if (now - item.timestamp > IDEMPOTENCY_TTL_MS) {
      processedKeys.delete(k);
    }
  }

  const existing = processedKeys.get(trimmedKey);
  if (existing) {
    logger.warn(`[Idempotency] Duplicate request intercepted for key: ${trimmedKey}`, {
      requestId: req.id,
      key: trimmedKey,
    });

    return ApiResponse.success(res, {
      data: existing.data,
      message: 'Yêu cầu trùng lặp được xử lý an toàn (Idempotent replay)',
      statusCode: existing.statusCode || 200,
      meta: { idempotentReplay: true, originalTimestamp: new Date(existing.timestamp).toISOString() },
    });
  }

  // Intercept json send to cache the result
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      processedKeys.set(trimmedKey, {
        timestamp: Date.now(),
        statusCode: res.statusCode,
        data: body,
      });
    }
    return originalJson(body);
  };

  next();
};

export default requireIdempotency;

