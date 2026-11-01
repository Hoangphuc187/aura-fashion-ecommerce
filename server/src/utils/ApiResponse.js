/**
 * Standardized Enterprise API Response Envelope
 * Hardened: Cloaks server internal routing & path metadata from public responses
 */

export class ApiResponse {
  /**
   * Send Standard Success Response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {*} [options.data=null] - Main payload
   * @param {string} [options.message='Thành công'] - Human-readable status message
   * @param {number} [options.statusCode=200] - HTTP Status Code
   * @param {Object} [options.meta={}] - Extra metadata (pagination, metrics, etc.)
   */
  static success(res, { data = null, message = 'Thành công', statusCode = 200, meta = {} } = {}) {
    const requestId = res.req?.id || res.req?.headers?.['x-request-id'] || 'trace-local';

    const envelope = {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        ...meta,
      },
    };

    // Backward-compatibility: if data is a non-array object, spread keys at root level
    // so older client fetchers reading `res.json().products` or `.stats` won't break
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach((key) => {
        if (!(key in envelope)) {
          envelope[key] = data[key];
        }
      });
    }

    return res.status(statusCode).json(envelope);
  }

  /**
   * Send Standard Error Response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {string} options.message - Human-readable error description
   * @param {number} [options.statusCode=500] - HTTP Status Code
   * @param {string} [options.errorCode='INTERNAL_ERROR'] - Machine-readable error code
   * @param {Array|Object|null} [options.errors=null] - Detailed validation or field errors
   */
  static error(res, { message = 'Lỗi hệ thống máy chủ', statusCode = 500, errorCode = 'SERVER_ERROR', errors = null, meta = {} } = {}) {
    const requestId = res.req?.id || res.req?.headers?.['x-request-id'] || 'trace-local';

    return res.status(statusCode).json({
      success: false,
      statusCode,
      errorCode,
      message,
      errors: Array.isArray(errors) ? errors : errors ? [errors] : null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        ...meta,
      },
    });
  }
}

export default ApiResponse;
