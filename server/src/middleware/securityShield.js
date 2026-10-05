/**
 * AURA Advanced Security Shield & WAF
 * - In-memory sliding window Rate Limiting (General API & Strict Auth)
 * - Honeypot trap paths (auto-ban scanner IPs)
 * - Malicious bot & scanner User-Agent detection (Gobuster, ffuf, Nikto, sqlmap, etc.)
 * - Anti-directory fuzzing (auto-ban IPs causing rapid consecutive 404s)
 * - Complete HTTP Security Headers (HSTS, CSP, X-Frame-Options, etc.)
 * - Stealth 404 cloaking for admin & private endpoints
 */

import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';

const bannedIPs = new Map(); // ip -> { bannedUntil: number, reason: string }
const notFoundTracker = new Map(); // ip -> number[]
const generalRateTracker = new Map(); // ip -> number[]
const authRateTracker = new Map(); // ip -> number[]

// Periodic garbage collection every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of bannedIPs.entries()) {
    if (now > info.bannedUntil) {
      bannedIPs.delete(ip);
    }
  }
  const cleanTracker = (tracker, windowMs) => {
    for (const [ip, timestamps] of tracker.entries()) {
      const recent = timestamps.filter((t) => now - t < windowMs);
      if (recent.length === 0) {
        tracker.delete(ip);
      } else {
        tracker.set(ip, recent);
      }
    }
  };
  cleanTracker(notFoundTracker, 30000);
  cleanTracker(generalRateTracker, 60000);
  cleanTracker(authRateTracker, 60000);
}, 5 * 60 * 1000);

/**
 * Extract clean client IP (handles standard proxies & IPv6/IPv4 conversion)
 */
export const getClientIp = (req) => {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
  let ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || req.ip || '127.0.0.1';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
};

/**
 * Ban an IP for a specific duration
 */
export const banIp = (ip, durationMs, reason) => {
  const isLocal = ip === '127.0.0.1' || ip === '::1';
  const effectiveDuration = isLocal ? Math.min(durationMs, 10000) : durationMs;

  bannedIPs.set(ip, {
    bannedUntil: Date.now() + effectiveDuration,
    reason,
  });

  console.warn(`\n🚨 [SECURITY SHIELD ALERT] IP: ${ip} ĐÃ BỊ CHẶN (${Math.round(effectiveDuration / 1000)}s)! Lý do: ${reason}`);
  logSecurityEvent(SecurityEvent.WAF_BLOCKED, null, { ip, durationSeconds: Math.round(effectiveDuration / 1000), reason });
};

/**
 * Check if IP is currently banned
 */
export const isIpBanned = (ip) => {
  const info = bannedIPs.get(ip);
  if (!info) return false;
  if (Date.now() > info.bannedUntil) {
    bannedIPs.delete(ip);
    return false;
  }
  return true;
};

/**
 * General API Sliding Window Rate Limiter (e.g., 120 req / minute)
 */
export const apiRateLimiter = (maxRequests = 120, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = getClientIp(req);
    if (isIpBanned(ip)) {
      return res.status(404).end();
    }

    const now = Date.now();
    const timestamps = generalRateTracker.get(ip) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, req, {
        path: req.originalUrl,
        count: recent.length,
        limit: maxRequests,
      });

      // Temporary 1-minute ban for aggressive flooding
      if (recent.length >= maxRequests * 2) {
        banIp(ip, 60000, `Excessive API flooding (${recent.length} reqs in 60s)`);
        return res.status(404).end();
      }

      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        message: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
      });
    }

    recent.push(now);
    generalRateTracker.set(ip, recent);
    next();
  };
};

/**
 * Strict Auth Rate Limiter for Login/Register/Reset (e.g., max 10 attempts per minute)
 */
