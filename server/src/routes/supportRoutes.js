import express from 'express';
import {
  getFaqList,
  createTicket,
  getMyTickets,
  getTicketByCode,
  getAllTickets,
  replyAndCloseTicket,
} from '../controllers/supportController.js';
import { protect, optionalProtect, stealthAdminProtect } from '../middleware/auth.js';

const router = express.Router();

// Public: Get FAQ list
router.get('/faq', getFaqList);

// Public / Authenticated: Submit contact inquiry or support ticket
router.post('/tickets', optionalProtect, createTicket);

// Public: Lookup ticket by code
router.get('/tickets/lookup/:code', getTicketByCode);

// Authenticated Customer: Get their own tickets
router.get('/tickets/my', protect, getMyTickets);

// Stealth Admin: Get all tickets & update / reply to ticket
router.get('/tickets', stealthAdminProtect, getAllTickets);
router.put('/tickets/:id/reply', stealthAdminProtect, replyAndCloseTicket);

export default router;
