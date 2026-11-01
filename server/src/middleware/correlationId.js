import crypto from 'crypto';

/**
 * Request Correlation ID Middleware (UUID v4)
 * - Guarantees every HTTP transaction has a globally unique trace ID.
 * - Adopts incoming `X-Request-Id` or `X-Correlation-Id` from API gateways, or generates a fresh RFC4122 v4 UUID.
 * - Injects `req.id` and sets `X-Request-Id` response header for end-to-end distributed tracing.
 */
export const correlationIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
    ? existingId.trim()
    : crypto.randomUUID();

  req.id = requestId;
  req.correlationId = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};

export default correlationIdMiddleware;

