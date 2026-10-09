import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sseService } from '../services/sseService.js';

const router = express.Router();

/**
 * SSE Endpoint: Realtime stream for Admin Portal
 * Connects via EventSource with token in query param: /api/realtime/admin?token=...
 */
router.get('/admin', async (req, res) => {
  try {
    const rawToken = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'Thiếu mã xác thực (Token)' });
    }

    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.userId).select('role isBanned tokenVersion');

    if (!user || user.role !== 'admin' || user.isBanned) {
      return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối' });
    }

    sseService.subscribeAdmin(req, res);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});

/**
 * SSE Endpoint: Live Tracking for an individual order
 * Connects via EventSource: /api/realtime/order/:orderCode
 */
router.get('/order/:orderCode', (req, res) => {
  const { orderCode } = req.params;
  if (!orderCode || typeof orderCode !== 'string') {
    return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
  }

  sseService.subscribeOrder(orderCode, req, res);
});

/**
 * SSE Diagnostics & Metrics
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: sseService.getStats(),
  });
});

export default router;
