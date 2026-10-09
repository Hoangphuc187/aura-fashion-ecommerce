/**
 * AURA Security Audit Logger
 * Records security-sensitive operations with timestamps, IP addresses, and context.
 */

import { getClientIp } from '../middleware/securityShield.js';

export const SecurityEvent = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  WAF_BLOCKED: 'WAF_BLOCKED',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
};

export const logSecurityEvent = (eventType, req, details = {}) => {
  const ip = req ? getClientIp(req) : 'INTERNAL';
  const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown' : 'INTERNAL';
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    eventType,
    ip,
    userAgent: userAgent.substring(0, 150),
    ...details,
  };

  // Safe logging without leaking sensitive passwords/tokens
  const sanitizedDetails = { ...details };
  delete sanitizedDetails.password;
  delete sanitizedDetails.newPassword;
  delete sanitizedDetails.token;

  console.log(`🛡️ [AUDIT] ${timestamp} | [${eventType}] | IP: ${ip} | Details:`, JSON.stringify(sanitizedDetails));
};
