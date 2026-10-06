import express from 'express';
import {
  createVNPayUrl,
  createMoMoUrl,
  vnpayReturn,
  momoReturn,
  momoIPN,
} from '../controllers/paymentController.js';

const router = express.Router();

// Generate payment URLs
router.post('/create-vnpay-url', createVNPayUrl);
router.post('/create-momo-url', createMoMoUrl);

// Gateways Return & Webhooks
router.get('/vnpay-return', vnpayReturn);
router.get('/momo-return', momoReturn);
router.post('/momo-ipn', momoIPN);

export default router;
