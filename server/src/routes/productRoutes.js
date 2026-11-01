import express from 'express';
import {
  getProducts,
  getFeaturedAndTrending,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  checkReviewEligibility,
  getFilterMetadata,
  getAllReviewsAdmin,
  deleteReviewAdmin,
} from '../controllers/productController.js';
import { protect, stealthAdminProtect } from '../middleware/auth.js';
import { validateDto } from '../dtos/validator.js';
import { CreateProductDtoSchema } from '../dtos/product.dto.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedAndTrending);
router.get('/filters', getFilterMetadata);

// Admin review moderation (placed before /:id)
router.get('/admin/reviews', stealthAdminProtect, getAllReviewsAdmin);
router.delete('/:productId/reviews/:reviewId', stealthAdminProtect, deleteReviewAdmin);

// Reviews
router.get('/:id/review-eligibility', protect, checkReviewEligibility);
router.post('/:id/reviews', protect, addReview);

// Specific product by ID or Slug or SKU UUID
router.get('/:id', getProductByIdOrSlug);

// Admin product management (Stealth cloaked with 404 on unauthorized)
router.post('/', stealthAdminProtect, validateDto(CreateProductDtoSchema), createProduct);
router.put('/:id', stealthAdminProtect, updateProduct);
router.delete('/:id', stealthAdminProtect, deleteProduct);

export default router;
