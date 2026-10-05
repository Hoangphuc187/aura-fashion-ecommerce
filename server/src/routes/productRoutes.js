import express from 'express';
import {
  getProducts,
  getFeaturedAndTrending,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFilterMetadata,
} from '../controllers/productController.js';
import { protect, stealthAdminProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedAndTrending);
router.get('/filters', getFilterMetadata);
router.get('/:id', getProductByIdOrSlug);

// Reviews
router.post('/:id/reviews', protect, addReview);

// Admin product management (Stealth cloaked with 404 on unauthorized)
router.post('/', stealthAdminProtect, createProduct);
router.put('/:id', stealthAdminProtect, updateProduct);
router.delete('/:id', stealthAdminProtect, deleteProduct);

export default router;