export const authRateLimiter = (maxAttempts = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = getClientIp(req);
    if (isIpBanned(ip)) {
      return res.status(404).end();
    }

    const now = Date.now();
    const timestamps = authRateTracker.get(ip) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxAttempts) {
      logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, req, {
        path: req.originalUrl,
        count: recent.length,
        limit: maxAttempts,
      });

      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu đăng nhập/xác thực từ thiết bị của bạn. Vui lòng đợi 1 phút.',
      });
    }

    recent.push(now);
    authRateTracker.set(ip, recent);
    next();
  };
};

// Known penetration testing & scanner User-Agents
const MALICIOUS_USER_AGENTS = [
  'gobuster',
  'dirbuster',
  'ffuf',
  'wfuzz',
  'nikto',
  'sqlmap',
  'nmap',
  'masscan',
  'wpscan',
  'zgrab',
  'openvas',
  'nessus',
  'acunetix',
  'burpcollaborator',
];

// Honeypot paths: Any request attempting to access these is an automated vulnerability scanner
const HONEYPOT_REGEX = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.svn/i,
  /\/\.aws/i,
  /\/\.ssh/i,
  /\/\.config/i,
  /\/\.htaccess/i,
  /\/\.htpasswd/i,
  /\/\.ds_store/i,
  /\/\.vscode/i,
  /\/\.idea/i,
  /\.(bak|backup|old|orig|save|swp|sql|tar|gz|tgz|zip|rar|7z)(\?|$)/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/wp-includes/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/adminer/i,
  /\/mysqladmin/i,
  /\/actuator/i,
  /\/swagger/i,
  /\/v2\/api-docs/i,
  /\/solr/i,
  /\/telescope/i,
  /\/boaform/i,
  /\/cgi-bin/i,
  /\/shell/i,
  /\/cmd/i,
  /\/eval/i,
  /\/debug\/default\/view/i,
];

/**
 * Main Web Application Firewall & Honeypot Middleware
 */
export const honeypotShield = (req, res, next) => {
  const ip = getClientIp(req);
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const path = req.originalUrl || req.url;

  // 1. Check if IP is currently blacklisted
  if (isIpBanned(ip)) {
    return res.status(404).end();
  }

  // 2. Check for malicious Scanner User-Agents
  for (const bot of MALICIOUS_USER_AGENTS) {
    if (userAgent.includes(bot)) {
      banIp(ip, 24 * 60 * 60 * 1000, `Scanner Bot User-Agent detected: "${userAgent}"`);
      return res.status(404).end();
    }
  }

  // 3. Check for Honeypot trap paths
  for (const regex of HONEYPOT_REGEX) {
    if (regex.test(path)) {
      banIp(ip, 24 * 60 * 60 * 1000, `Honeypot trap triggered on path: "${path}"`);
      return res.status(404).end();
    }
  }

  // 4. Inject Comprehensive HTTP Security Headers
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Enforce HSTS in production (HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Anti-Directory Fuzzing Tracker
 * Called when an unhandled route generates a 404
 */
export const recordNotFound = (req) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = notFoundTracker.get(ip) || [];

  const recent = timestamps.filter((t) => now - t < 30000);
  recent.push(now);
  notFoundTracker.set(ip, recent);

  // If >= 8 404s in 30 seconds -> automated directory scanner!
  if (recent.length >= 8) {
    banIp(ip, 2 * 60 * 60 * 1000, `Directory fuzzing / scanning detected (>8 404s in 30s)`);
    return true;
  }
  return false;
};

/**
 * Generic Fake 404 HTML template (disguised as standard non-existent page)
 */
export const getFakeNotFoundHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>404 Not Found</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 50px 20px; text-align: center; color: #333; background: #fff;">
  <h1 style="font-size: 2.2rem; margin-bottom: 8px;">404 Not Found</h1>
  <p style="font-size: 1rem; color: #666;">The requested URL was not found on this server.</p>
  <hr style="max-width: 450px; margin: 24px auto; border: 0; border-top: 1px solid #e2e8f0;">
  <div style="font-size: 0.8rem; color: #94a3b8;">Server at localhost</div>
</body>
</html>`;
