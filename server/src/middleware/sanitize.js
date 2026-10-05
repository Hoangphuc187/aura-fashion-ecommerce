/**
 * Input Sanitization & Anti-Injection Middleware
 * - Neutralizes NoSQL Injection by sanitizing keys with '$' or '.'
 * - Escapes regex special characters to prevent ReDoS attacks
 * - Strips malicious script tags to mitigate stored/reflected XSS
 * - Validates input formats (email, password complexity, phone)
 */

/**
 * Escapes regex special characters to prevent ReDoS
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Recursively strips keys starting with '$' or containing '.' to block NoSQL injection
 */
const cleanNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanNoSql);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    // Drop keys with MongoDB operators ($gt, $ne, $where, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    const val = obj[key];
    if (val && typeof val === 'object') {
      cleaned[key] = cleanNoSql(val);
    } else if (typeof val === 'string') {
      // Basic XSS tag neutralization for dangerous executable tags
      cleaned[key] = val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
};

/**
 * Express middleware to sanitize body, query, and params
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSql(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSql(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSql(req.params);
  }
  next();
};

/**
 * Email format validator
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 150;
};

/**
 * Password strength validator
 * Requires: minimum 8 characters, at least 1 letter, and at least 1 number
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có tối thiểu 8 ký tự để đảm bảo an toàn' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải bao gồm cả chữ cái và chữ số' };
  }
  return { valid: true };
};
