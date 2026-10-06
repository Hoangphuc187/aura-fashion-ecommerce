import zlib from 'node:zlib';

/**
 * High-Performance Zero-Dependency Gzip Compression Middleware
 * Compresses response bodies exceeding 1KB using native Node.js zlib bindings.
 * Drastically cuts network payload (up to 75-85%) for catalogs, orders, and stats.
 */
export const gzipCompression = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) return next();

  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
      if (buffer.length > 1024) {
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        try {
          const compressed = zlib.gzipSync(buffer);
          return originalSend.call(this, compressed);
        } catch {
          return originalSend.call(this, body);
        }
      }
    }
    return originalSend.call(this, body);
  };
  next();
};
